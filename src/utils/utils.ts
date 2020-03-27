import fs from 'fs';
import os from 'os';
import inlineCss from 'inline-css';
import plist, { PlistArray } from 'plist';
const prompt = require('select-prompt');
const xattr = require('fs-xattr');

import { logError, logWarn } from './log';
import { PersistenceInfo, SignatureInfo, AccountMap } from './interfaces';
import { fileDefaults } from './enums';

const BASE_DIR: string = process.env.LOCAL_HOME_DIR
  ? 'test-drive/home-drive'
  : os.homedir();

/**
 * determine the current used base path
 * for storing mail signatures in apple mail
 */
export const getBasePath = (mailDir?: string): string => {
  if (mailDir === 'container') {
    mailDir = `${BASE_DIR}/Library/Containers/com.apple.mail/Data/Library/Mail`;
  }
  const baseDir = mailDir || `${BASE_DIR}/Library/Mail`;
  const persistenceInfoPath = `${baseDir}/${fileDefaults.persistenceInfo}`;
  const persistenceInfoParsed = (plist.parse(
    fs.readFileSync(persistenceInfoPath, 'utf8'),
  ) as unknown) as PersistenceInfo;
  return `${baseDir}/${persistenceInfoParsed.LastUsedVersionDirectoryName}/MailData/Signatures`;
};

/**
 * add a signature entry to the file containing all signatures
 * @param uuid the uuid for the signature to be added
 */
export const addSignatureToAllSignatures = (
  uuid: string,
  name: string,
  mailDir?: string,
) => {
  const allSignaturesParsed = (plist.parse(
    fs.readFileSync(
      `${getBasePath(mailDir)}/${fileDefaults.allSignatures}`,
      'utf8',
    ),
  ) as unknown) as SignatureInfo[];

  if (
    allSignaturesParsed.find(
      (signature) => signature.SignatureUniqueId === uuid,
    )
  ) {
    logError(`Signature with unique ID "${uuid}" already exists`);
    process.exit(1);
  }
  const dictJson: PlistArray = [
    ...(allSignaturesParsed as {}[]),
    {
      SignatureIsRich: false,
      SignatureName: name,
      SignatureUniqueId: uuid,
    },
  ];
  const plistResult = plist.build(dictJson);
  fs.writeFileSync(
    `${getBasePath()}/${fileDefaults.allSignatures}`,
    plistResult,
    'utf8',
  );
};

/**
 * Promt the user to select the account to which the signature will be added
 * @param uuid the uuid for the signature to be added
 */
export const addSignatureToAccount = (
  uuid: string,
  mailDir?: string,
): Promise<void> => {
  const accountMapParsed = (plist.parse(
    fs.readFileSync(
      `${getBasePath(mailDir)}/${fileDefaults.accountMap}`,
      'utf8',
    ),
  ) as unknown) as AccountMap;

  return new Promise((resolve) => {
    const accounts = [];
    for (let [key, value] of Object.entries(accountMapParsed)) {
      accounts.push({
        title: value.AccountURL.replace('%40', '@'),
        value: key,
      });
    }
    prompt('To which account you want to add this signature?', accounts)
      .on('abort', (v: string) => {
        logWarn('No account selected. No signature added.');
        process.exit(2);
      })
      .on('submit', (v: string) => {
        if (accountMapParsed[v].Signatures.includes(uuid)) {
          logWarn(
            `Signature with unique ID "${uuid}" is already linked with account ${accountMapParsed[v].AccountURL}. Action skipped.`,
          );
        } else {
          accountMapParsed[v].Signatures.push(uuid);
        }
        const plistResult = plist.build(
          // workaround because of wrong type matching
          JSON.parse(JSON.stringify(accountMapParsed)),
        );
        fs.writeFileSync(
          `${getBasePath()}/${fileDefaults.accountMap}`,
          plistResult,
          'utf8',
        );
        resolve();
      });
  });
};

/**
 * create the mail signature file
 * @param uuid the uuid for the signature to be added
 * @param templateFilePath the template file to be used
 */
export const createMailSignature = async (
  uuid: string,
  templateFilePath: string,
  update = false,
  mailDir?: string,
) => {
  const filePath = `${getBasePath(mailDir)}/${uuid}.mailsignature`;
  if (!update && fs.existsSync(filePath)) {
    logError(`Signature file "${uuid}.mailsignature" already exists`);
    process.exit(1);
  }
  const htmlTemplate = fs.readFileSync(templateFilePath, 'utf8');
  let inlinedHtml = await inlineCss(htmlTemplate, {
    url: ' ',
    removeStyleTags: true,
    removeLinkTags: true,
  });
  inlinedHtml = inlinedHtml
    .replace(/(.|\n)*<body.*>/, '') // replace everything until "body>"
    .replace(/<\/body(.|\n)*/g, ''); // replace everything before "</body"

  const fileContent = `Content-Transfer-Encoding: quoted-printable
Content-Type: text/html;
  charset=utf-8
Mime-Version: 1.0

<body>${inlinedHtml}</body>
`;

  fs.writeFileSync(filePath, fileContent, 'utf8');
  await xattr.set(filePath, 'com.apple.quarantine', new Buffer(19));
};

/**
 * Find an existing signature by it's name
 * @param name the signature name
 */
export const getSignatureIdByName = (
  name: string,
  mailDir?: string,
): string => {
  const allSignaturesParsed = (plist.parse(
    fs.readFileSync(
      `${getBasePath(mailDir)}/${fileDefaults.allSignatures}`,
      'utf8',
    ),
  ) as unknown) as SignatureInfo[];

  const signatureToBeRemoved = allSignaturesParsed.find(
    (signature) => signature.SignatureName === name,
  );

  if (!signatureToBeRemoved) {
    logError(`The signature with the name "${name}" doesn't exist`);
    process.exit(1);
  }

  return signatureToBeRemoved.SignatureUniqueId;
};

/**
 * Delete an existing mail signature
 * @param name the name for the signature that should be deleted
 */
export const removeSignatureFromAllSignatures = (
  name: string,
  mailDir?: string,
): string => {
  const allSignaturesParsed = (plist.parse(
    fs.readFileSync(
      `${getBasePath(mailDir)}/${fileDefaults.allSignatures}`,
      'utf8',
    ),
  ) as unknown) as SignatureInfo[];

  const signatureToBeRemoved = getSignatureIdByName(name);
  const filteredSignatures = allSignaturesParsed.filter(
    (signature) => signature.SignatureName !== name,
  );
  const dictJson: PlistArray = filteredSignatures as {}[];
  const plistResult = plist.build(dictJson);
  fs.writeFileSync(
    `${getBasePath(mailDir)}/${fileDefaults.allSignatures}`,
    plistResult,
    'utf8',
  );
  return signatureToBeRemoved;
};

/**
 * remove an existing mail signature file
 * @param uuid the uuid for the signature to be removed
 */
export const removeMailSignature = (uuid: string, mailDir?: string) => {
  fs.unlinkSync(`${getBasePath(mailDir)}/${uuid}.mailsignature`);
};

/**
 * Promt the user to select the account to which the signature will be added
 * @param uuid the uuid for the signature to be added
 */
export const removeSignatureFromAccount = (uuid: string, mailDir?: string) => {
  const accountMapParsed = (plist.parse(
    fs.readFileSync(
      `${getBasePath(mailDir)}/${fileDefaults.accountMap}`,
      'utf8',
    ),
  ) as unknown) as AccountMap;

  for (let account of Object.values(accountMapParsed)) {
    account.Signatures = account.Signatures.filter((v) => v !== uuid);
  }

  const plistResult = plist.build(
    // workaround because of wrong type matching
    JSON.parse(JSON.stringify(accountMapParsed)),
  );
  fs.writeFileSync(
    `${getBasePath(mailDir)}/${fileDefaults.accountMap}`,
    plistResult,
    'utf8',
  );
};

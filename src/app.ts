#!/usr/bin/env node

/**
 * The above line is needed to be able to run in npx and CI.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import inlineCss from 'inline-css';
import plist, { PlistValue, PlistArray } from 'plist';
import yargs, { Argv } from 'yargs';
import { v4 as uuid } from 'uuid';
const prompt = require('select-prompt');

import { logError, logWarn } from './utils/log';

const BASE_DIR: string = process.env.LOCAL_HOME_DIR
  ? 'test-drive/home-drive'
  : os.homedir();

enum fileDefaults {
  accountMap = 'AccountsMap.plist',
  allSignatures = 'AllSignatures.plist',
  persistenceInfo = 'PersistenceInfo.plist',
}

interface PersistenceInfo {
  LastUsedVersionDirectoryName: string;
  VersionDirectoryIdentifiers: {
    [key: string]: string;
  };
}

interface SignatureInfo {
  SignatureIsRich: boolean;
  SignatureName: string;
  SignatureUniqueId: string;
}

interface AccountMap {
  [key: string]: Account;
}

interface Account {
  AccountURL: string;
  Signatures: string[];
}

/**
 * determine the current used base path
 * for storing mail signatures in apple mail
 */
const getBasePath = (mailDir?: string): string => {
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
const addSignatureToAllSignatures = (uuid: string, name: string) => {
  const allSignaturesParsed = (plist.parse(
    fs.readFileSync(`${getBasePath()}/${fileDefaults.allSignatures}`, 'utf8'),
  ) as unknown) as Array<SignatureInfo>;

  if (
    allSignaturesParsed.find(
      (signature) => signature.SignatureUniqueId === uuid,
    )
  ) {
    logError(`Signature with unique ID "${uuid}" already exists`);
    process.exit(1);
  }
  const dictJson: PlistArray = [
    ...(allSignaturesParsed as Array<{}>),
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
const addSignatureToAccount = (uuid: string): Promise<void> => {
  const accountMapParsed = (plist.parse(
    fs.readFileSync(`${getBasePath()}/${fileDefaults.accountMap}`, 'utf8'),
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
const createMailSignature = async (uuid: string, templateFilePath: string) => {
  const filePath = `${getBasePath()}/${uuid}.mailsignature`;
  if (fs.existsSync(filePath)) {
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
    .replace(/<\/body(.|\n)*/g, '') // replace everything before "</body
    .replace(/(\r\n|\n|\r)/gm, ''); // replace line breaks

  const fileContent = `Content-Transfer-Encoding: quoted-printable
Content-Type: text/html;
  charset=utf-8
Mime-Version: 1.0

<body>${inlinedHtml}</body>`;

  fs.writeFileSync(filePath, fileContent, 'utf8');
};

/**
 * Create a new mail signature from an HTML template
 * @param path the HTML template file path
 */
const createSignature = async (path: string, name: string) => {
  if (!name) {
    logError(
      `No name for the signature provided (see usage by running "npx a-mail-signature --help")`,
    );
    process.exit(1);
  }

  const signatureUuid = uuid().toUpperCase();
  createMailSignature(signatureUuid, path);
  addSignatureToAllSignatures(signatureUuid, name);
  await addSignatureToAccount(signatureUuid);
};

yargs
  .scriptName('a-mail-signature')
  .command({
    command: 'create [path] [name]',
    aliases: ['c', 'add', 'a'],
    describe: 'Create a signature from an HTML file',
    handler: (args: { path: string; name: string }) => {
      createSignature(args.path, args.name);
    },
  })
  /*
  .command({
    command: 'update [path]',
    aliases: ['u', 'modify', 'm'],
    describe: 'Update a signature from an HTML file',
    handler: (args: { path: string }) => {
      updateSignature(args.path);
    },
  })
  .command({
    command: 'delete [name]',
    aliases: ['d', 'remove', 'rm', 'r'],
    describe: 'Delete an existing mail signature',
    handler: (args: { name: string }) => {
      deleteSignature(args.name);
    },
  })
  */
  .wrap(100)
  .demandCommand(2)
  .help().argv;

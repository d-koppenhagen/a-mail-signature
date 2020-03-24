import { v4 as uuid } from 'uuid';

import { logError } from './utils/log';
import {
  createMailSignature,
  addSignatureToAllSignatures,
  addSignatureToAccount,
  getSignatureIdByName,
} from './utils/utils';

/**
 * Update an existing new mail signature from an HTML template
 * @param path the HTML template file path
 */
export const updateSignature = async (path: string, name: string) => {
  if (!name) {
    logError(
      `No name for the signature provided (see usage by running "npx a-mail-signature --help")`,
    );
    process.exit(1);
  }

  const signatureUuid = getSignatureIdByName(name);
  createMailSignature(signatureUuid, path, true);
};

import { v4 as uuid } from 'uuid';

import { logError } from './utils/log';
import {
  createMailSignature,
  addSignatureToAllSignatures,
  addSignatureToAccount,
} from './utils/utils';

/**
 * Create a new mail signature from an HTML template
 * @param path the HTML template file path
 */
export const createSignature = async (path: string, name: string) => {
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

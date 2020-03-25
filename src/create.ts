import { v4 as uuid } from 'uuid';

import { argNotProvided } from './utils/log';
import {
  createMailSignature,
  addSignatureToAllSignatures,
  addSignatureToAccount,
} from './utils/utils';

/**
 * Create a new mail signature from an HTML template
 * @param path the HTML template file path
 */
export const createSignature = async (name: string, path: string) => {
  if (!name) {
    argNotProvided('name');
    process.exit(1);
  }
  if (!path) {
    argNotProvided('path');
    process.exit(1);
  }
  const signatureUuid = uuid().toUpperCase();
  createMailSignature(signatureUuid, path);
  addSignatureToAllSignatures(signatureUuid, name);
  await addSignatureToAccount(signatureUuid);
};

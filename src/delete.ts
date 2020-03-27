import { argNotProvided } from './utils/log';
import {
  removeSignatureFromAllSignatures,
  removeMailSignature,
  removeSignatureFromAccount,
} from './utils/utils';

/**
 * Delete an existing mail signature @param name the name of the signature
 */
export const deleteSignature = async (name: string, mailDir?: string) => {
  if (!name) {
    argNotProvided('name');
    process.exit(1);
  }
  const signatureUuid = removeSignatureFromAllSignatures(name, mailDir);
  removeMailSignature(signatureUuid, mailDir);
  removeSignatureFromAccount(signatureUuid, mailDir);
};

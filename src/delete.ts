import { argNotProvided } from './utils/log';
import {
  removeSignatureFromAllSignatures,
  removeMailSignature,
  removeSignatureFromAccount,
} from './utils/utils';

/**
 * Delete an existing mail signature @param name the name of the signature
 */
export const deleteSignature = async (name: string) => {
  if (!name) {
    argNotProvided('name');
    process.exit(1);
  }
  const signatureUuid = removeSignatureFromAllSignatures(name);
  removeMailSignature(signatureUuid);
  removeSignatureFromAccount(signatureUuid);
};

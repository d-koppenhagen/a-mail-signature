import { logError } from './utils/log';

/**
 * Delete an existing mail signature @param name the name of the signature
 */
export const deleteSignature = async (name: string) => {
  if (!name) {
    logError(
      `No name for the signature provided (see usage by running "npx a-mail-signature --help")`,
    );
    process.exit(1);
  }

  //   const signatureUuid = removeSignatureFromAllSignatures(name);
  //   removeMailSignature(signatureUuid);
  //   removeSignatureFromAccount(signatureUuid);
};

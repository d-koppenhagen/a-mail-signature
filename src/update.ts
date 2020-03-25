import { argNotProvided } from './utils/log';
import { createMailSignature, getSignatureIdByName } from './utils/utils';

/**
 * Update an existing new mail signature from an HTML template
 * @param path the HTML template file path
 */
export const updateSignature = async (name: string, path: string) => {
  if (!name) {
    argNotProvided('name');
    process.exit(1);
  }
  if (!path) {
    argNotProvided('path');
    process.exit(1);
  }
  const signatureUuid = getSignatureIdByName(name);
  createMailSignature(signatureUuid, path, true);
};

export interface PersistenceInfo {
  LastUsedVersionDirectoryName: string;
  VersionDirectoryIdentifiers: {
    [key: string]: string;
  };
}

export interface SignatureInfo {
  SignatureIsRich: boolean;
  SignatureName: string;
  SignatureUniqueId: string;
}

export interface AccountMap {
  [key: string]: Account;
}

export interface Account {
  AccountURL: string;
  Signatures: string[];
}

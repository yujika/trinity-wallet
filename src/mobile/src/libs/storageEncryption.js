import StorageNativeCrypto from 'shared-modules/storage/nativeCrypto';
import { getRandomBytes, Int8ToString } from 'libs/crypto';
import { keychain, createAndStoreBoxInKeychain, getSecretBoxFromKeychainAndOpenIt } from 'libs/keychain';

const ALIAS_STORAGE = 'storage';

export default class MobileNativeCrypto extends StorageNativeCrypto {
    constructor() {
        super(getRandomBytes);
    }

    async generateEncryptionKey() {
        return await super.generateEncryptionKey();
    }

    async addEncryptionKeyToKeychain(passwordHash, key) {
        const keyString = Int8ToString(key);
        return await createAndStoreBoxInKeychain(passwordHash, keyString, ALIAS_STORAGE);
    }

    async getEncryptionKeyFromKeychain(passwordHash) {
        return await getSecretBoxFromKeychainAndOpenIt(ALIAS_STORAGE, passwordHash);
    }

    async removeEncryptionKeyFromKeychain() {
        return await keychain.clear(ALIAS_STORAGE);
    }
}

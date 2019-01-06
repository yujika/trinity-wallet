/* global Electron */
import StorageNativeCrypto from 'libs/storage/nativeCrypto';
import { asyncRandomBytes, encrypt, decrypt, ACC_MAIN } from 'libs/crypto';

export default class DesktopNativeCrypto extends StorageNativeCrypto {
    constructor() {
        super(asyncRandomBytes);
    }

    generateEncryptionKey() {
        return super.generateEncryptionKey();
    }

    async addEncryptionKeyToKeychain(passwordHash, key) {
        try {
            const vault = await Electron.readKeychain(ACC_MAIN);
            const decryptedVault = vault === null ? {} : await decrypt(vault, passwordHash);

            if (key) {
                decryptedVault.twoFaKey = key;
            } else {
                delete decryptedVault.twoFaKey;
            }

            const updatedVault = await encrypt(decryptedVault, passwordHash);

            await Electron.setKeychain(ACC_MAIN, updatedVault);

            return true;
        } catch (err) {
            throw err;
        }
    }
}

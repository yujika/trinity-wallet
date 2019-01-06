/**
 * Holds crypto-related native functions for storage encryption
 */
export default class StorageNativeCrypto {
    /**
     * Initialises a StorageNativeCrypto object
     * @param {function(number): Promise<Uint8Array>} randomBytesFn      Random bytes generator
     */
    constructor(randomBytesFn) {
        this.randomBytesFn = randomBytesFn;
    }

    /**
     * Generate a 64-byte encryption key
     * @return {Promise<Int8Array>}               Encryption key
     */
    generateEncryptionKey() {
        return this.randomBytesFn(64).then((bytes) => {
            const signed = new Int8Array(bytes);
            return signed;
        });
    }

    // Methods to be implemented

    // addEncryptionKeyToKeychain(passwordHash: string, key: Int8Array) -> Promise
    // getEncryptionKeyFromKeychain(passwordHash: string) -> Promise<Object>
    // removeEncryptionKeyFromKeychain() -> Promise
}

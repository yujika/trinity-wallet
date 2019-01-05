/**
 * Generate a 64-byte encryption key
 * @param  {StorageNativeCrypto} nativeCrypto StorageNativeCrypto object
 * @return {Int8Array}               Encryption key
 */
export const generateEncryptionKey = (nativeCrypto) => {
    return nativeCrypto.randomBytesFn(64).then((bytes) => {
        const signed = new Int8Array(bytes);
        return signed;
    });
};

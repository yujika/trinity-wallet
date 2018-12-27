/**
 * Holds crypto-related native functions for storage encryption
 */
export default class StorageNativeCrypto {
    /**
     * Initialises a StorageNativeCrypto object
     * @param {function(number): Promise<Uint8Array>} randomBytesFn      Random bytes generator
     * @param {function(string): Promise<Object>} getKeychainItemFn    Get an item from the keychain
     * @param {function(string, string): Promise<boolean>} setKeychainItemFn    Add an item to the keychain
     * @param {function(string): Promise<boolean>} removeKeychainItemFn Remove an item from the keychain
     */
    constructor(randomBytesFn, getKeychainItemFn, setKeychainItemFn, removeKeychainItemFn) {
        this.randomBytesFn = randomBytesFn;
        this.getKeychainItemFn = getKeychainItemFn;
        this.setKeychainItemFn = setKeychainItemFn;
        this.removeKeychainItemFn = removeKeychainItemFn;
    }
}

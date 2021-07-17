/**
 * Cache service definition layer
 */
const { CacheModel } = require( '../models' );
const { formatKey, getExpiration } = require( '../utils' );

const _inMemoryStore = Symbol(); // helps to create a private store..

class CacheService {

    static [_inMemoryStore] = new Map(); // static in-memory store.

    /**
     * Set data to cache
     * @param key
     * @param value
     * @param duration (duration is set in secs)
     * @returns {Promise<Boolean>}
     */
    static async set(key, value, duration = 0) {
        const _key = formatKey( key );
        const expiration = getExpiration( duration );
        const cache = await CacheModel.save( { key: _key, value, expiration } ).exec();
        this[_inMemoryStore].set( _key, cache ); // store record in in-memory for easy retrieval
        return true;
    }

    /**
     * Update data in cache
     * @param key
     * @param value
     * @param duration
     * @returns {Promise<Boolean>}
     */
    static async put(key, value, duration = 0) {
        const _key = formatKey( key );
        const expiration = getExpiration( duration );
        const doc = { $set: { value, expiration } };
        const cache = await CacheModel.findOneAndUpdate( { key: _key }, doc, { new: true } ).exec();
        this[_inMemoryStore].set( _key, cache );  // update record in in-memory for easy retrieval
        return true;
    }

    /**
     * Get all data from cache
     * @returns {Promise<Array>}
     */
    static async getAll() {
    }

    /**
     * Get data from cache
     * @param key
     * @returns {Promise<Object>}
     */
    static async get(key) {
        const _key = formatKey( key );
        let cache = null;
        if ( this[_inMemoryStore].has( _key ) ) {
            cache = this[_inMemoryStore].get( _key );
            return cache?.value || null;
        }
        cache = await CacheModel.findOne( { key: _key } ).exec();
        return cache?.value || null;
    }

    /**
     * Get data from cache
     * @param key
     * @returns {Promise<{isExpired: Boolean}>}
     */
    static async getStatus(key) {
        const _key = formatKey( key );
        return { isExpired: !this[_inMemoryStore].has( _key ) };
    }

    /**
     * Remove data from cache
     * @param key
     * @returns {Promise<Boolean>}
     */
    static async remove(key) {
        const _key = formatKey( key );
        if ( this[_inMemoryStore].has( _key ) ) {
            return this[_inMemoryStore].delete( _key );
        }
        await CacheModel.deleteOne( _key ).exec();
        return true;
    }

    /**
     * Remove all data from cache
     * @returns {Promise<Boolean>}
     */
    static async flush() {
        this[_inMemoryStore].clear();
        await CacheModel.deleteMany( {} ).exec();
        return true;
    }


}

module.exports = CacheService;

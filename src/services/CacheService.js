/**
 * Cache service definition layer
 */
const { CacheModel } = require( '../models' );
const { formatKey, getExpiration, paginatedQuery, getISODate, isCacheExist } = require( '../utils' );

const _inMemoryStore = Symbol(); // helps to create a private store..
const _getFromInMemory = Symbol(); // helps to create a private get memory key..

class CacheService {

    /***
     *
     *
     *  Private fields and methods Declaration
     *
     */

    static [_inMemoryStore] = new Map(); // static in-memory store.

    /**
     *  Fetch record from the in-memory with expiration put in consideration.
     * @param key
     * @returns {*|null}
     */
    static [_getFromInMemory](key) {

        if ( this[_inMemoryStore].has( key ) ) {
            const cache = this[_inMemoryStore].get( key );
            const value = cache?.value;

            // used in case scheduler is yet to delete expired records
            if ( isCacheExist( cache.expiration, Date.now() ) ) {
                return value || null;
            }

        }

        return null;
    }


    /***
     *
     *  Public Methods Declaration.
     *
     */

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
     * @returns {Promise<{totalRecords: number, limit: number, page: number, totalPages: number, results: Map}>}
     */
    static async getAll(req) {
        const currentDate = getISODate();
        const query = { expiration: { $gte: currentDate } };
        const records = await paginatedQuery( req, CacheModel, query, { sort: { expiration: -1 } } );

        // return result in map as the standard cache storage mechanism.
        records.results = records.results.reduce( (result, cache) => {
            const { key, expiration, value } = cache;
            const _key = key.replace( process.env.CACHE_KEY, '' );
            result.set( _key, { value, expiration } );
            return result;
        }, new Map() );

        return records;
    }

    /**
     * Get data from cache
     * @param key
     * @returns {Promise<*>}
     */
    static async get(key) {
        const _key = formatKey( key );
        const record = this[_getFromInMemory]( _key );
        if ( record ) {
            return record;
        }

        const currentDate = getISODate();
        const cache = await CacheModel.findOne( { key: _key, expiration: { $gte: currentDate } } ).exec();
        return cache?.value || null;
    }

    /**
     * Get data from cache
     * @param key
     * @returns {Promise<{isExpired: Boolean}>}
     */
    static async getStatus(key) {
        const _key = formatKey( key );
        const record = this[_getFromInMemory]( _key );
        if ( record ) {
            return { isExpired: false };
        }

        const currentDate = getISODate();
        const count = await CacheModel.countDocument( { key: _key, expiration: { $gte: currentDate } } ).exec();
        return { isExpired: count <= 0 };
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

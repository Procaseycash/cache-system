/**
 * Cache service definition layer
 */

const { CacheModel } = require( '../models' );
const { formatKey, getExpiration, paginatedQuery, getISODate, isCacheExist } = require( '../utils' );
const { Messages } = require( '../configs' );

// Private fields' keys
const _inMemoryStore = Symbol(); // helps to create a private store..
const _getFromInMemory = Symbol(); // helps to create a private get memory key..
const _updateAccessedRecord = Symbol(); // helps to create a private get memory key..

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

    /**
     * This is used to update the record updatedAt once it is accessed by getAll, getStatus or get.
     * @param keys
     * @returns {Promise|Promise<ResultType>|Promise<R>|any|void|never|ChildProcess|RegExpExecArray}
     */
    static [_updateAccessedRecord](keys = []) {
        return CacheModel.updateMany( { key: { $in: keys } }, { $set: { updated_at: getISODate() } } ).exec();
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
        if ( this[_inMemoryStore].has( _key ) ) {
            throw new Error( Messages.error.keyExist );
        }
        const expiration = getExpiration( duration );
        const cache = await CacheModel.create( { key: _key, value, expiration } );
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
        const query = { $or: [{ expiration: { $gte: currentDate } }, { expiration: null }] }; // used expiration in case scheduler is yet to delete expired records
        const options = { sort: { expiration: -1 }, selector: 'key value' };
        const records = await paginatedQuery( req, CacheModel, query, options );
        const keys = [];

        // return result in map as the standard cache storage mechanism.
        records.results = records.results.reduce( (result, cache) => {
            const { key, value } = cache;
            const _key = key.replace( process.env.CACHE_KEY, '' );
            result[_key] = value;
            keys.push( key );
            return result;
        }, {} );

        if ( keys.length > 0 ) {
            this[_updateAccessedRecord]( keys ); // update in background for all accessed records.
        }

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
            this[_updateAccessedRecord]( [_key] ); // update in background for all accessed records.
            return record;
        }

        const currentDate = getISODate();
        // used expiration in case scheduler is yet to delete expired records
        const cache = await CacheModel.findOne( { key: _key, expiration: { $gte: currentDate } } ).exec();

        if ( !cache ) {
            throw new Error( Messages.error.notFound );
        }

        this[_updateAccessedRecord]( [cache.key] ); // update in background for all accessed records.

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
            this[_updateAccessedRecord]( [_key] ); // update in background for all accessed records.
            return { isExpired: false };
        }

        const currentDate = getISODate();

        // used expiration in case scheduler is yet to delete expired records
        const count = await CacheModel.countDocuments( { key: _key, expiration: { $gte: currentDate } } ).exec();

        if ( count > 0 ) {
            this[_updateAccessedRecord]( [_key] ); // update in background for all accessed records.
        }

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
            this[_inMemoryStore].delete( _key );
        }
        await CacheModel.deleteOne( { key: _key } ).exec();
        return true;
    }

    /**
     * Remove all data from cache
     * @returns {Promise<Boolean>}
     */
    static async flush() {
        this[_inMemoryStore].clear();
        CacheModel.deleteMany( {} ).exec();
        return true;
    }

    /**
     * Remove all by keys
     * @returns {Promise<Boolean>}
     */
    static async removeAllByKeys(keys = []) {
        if ( keys.length <= 0 ) {
            throw new Error( Messages.error.noRecordToDelete );
        }

        keys = keys.map( key => {
            const _key = key.includes( process.env.CACHE_KEY ) ? key : formatKey( key );
            this[_inMemoryStore].delete( _key );
            return _key;
        } );
        
        await CacheModel.deleteMany( { key: { $in: keys } } ).exec();
        return true;
    }


}

module.exports = CacheService;

/**
 * Cache controller definition module.
 */

const { ResponseHandler } = require( '../dtos' );
const { CacheService } = require( '../services' );
const { Messages } = require( '../configs' );
const { success, error } = Messages;

class CacheController {

    /**
     * This is used to create an item in store
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async set(req, res) {
        try {
            const { key, duration, value } = req.body;
            const result = await CacheService.set( key, value, duration );
            ResponseHandler.success( res, result, success.set );
        } catch ( e ) {
            ResponseHandler.error( res, error.set( e ) );
        }
    }

    /**
     * This is used to update an item in store
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async put(req, res) {
        try {
            const { key, duration, value } = req.body;
            const result = await CacheService.put( key, value, duration );
            ResponseHandler.success( res, result, success.put );
        } catch ( e ) {
            ResponseHandler.error( res, error.put( e ) );
        }
    }

    /**
     * This is used to  retrieved all item in store
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async getAll(req, res) {
        try {
            const result = await CacheService.getAll( req );
            ResponseHandler.success( res, result, success.getAll );
        } catch ( e ) {
            ResponseHandler.error( res, error.getAll( e ) );
        }
    }

    /**
     * This is used to retrieve an item in store
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async get(req, res) {
        try {
            const key = req.params.key;
            const result = await CacheService.get( key );
            ResponseHandler.success( res, result, success.get );
        } catch ( e ) {
            ResponseHandler.error( res, error.get( e ) );
        }
    }

    /**
     * This is used to remove an item in store
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async remove(req, res) {
        try {
            const key = req.params.key;
            const result = await CacheService.remove( key );
            ResponseHandler.success( res, result, success.remove );
        } catch ( e ) {
            ResponseHandler.error( res, error.remove( e ) );
        }
    }

    /**
     * This is used to remove items base on query keys
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async removeAllByKeys(req, res) {
        try {
            const keys = (req.query.keys || '').split( ', ' );
            const result = await CacheService.removeAllByKeys( keys );
            ResponseHandler.success( res, result, success.removeAllByKeys );
        } catch ( e ) {
            ResponseHandler.error( res, error.removeAllByKeys( e ) );
        }
    }

    /**
     * This is used to remove all items in store
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async flush(req, res) {
        try {
            if ( req.query.keys ) {
                return CacheController.removeAllByKeys( req, res );
            }
            const result = await CacheService.flush();
            ResponseHandler.success( res, result, success.flush );
        } catch ( e ) {
            ResponseHandler.error( res, error.flush( e ) );
        }
    }

    /**
     * This is used to get status of an item in store
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    static async getStatus(req, res) {
        try {
            const key = req.params.key;
            const result = await CacheService.getStatus( key );
            ResponseHandler.success( res, result, success.status );
        } catch ( e ) {
            ResponseHandler.error( res, error.status( e ) );
        }
    }

}

module.exports = CacheController;

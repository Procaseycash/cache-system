/**
 * Router definition per service layer.
 */
const { CacheController } = require( '../controllers' );

class CacheRouter {

    constructor(app) {

        // API definition route for cache services
        const API_ROUTE = `${ process.env.API_BASE }caches`;

        app.route( API_ROUTE ).post( CacheController.set );

        app.route( `${ API_ROUTE }/:key` ).put( CacheController.put );

        app.route( API_ROUTE ).get( CacheController.getAll );

        app.route( `${ API_ROUTE }/:key` ).get( CacheController.get );

        app.route( `${ API_ROUTE }/:key/status` ).get( CacheController.getStatus );

        app.route( `${ API_ROUTE }/flush` ).delete( CacheController.flush );

        app.route( `${ API_ROUTE }/:key` ).delete( CacheController.remove );

    }
}

module.exports = CacheRouter;

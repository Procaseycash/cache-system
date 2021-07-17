/**
 * Route definition layer.
 */

const CacheRouter = require( './CacheRouter' );

class AppRoute {

    /**
     * Definition of all routes goes in here.
     * @param app
     */
    static init(app) {
        new CacheRouter( app );
    }

}

module.exports = AppRoute;

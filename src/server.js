/**
 * App initializer layer.
 */

require( 'dotenv' ).config();
const express = require( 'express' );
const mongoose = require( 'mongoose' );
const cookieParser = require( 'cookie-parser' );
const logger = require( 'morgan' );
const AppRoute = require( './routes' );
const { ScheduleService } = require( './services' );

/**
 * This is database setup layer.
 */
const setupDatabase = () => {
    mongoose.set( 'useCreateIndex', true );
    mongoose.connect( process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true } )
        .then( () => {

            console.info( 'MONGO_DB: Connected' );

            // start scheduling jobs
            ScheduleService.removeRecordsWithExpiration();
            ScheduleService.removeRecordsWithoutExpiration();

        } )
        .catch( e => {
            console.error( 'MONGODB_ERROR: ', e.stack );
        } );
};

/**
 * Application initialization stage.
 * @returns {*}
 */
const bootstrap = () => {
    const app = express();
    app.use( logger( 'dev' ) );
    app.use( express.json() );
    app.use( express.urlencoded( { extended: false } ) );
    app.use( cookieParser() );
    AppRoute.init( app ); // initialize app routing
    setupDatabase(); // initialize DB setup.
    return app;
};

module.exports = bootstrap();

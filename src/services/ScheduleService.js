/**
 * Scheduler Service definition
 */

const cron = require( 'node-cron' );
const { CacheModel } = require( '../models' );
const { getISODate } = require( '../utils' );
const { Messages } = require( '../configs' );
const CacheService = require( './CacheService' );

// private field key
const _removeRecordsWithExpiration = Symbol();
const _removeRecordsWithoutExpiration = Symbol();
const _deleteRecordsWithSchedular = Symbol();

class ScheduleService {


    /***
     *
     *  Private Fields and  Methods
     *
     *
     */

    static [_removeRecordsWithoutExpiration] = null;
    static [_removeRecordsWithExpiration] = null;


    /**
     * This is used to delete records from DB
     * @param query
     * @returns {Promise<void>}
     */
    static async [_deleteRecordsWithSchedular](query = {}) {
        const records = await CacheModel.find( query ).select( 'key' ).exec();
        const keys = records.map( r => r.key );
        await CacheService.removeAllByKeys( keys );
    }


    /***
     *
     *  Public Methods
     *
     */


    /**
     * Handle removal of cache items with expiration
     * Running at every n seconds base on interval
     * @returns {Promise<void>}
     */
    static async removeRecordsWithExpiration() {
        try {

            const interval = process.env.EXPIRATION_SCHEDULER;

            if ( this[_removeRecordsWithExpiration] ) { // cron schedule already running
                return;
            }

            console.info( `Initiated scheduler for cache with expiration ${ interval } ` );

            this[_removeRecordsWithExpiration] = cron.schedule( interval, async () => {

                try {

                    const currentDate = getISODate();

                    console.info( `Scheduler running for cache with expiration: interval: ${ interval }, current date:  ${ currentDate }` );

                    const query = { expiration: { $lte: currentDate } };
                    await this[_deleteRecordsWithSchedular]( query );

                } catch ( e ) {
                    if ( e.message.includes( Messages.error.noRecordToDelete ) ) {
                        return console.info( e.message );
                    }
                    console.error( 'Cache without expiration implementation error: ', e.stack );
                }


            } );
        } catch ( e ) {
            console.error( 'Cron Tab Running Error: ', e.stack );
        }
    }


    /**
     * A policy is configured to delete records without expiration after it has not been accessed/updated for about n days.
     * Running at every day at HH:MM time base on interval
     * @returns {Promise<void>}
     */
    static async removeRecordsWithoutExpiration() {
        try {

            const interval = process.env.EXPIRATION_POLICY_SCHEDULER;

            if ( this[_removeRecordsWithoutExpiration] ) { // cron schedule already running
                return;
            }

            console.info( `Initiated scheduler for cache without expiration ${ interval } ` );

            this[_removeRecordsWithoutExpiration] = cron.schedule( interval, async () => {

                try {

                    const hoursBefore = -1 * process.env.EXPIRATION_POLICY_DAYS * 24;
                    const dateBackTrack = getISODate( new Date().setHours( hoursBefore ) );

                    console.info( `Scheduler running for cache without expiration:: interval: ${ interval }, back track date: ${ dateBackTrack }` );
                    const query = { expiration: null, updated_at: { $lte: dateBackTrack } };
                    await this[_deleteRecordsWithSchedular]( query );

                } catch ( e ) {
                    if ( e.message.includes( Messages.error.noRecordToDelete ) ) {
                        return console.info( e.message );
                    }
                    console.error( 'Cache without expiration implementation error: ', e.stack );
                }

            } );

        } catch ( e ) {
            console.error( 'Cache without expiration cron tab starting error: ', e.stack );
        }

    }
}

module.exports = ScheduleService;

/**
 * Scheduler Service definition
 */

const cron = require( 'node-cron' );
const { CacheModel } = require( '../models' );
const { getISODate } = require( '../utils' );

// private field key
const _removeRecordsWithExpiration = Symbol();
const _removeRecordsWithoutExpiration = Symbol();

class ScheduleService {

    static [_removeRecordsWithoutExpiration] = null;
    static [_removeRecordsWithExpiration] = null;

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

                    await CacheModel.deleteMany( { expiration: { $lt: currentDate } } ).exec();

                } catch ( e ) {
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

                    await CacheModel.deleteMany( { expiration: null, updated_at: { $lte: dateBackTrack } } ).exec();

                } catch ( e ) {
                    console.error( 'Cache without expiration implementation error: ', e.stack );
                }

            } );

        } catch ( e ) {
            console.error( 'Cache without expiration cron tab starting error: ', e.stack );
        }

    }
}

module.exports = ScheduleService;

/**
 * Scheduler Service definition
 */

const cron = require( 'node-cron' );
const { CacheModel } = require( '../models' );

// private field key
const _removeRecordsWithExpiration = Symbol();
const _removeRecordsWithoutExpiration = Symbol();

class ScheduleService {

    static [_removeRecordsWithoutExpiration] = null;
    static [_removeRecordsWithExpiration] = null;

    /**
     * Handle removal of cache items with expiration
     * @returns {Promise<void>}
     */
    static async removeRecordsWithExpiration() {
        try {
            const interval = process.env.EXPIRATION_SCHEDULER;
            if ( this[_removeRecordsWithExpiration] ) { // cron schedule already running
                return;
            }

            console.info( 'info', `Initiated scheduler for cache with expiration ${ interval } ` );
            this[_removeRecordsWithExpiration] = cron.schedule( interval, () => {
                console.info( 'info', `Scheduler running for cache with expiration ${ interval } ` );

            } );
        } catch ( e ) {
            console.error( 'info', 'Cron Tab Running Error: ', e.stack );
        }
    }

    /**
     * A policy is configured to delete records without expiration after it has not been accessed/updated for about 30 days.
     * @returns {Promise<void>}
     */
    static async removeRecordsWithoutExpiration() {
        try {
            const interval = process.env.EXPIRATION_POLICY_SCHEDULER;
            if ( this[_removeRecordsWithoutExpiration] ) { // cron schedule already running
                return;
            }

            console.info( 'info', `Initiated scheduler for cache without expiration ${ interval } ` );
            this[_removeRecordsWithoutExpiration] = cron.schedule( interval, () => {
                console.info( 'info', `Scheduler running for cache without expiration ${ interval } ` );

            } );
        } catch ( e ) {
            console.error( 'info', 'Cron Tab Running Error: ', e.stack );
        }

    }
}

module.exports = ScheduleService;

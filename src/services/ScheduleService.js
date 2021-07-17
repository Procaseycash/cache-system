/**
 * Scheduler Service definition
 */

class ScheduleService {

    static async removeRecordWithExpiration() {

    }

    /**
     * A policy is configured to delete records without expiration after it has not been accessed/updated for about 30 days.
     * @returns {Promise<void>}
     */
    static async removeWithoutExpiration() {

    }
}

module.exports = ScheduleService;

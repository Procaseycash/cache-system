/**
 * Message definition layer.
 */

const messages = {
    success: {
        set: 'Information was stored successfully.',
        getAll: 'All stored information was retrieved successfully.',
        get: 'Fetch an item from store successfully.',
        put: 'Update data in store successfully.',
        remove: 'Remove data in store successfully.',
        removeAllByKeys: 'Remove records by specified keys in store successfully.',
        flush: 'Flush all data in store successfully',
        status: 'successfully retrieved status for a requested key.',
    },
    error: {
        set: e => `Unable to store a record due to ${ e.message }, please try again.`,
        getAll: e => `Unable to retrieved paginated records due to ${ e.message }, please try again.`,
        get: e => `Unable to retrieved a record due to ${ e.message }, please try again.`,
        delete: e => `Unable to perform remove a record due to ${ e.message }, please try again.`,
        put: e => `Unable to update a record due to ${ e.message }, please try again.`,
        remove: e => `Unable to remove a record due to ${ e.message }, please try again.`,
        removeAllByKeys: e => `Unable to remove records by keys due to ${ e.message }, please try again.`,
        flush: e => `Unable to remove all records due to ${ e.message }, please try again.`,
        status: e => `Unable to retrieved status of requested key due to ${ e.message }, please try again.`,
        keyExist: 'key already exist. perform update instead,',
        notFound: 'record not found.',
        noRecordToDelete: 'No record to remove.'
    }
};

module.exports = messages;

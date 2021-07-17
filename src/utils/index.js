/**
 * Utils Definition modules.
 */

// used to format key in store.
const formatKey = key => `${ process.env.CACHE_KEY }${ key }`;

// used to get the expiration date.
const getExpiration = duration => {
    let expiration = null;
    if ( duration ) {
        expiration = new Date().setSeconds( duration );
    }
    return expiration;
};

module.exports = { formatKey, getExpiration };

/**
 * Utils Definition modules.
 */

/**
 * used to format key in store.
 * @param key
 * @returns {string}
 */
const formatKey = key => key.includes( process.env.CACHE_KEY ) ? key : `${ process.env.CACHE_KEY }${ key }`;

/**
 * Used to get the expiration date.
 * @param duration
 * @returns {*}
 */
const getExpiration = duration => {
    let expiration = null;
    if ( duration ) {
        expiration = new Date( new Date().setSeconds( duration ) ).toISOString();
    }
    return expiration;
};

/**
 * Get instant date in ISO format
 * @param date
 * @returns {string}
 */
const getISODate = (date) => (date ? new Date( date ) : new Date()).toISOString();

/**
 * This is used to determine if the cache record hasn't over stayed.
 * @param expirationDate
 * @param currentDate
 * @returns {boolean}
 */
const isCacheExist = (expirationDate, currentDate) => {

    if ( !expirationDate ) { // This is useful for cache that do not set expiration or expiration is set as null.
        return true;
    }

    expirationDate = new Date( expirationDate ).getTime();
    currentDate = new Date( currentDate ).getTime();
    return expirationDate >= currentDate;
};

/**
 * Used to handle paginated records
 * @param req
 * @param model
 * @param dbQuery
 * @param options
 * @returns {Promise<{totalRecords: number, totalPages: number, limit: number, currentPage: number, results: *}>}
 */
const paginatedQuery = async (req, model, dbQuery = {}, options = { selector: '', sort: {}, populate: [] }) => {

    const { page, limit } = req.query;
    const currentPage = +page || +process.env.CURRENT_PAGINATION_PAGE;
    const currentLimit = +limit || +process.env.MAX_PAGINATION_LIMIT;

    const modelAction = model.find( dbQuery || {} );

    if ( options ) {
        if ( options.selector ) modelAction.select( options.selector );
        if ( options.sort ) modelAction.sort( options.sort );
        if ( options.populate ) options.populate.forEach( pop => modelAction.populate( pop ) );
    }

    const data = await modelAction.skip( (currentPage - 1) * currentLimit ).limit( currentLimit ).exec();
    const count = await model.countDocuments( dbQuery );

    return {
        totalRecords: count,
        currentPage: currentPage,
        totalPages: Math.ceil( count / currentLimit ),
        limit: currentLimit,
        results: data
    };

};

module.exports = { formatKey, getExpiration, paginatedQuery, getISODate, isCacheExist };

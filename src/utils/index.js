/**
 * Utils Definition modules.
 */

/**
 * used to format key in store.
 * @param key
 * @returns {string}
 */
const formatKey = key => `${ process.env.CACHE_KEY }${ key }`;

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
const getISODate = (date = '') => new Date( date ).toISOString();

/**
 * This is used to determine if the cache record hasn't over stayed.
 * @param latestDate
 * @param oldDate
 * @returns {boolean}
 */
const isCacheExist = (latestDate, oldDate) => {
    const currentDate = new Date( latestDate ).getTime();
    const previousDate = new Date( oldDate ).getTime();
    return currentDate > previousDate;
};

/**
 * Used to handle paginated records
 * @param req
 * @param model
 * @param dbQuery
 * @param others
 * @returns {Promise<{totalRecords: number, totalPages: number, limit: number, currentPage: number, results: *}>}
 */
const paginatedQuery = async (req, model, dbQuery = {}, others = { selector: {}, sort: {}, populate: [] }) => {

    const { page, limit } = req.query;
    const currentPage = +page || +process.env.CURRENT_PAGINATION_PAGE;
    const currentLimit = +limit || +process.env.MAX_PAGINATION_LIMIT;

    const modelAction = model.find( dbQuery || {} );

    if ( others ) {
        if ( others.selector ) modelAction.select( others.selector );
        if ( others.sort ) modelAction.sort( others.sort );
        if ( others.populate ) others.populate.forEach( pop => modelAction.populate( pop ) );
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

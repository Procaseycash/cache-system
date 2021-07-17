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

/**
 * Used to handle paginated records
 * @param req
 * @param model
 * @param dbQuery
 * @param others
 * @returns {Promise<{totalRecords: number, totalPages: number, limit: number, currentPage: number, results: any}>}
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

module.exports = { formatKey, getExpiration, paginatedQuery };

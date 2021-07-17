/**
 * This is used to manage API response structure
 */
class ResponseHandler {

    /**
     * Handles successful data response
     * @param res
     * @param data
     * @param message
     * @param statusCode
     */
    static success(res, data = {}, message, statusCode = 200) {
        res.status( statusCode ).json( { message, data, status: statusCode } );
    }

    /**
     * Handle errored data response
     * @param res
     * @param message
     * @param statusCode
     */
    static error(res, message, statusCode = 400) {
        res.status( statusCode ).json( { message, status: statusCode } );
    }
}

module.exports = ResponseHandler;

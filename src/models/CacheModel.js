/**
 * Cache model layer definition
 */
const { Schema, model } = require( 'mongoose' );

const CacheSchema = new Schema( {
    key: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    value: {
        type: Schema.Types.Mixed,
        required: true,
    },
    expiration: {
        type: String,
        required: true,
        index: true,
        default: null
    },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } } );  // timestamps will be used for schedule strategy.

module.exports = model( 'Cache', CacheSchema );

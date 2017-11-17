const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const APIError = require('../utils/APIError');

/**
 * EOS Message Schema
 * @private
 */
const messageSchema = new mongoose.Schema(
  {
    message_id: {
      type: Number,
    },
    transaction_id: {
      type: String,
      required: true,
      length: 64,
    },
    authorization: [
      {
        account: String,
        permission: String,
      },
    ],
    handler_account_name: {
      type: String,
      match: /^[.12345a-z]+$/,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 1,
      maxlength: 13,
    },
    type: {
      type: String,
    },
    data: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
    collection: 'Messages',
  },
);

/**
 * Methods
 */
messageSchema.method({
  transform() {
    const transformed = {};
    // TODO: figure out how we want to handle ABI sub-docs
    const fields = [
      'id',
      'message_id',
      'transaction_id',
      'authorization',
      'handler_account_name',
      'type',
      'data',
      'createdAt',
    ];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

messageSchema.statics = {
  /**
   * Get message by transaction id and message id 
   *
   * @param {String} block_ident - The block_num or block_id of the Block.
   * @returns {Promise<Account, APIError>}
   */
  async get(block_ident) {
    const isId = isNaN(Number(block_ident));
    const query = isId // query = typeof block_ident === 'string' ?
      ? { block_id: block_ident }
      : { block_num: block_ident };
    const block = await this.findOne(query).exec();
    if (!block) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: 'EOS block id or block number not found or invalid',
      });
    }
    return block;
  },
  /**
   * List Blocks in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of entities to be skipped.
   * @param {number} limit - Limit number of entities to be returned.
   * @param {Object} [sort] - Object w/ keys matching fieldnames to be sorted, values as -1 (desc), 1 (asc)
   * @param {Object} [filter] - Object matching a Mongoose query object
   * @param {Object|String} [projection] - Mongoose `select()` arg denoting fields to include or exclude
   * @returns {Promise<Block[]>}
   */
  list({ skip = 0, limit = 30, sort, filter, projection }) {
    return this.find(filter)
      .select(projection)
      .sort(sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },
};

/**
 * @typedef Message
 */
const Message = mongoose.model('Message', messageSchema);
module.exports = Message;

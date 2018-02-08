const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');

/**
 * EOS Action Schema
 * @private
 */
const actionSchema = new mongoose.Schema(
  {
    action_id: {
      type: Number,
    },
    transaction_id: {
      type: String,
      required: true,
      length: 64,
    },
    authorization: [
      {
        actor: String,
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
    name: {
      type: String,
    },
    data: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
    collection: 'Actions',
  },
);

/**
 * Methods
 */
actionSchema.method({
  transform() {
    const transformed = {};
    // TODO: figure out how we want to handle ABI sub-docs
    const fields = [
      'id',
      'action_id',
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

actionSchema.statics = {
  /**
   * Get action by transaction id and action id
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
 * @typedef Action
 */
const Action = mongoose.model('Action', actionSchema);
module.exports = Action;

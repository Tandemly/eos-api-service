const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
require('./action.model');

/**
 * EOS ActionTrace Schema
 * @private
 */
const actionTraceSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      required: true,
      length: 64,
    },
    receiver: String,
    action: { type: mongoose.Schema.Types.ObjectId, ref: 'Action' },
    console: String,
    region_id: Number,
    cycle_index: Number,
    data_access: [
      {
        type: String,
        code: String,
        scope: String,
        sequence: Number,
      },
    ],
  },
  {
    timestamps: true,
    collection: 'ActionTraces',
  },
);

/**
 * Methods
 */
actionTraceSchema.method({
  transform() {
    const transformed = {};
    // TODO: figure out how we want to handle ABI sub-docs
    const fields = [
      'id',
      'transaction_id',
      'action',
      'receiver',
      'region_id',
      'console',
      'cycle_index',
      'data_access',
      'createdAt',
    ];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

actionTraceSchema.statics = {
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
 * @typedef ActionTrace
 */
const ActionTrace = mongoose.model('ActionTrace', actionTraceSchema);
module.exports = ActionTrace;

const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { keys, compact, isEmpty, omitBy, pickBy, map, mapKeys, isNil } = require('lodash');
const APIError = require('../utils/APIError');
const Message = require('./message.model');

/**
 * EOS Transaction Schema
 * @private
 */
const transactionSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      required: true,
      unique: true,
      length: 64,
    },
    sequence_num: {
      type: Number,
      required: true,
    },
    block_id: {
      type: String,
      required: true,
      length: 64,
    },
    ref_block_num: {
      type: Number,
      required: true,
      unique: true,
    },
    ref_block_prefix: {
      type: String,
      required: true,
      unique: true,
    },
    scope: [String],
    read_scope: [String],
    expiration: {
      type: Date,
      required: true,
    },
    signatures: [
      {
        type: String,
        required: true,
        length: 64,
      },
    ],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  },
  {
    timestamps: true,
    collection: 'Transactions',
  },
);

/**
 * Methods
 */
transactionSchema.method({
  transform() {
    const transformed = {};
    // TODO: figure out how we want to handle ABI sub-docs
    const fields = [
      'id',
      'transaction_id',
      'sequence_num',
      'block_id',
      'ref_block_num',
      'ref_block_prefix',
      'scope',
      'read_scope',
      'expiration',
      'signatures',
      'messages',
      'createdAt',
    ];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

transactionSchema.statics = {
  /**
   * Get transaction by id
   *
   * @param {String} block_ident - The transaction id of the Transaction.
   * @returns {Promise<Transaction, APIError>}
   */
  async get(txnId) {
    const txn = await this.findOne({ transaction_id: txnId })
      .populate('messages')
      .exec();

    if (!txn) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: 'EOS transaction id not found or invalid',
      });
    }
    return txn;
  },

  /**
   * List Transactions in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of entities to be skipped.
   * @param {number} limit - Limit number of entities to be returned.
   * @param {Object} [sort] - Object w/ keys matching fieldnames to be sorted, values as -1 (desc), 1 (asc)
   * @param {Object} [filter] - Object matching a MongoDB query object
   * @param {Object|String} [projection] - MongoDB $projection object denoting fields to include/exclude
   * @returns {Promise<Transaction[]>}
   */
  list({ skip = 0, limit = 30, sort, filter, projection }) {
    const $match = isEmpty(filter) ? null : { $match: filter };
    const $lookup = {
      $lookup: {
        from: 'Messages',
        localField: 'messages',
        foreignField: '_id',
        as: 'messages',
      },
    };
    const $project = projection ? { $project: projection } : null;
    const $skip = { $skip: skip };
    const $limit = { $limit: limit };
    const $sort = sort ? { $sort: sort } : null;

    const agg = compact([$match, $lookup, $project, $sort, $skip, $limit]);

    return this.aggregate(agg).exec();
  },
};

/**
 * @typedef Transaction
 */
const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;

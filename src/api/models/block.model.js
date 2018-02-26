const mongoose = require('mongoose');
const httpStatus = require('http-status');
const {
  zipObject,
  map,
  isEmpty,
  compact,
  keys,
  omitBy,
  pickBy,
  mapKeys,
  isNil,
} = require('lodash');
const { trimLeft, keyMatches, getAllFieldsProjections } = require('../utils/helpers');
const APIError = require('../utils/APIError');

/**
 * EOS Account Schema
 * @private
 */
const blockSchema = new mongoose.Schema(
  {
    block_num: {
      type: Number,
      required: true,
      unique: true,
    },
    block_id: {
      type: String,
      required: true,
      unique: true,
      length: 64,
    },
    prev_block_id: {
      type: String,
      required: true,
      length: 64,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    transaction_merkle_root: {
      type: String,
      required: true,
      length: 64,
    },
    producer_account_id: {
      type: String,
      match: /^[.12345a-z]+$/,
      trim: true,
      required: true,
      lowercase: true,
      minlength: 1,
      maxlength: 13,
    },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    collection: 'Blocks',
  },
);

// blockSchema.virtual('transactions', {
//   ref: 'Transaction',
//   localField: 'block_id',
//   foreignField: 'block_id',
//   justOne: false
// });

/**
 * Methods
 */
blockSchema.method({
  transform() {
    const transformed = {};
    // TODO: figure out how we want to handle ABI sub-docs
    const fields = [
      'id',
      'block_num',
      'block_id',
      'prev_block_id',
      'timestamp',
      'transaction_merkle_root',
      'producer_account_id',
      'transactions',
      'createdAt',
    ];

    fields.forEach((field) => {
      if (this[field]) {
        transformed[field] = this[field];
      }
    });

    return transformed;
  },
});

blockSchema.statics = {
  /**
   * Get account by name
   *
   * @param {String} block_ident - The block_num or block_id of the Block.
   * @returns {Promise<Account, APIError>}
   */
  async get(block_ident, { projection = {} } = {}) {
    const isId = isNaN(Number(block_ident));
    const filter = isId ? { block_id: block_ident } : { block_num: Number(block_ident) };

    const $match = {
      $match: filter,
    };
    const $lookup = {
      $lookup: {
        from: 'Transactions',
        localField: 'transactions',
        foreignField: '_id',
        as: 'transactions',
      },
    };
    const $project = !isEmpty(projection) ? { $project: projection } : null;

    // let block = this.findOne(query);

    // if (!isEmpty(projection)) {
    //   block = block.select(projection);
    // }
    // block = await block.exec();
    const agg = compact([$match, $lookup, $project]);

    const block = await this.aggregate(agg).exec();

    if (!block.length) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: 'EOS block id or block number not found or invalid',
      });
    }
    return block[0];
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
    const $match = isEmpty(filter) ? {} : filter;
    const $subSelect = {};

    // Pull out 'transactions.*' field projects for
    // populate select to ensure we *only* return necessary fields
    // via the populate query
    if (!isEmpty(projection)) {
      Object.keys(projection).forEach((field) => {
        if (/^transactions\./.test(field)) {
          const key = field.slice('transactions.'.length);
          $subSelect[key] = projection[field];
        }
      });
    }

    return this.find($match)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'transactions',
        options: {
          lean: true,
          select: $subSelect,
        },
      })
      .select(projection)
      .lean()
      .exec();
  },
};

/**
 * @typedef Block
 */
const Block = mongoose.model('Block', blockSchema);
module.exports = Block;

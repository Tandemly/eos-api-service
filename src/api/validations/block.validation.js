const Joi = require('joi');
// const Block = require('../models/block.model');

module.exports = {
  // GET /v1/blocks
  listBlocks: {
    query: {
      filter: Joi.string(),
      sort: Joi.string(),
      skip: Joi.number(),
      limit: Joi.number(),
      fields: Joi.string(),
      // page: Joi.number().min(1),
      // perPage: Joi.number()
      //   .min(1)
      //   .max(100),
      // block_id: Joi.string(),
      // block_num: Joi.number(),
      // prev_block_id: Joi.string(),
      // timestamp: Joi.date(),
      // producer_account_id: Joi.string().regex(/^[a-fA-F0-9]{24}$/),
      // unstaking_balance: Joi.number()
    },
  },
};

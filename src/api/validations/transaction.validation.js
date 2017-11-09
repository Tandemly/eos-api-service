const Joi = require('joi');
const Transaction = require('../models/transaction.model');

const messageSchema = Joi.object().keys({
  code: Joi.string().required(),
  type: Joi.string().required(),
  authorization: Joi.array().items(
    Joi.object().keys({
      account: Joi.string(),
      permission: Joi.string(),
    }),
  ),
  data: Joi.object().required(),
});

module.exports = {
  // GET /v1/transactions
  listTransactions: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number()
        .min(1)
        .max(100),
      transaction_id: Joi.string()
        .min(64)
        .max(64),
      block_id: Joi.string()
        .min(64)
        .max(64),
    },
  },
  // POST /v1/transactions
  createTransaction: {
    body: {
      messages: Joi.alternatives().try(messageSchema, Joi.array().items(messageSchema)),
      signatures: Joi.array().items(Joi.string()),
    },
  },
};

const Joi = require('joi');
const Transaction = require('../models/transaction.model');

const actionSchema = Joi.object().keys({
  code: Joi.string().required(),
  type: Joi.string().required(),
  authorization: Joi.array().items(
    Joi.object().keys({
      actor: Joi.string(),
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
      actions: Joi.alternatives().try(actionSchema, Joi.array().items(actionSchema)),
      signatures: Joi.array().items(Joi.string()),
    },
  },
};

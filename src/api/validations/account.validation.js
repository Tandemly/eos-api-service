const Joi = require('joi');
// const Account = require('../models/account.model');

module.exports = {
  // GET /v1/accounts
  listAccounts: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number()
        .min(1)
        .max(100),
      name: Joi.string(),
      eos_balance: Joi.number(),
      staked_balance: Joi.number(),
      unstaking_balance: Joi.number(),
    },
  },

  // POST /v1/accounts/faucet
  createAccount: {
    body: {
      name: Joi.string()
        .min(5)
        .required(),
      first_name: Joi.string()
        .min(1)
        .required(),
      last_name: Joi.string()
        .min(1)
        .required(),
      email: Joi.string()
        .email()
        .required(),
      wants_tokens: Joi.bool(),
      keys: Joi.object({
        active: Joi.string().required(),
        owner: Joi.string().required(),
      }),
    },
  },
};

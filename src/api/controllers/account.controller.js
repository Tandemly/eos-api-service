const httpStatus = require('http-status');
const { omit } = require('lodash');
const aqp = require('api-query-params');
const Account = require('../models/account.model');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load EOS account and append to req.
 * @public
 */
exports.load = async (req, res, next, accountName) => {
  try {
    const query = aqp(req.query);
    const account = await Account.get(accountName, query);
    req.locals = { account };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get EOS Account
 * @public
 */
exports.get = (req, res) => res.json(req.locals.account.transform());

/**
 * Get Account list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const query = aqp(req.query);
    const accounts = await Account.list(query);
    const transformedAccounts = accounts.map(acct => acct.transform());
    res.json(transformedAccounts);
  } catch (error) {
    next(error);
  }
};

const aqp = require('api-query-params');
const Transaction = require('../models/transaction.model');
const { handler: errorHandler } = require('../middlewares/error');
const { postTransaction } = require('../utils/eosd');

/**
 * Load EOS account and append to req.
 * @public
 */
exports.load = async (req, res, next, txnId) => {
  try {
    const txn = await Transaction.get(txnId);
    req.locals = { txn };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get EOS Account
 * @public
 */
exports.get = (req, res) => res.json(req.locals.txn);

/**
 * Get Account list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const query = aqp(req.query);
    if (req.locals && req.locals.block) {
      query.filter = {
        ...query.filter,
        block_id: req.locals.block.block_id,
      };
    }
    const txns = await Transaction.list(query);
    res.json(txns);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { resp, json } = await postTransaction(req.body);
    res.status(resp.status);
    res.json(json);
  } catch (error) {
    next(error);
  }
};

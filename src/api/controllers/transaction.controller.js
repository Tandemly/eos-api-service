const aqp = require('api-query-params');
const fetch = require('isomorphic-fetch');
const Transaction = require('../models/transaction.model');
const { handler: errorHandler } = require('../middlewares/error');
// const { postTransaction } = require('../utils/eosd');
const { eosd } = require('../../config/vars');

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
    // const { resp, json } = await postTransaction(req.body);
    console.log(`--> fetching ${eosd.uri}/v1/chain/push_transaction`);
    console.log('--> body:', JSON.stringify(req.body, null, 2));
    const resp = await fetch(`${eosd.uri}/v1/chain/push_transaction`, {
      method: 'POST',
      body: JSON.stringify(req.body),
    });
    let json;
    if (resp.headers.get('content-type').indexOf('json') > -1) {
      const text = await resp.text();
      json = JSON.parse(text);
    } else {
      json = await resp.json();
    }
    res.status(resp.status);
    res.json(json);
  } catch (error) {
    next(error);
  }
};

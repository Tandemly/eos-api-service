const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const aqp = require('api-query-params');
const fetch = require('isomorphic-fetch');
const { mail } = require('../utils/email');
const Account = require('../models/account.model');
const Requests = require('../models/requests.model');
const { handler: errorHandler } = require('../middlewares/error');
const { service_name, eosd, faucet } = require('../../config/vars');

/**
 * Load EOS account and append to req.
 * @public
 */
exports.load = async (req, res, next, accountName) => {
  try {
    const query = aqp(req.query);
    const account = await Account.get(accountName, query);
    if(account !== null) {
      req.locals = account;
    } else {
      const resp = await fetch(`${eosd.uri}/v1/chain/get_account`, {
        method: 'POST',
        body: JSON.stringify({
          account_name: accountName
        }),
      });

      let json;
      if (resp.headers.get('content-type').indexOf('json') > -1) {
        json = await resp.json();
      } else {
        const text = await resp.text();
        json = JSON.parse(text);
      }
      req.locals = json;
    }
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get EOS Account
 * @public
 */
exports.get = (req, res) => res.json(req.locals.transform());

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

/* eslint-disable camelcase */
exports.createFromFaucet = async (req, res, next) => {
  try {
    const { name, email, first_name, last_name, wants_tokens, keys } = req.body;

    const resp = await fetch(`${eosd.uri}/v1/chain/get_account`, {
      method: 'POST',
      body: JSON.stringify({
        account_name: name
      })
    });

    let json;
    if (resp.headers.get('content-type').indexOf('json') > -1) {
      json = await resp.json();
    } else {
      const text = await resp.text();
      json = JSON.parse(text);
    }

    if (resp.ok) {

      // Log this request
      const request = new Requests({
        email,
        eos_account: name,
        first_name,
        last_name,
        owner_key: keys.owner,
        active_key: keys.active
      });
      await request.save();

    }
    res.status(resp.status);
    res.json(json);
  } catch (error) {
    next(error);
  }
};

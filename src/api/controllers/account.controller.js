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

/* eslint-disable camelcase */
exports.createFromFaucet = async (req, res, next) => {
  try {
    const { name, email, wants_tokens, keys } = req.body;

    const resp = await fetch(`${eosd.uri}/v1/faucet/create_account`, {
      method: 'POST',
      body: JSON.stringify({
        account: name,
        keys: {
          owner: keys.owner,
          active: keys.active,
        },
      }),
    });

    let json;
    if (resp.headers.get('content-type').indexOf('json') > -1) {
      json = await resp.json();
    } else {
      const text = await resp.text();
      json = JSON.parse(text);
    }

    if (resp.ok && wants_tokens) {
      if (!faucet.notify) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message:
            'Unable to notify the network administrator about your request for tokens. No notify email was configured',
        });
      }

      // Log this request
      const request = new Requests({
        email,
        eos_account: name,
        owner_key: keys.owner,
        active_key: keys.active,
      });
      await request.save();

      await mail({
        from: faucet.fromAddress,
        to: faucet.notify,
        subject: `[Faucet](${service_name}) Request from New Account ${name}`,
        message: `
          <h3>The new EOS account <tt>${name}</tt> is interested in tokens</h3>
          <p>
            The newly created EOS account (via faucet) has expressed an interest in acquiring test
            tokens for development or other purposes. Here is their information:
          </p>
          <ul>
            <li> <b>account:</b> ${name}</li>
            <li> <b>email:</b> <a href="mailto:${email}">${email}</a></li>
            <li> <b>Public Keys</b>:
              <ul>
                <li> <b>owner:</b> ${keys.owner}</li>
                <li> <b>active:</b> ${keys.active}</li>
              </ul>
            </li>
          </ul>
          <p>
          Request generated from ${service_name} at the url: ${req.protocol}://${req.get('host')}${
  req.originalUrl
}.
          </p>
        `,
      });
    }
    res.status(resp.status);
    res.json(json);
  } catch (error) {
    next(error);
  }
};

const httpStatus = require("http-status");
const { omit } = require("lodash");
const aqp = require("api-query-params");
const Block = require("../models/block.model");
const { handler: errorHandler } = require("../middlewares/error");
const { service_name, eosd, faucet } = require('../../config/vars');



/**
 * Get EOS Head Block from Blockchain
 * @public
 */
exports.get_info = async (req, res, next) => {
  try {
    const resp = await
    fetch(`${eosd.uri}/v1/chain/get_info`, {
      method: 'GET'
    });
    let json;
    if (resp.headers.get('content-type').indexOf('json') > -1) {
      json = await
      resp.json();
    } else {
      const text = await
      resp.text();
      json = JSON.parse(text);
    }
    res.status(resp.status);
    res.json(json);
  } catch (error) {
    next(error);
  }
};


/**
 * Get Required Keys from Blockchain
 * @public
 */
exports.get_required_keys = async (req, res, next) => {
  try {
    const resp = await
    fetch(`${eosd.uri}/v1/chain/get_required_keys`, {
      method: 'POST',
      body: req.body
    });
    let json;
    if (resp.headers.get('content-type').indexOf('json') > -1) {
      json = await
      resp.json();
    } else {
      const text = await
      resp.text();
      json = JSON.parse(text);
    }
    res.status(resp.status);
    res.json(json);
  } catch (error) {
    next(error);
  }
};

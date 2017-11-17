/* eslint-disable no-bitwise */
const fetch = require('isomorphic-fetch');
const { uniq, map, flatMap } = require('lodash');
const { eosd } = require('../../config/vars');
const { formatISO } = require('../utils/helpers');

fetch.Promise = require('bluebird');

const defaults = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

// Grab the correct, sorted sceope from the list of messages
// intended for a transaction
const getScope = messages =>
  uniq(
    flatMap(messages, msg => [msg.code, ...map(msg.authorization, auth => auth.account)]),
  ).sort();

const request = async (path, options = {}) => {
  const opts = { ...defaults, ...options };
  const resp = await fetch(`${eosd.uri}${path}`, opts);
  const json = await resp.json();
  return { resp, json };
};

const postTransaction = async ({ messages, signatures, scope }) => {
  const { resp, json } = await request('/v1/chain/get_info');
  const msgList = Array.isArray(messages) ? messages : [messages];
  const transaction = {
    refBlockNum: json.head_block_num & 0xffff,
    refBlockPrefix: new Buffer(json.head_block_id, 'hex').readUInt32LE(8),
    expiration: formatISO(new Date(`${json.head_block_time}Z`)),
    scope: scope ? uniq(scope).sort() : getScope(msgList),
    messages: msgList,
    signatures,
  };
  return request('/v1/chain/push_transaction', {
    method: 'POST',
    body: JSON.stringify(transaction),
  });
};

module.exports = {
  postTransaction,
};

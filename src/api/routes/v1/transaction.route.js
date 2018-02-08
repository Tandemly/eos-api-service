const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/transaction.controller');
const { authorize } = require('../../middlewares/auth');
const { listTransactions, createTransaction } = require('../../validations/transaction.validation');

const router = express.Router({ mergeParams: true });

/**
 * Load EOS transaction when API with transaction identifier route parameter is hit
 */
router.param('txnId', controller.load);

router
  .route('/')
  /**
   * @api {get} v1/transactions Get list of transactions
   * @apiDescription Get a list of all EOS transactions. Allows retreiving a list of transactions, 30 most recent by default. You
   * can change the number of transactions returned via the paging parameters, or change the sorting or filtering to get a more
   * specific list of transactions.
   * @apiVersion 1.0.0
   * @apiName ListTransactions
   * @apiGroup Transaction
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiUse CollectionParams
   *
   * @apiSuccess {Object[]} transactions List of EOS transactions.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   *
   * @apiSuccessExample {json} Success Example:
   * [
   *  {
   *      "_id": "59e88fa3f9a2f33694149f56",
   *      "transaction_id": "be1757939ffc05bca2f630582406ba5e552e1767d88218cd2c5f8be97d6953ad",
   *      "sequence_num": 1,
   *      "block_id": "00000001bd27a3d68b5e66519cfac498d2e96da9bfd1bacf4110f4c7c98feca3",
   *      "ref_block_num": 0,
   *      "ref_block_prefix": "0",
   *      "scope": [],
   *      "read_scope": [],
   *      "expiration": "1970-01-01T00:00:00.000Z",
   *      "signatures": [],
   *      "actions": [
   *          {
   *              "_id": "59e88fa3f9a2f33694149f57",
   *              "action_id": 0,
   *              "transaction_id": "be1757939ffc05bca2f630582406ba5e552e1767d88218cd2c5f8be97d6953ad",
   *              "authorization": [
   *                  {
   *                      "account": "eos",
   *                      "permission": "active"
   *                  }
   *              ],
   *              "handler_account_name": "eos",
   *              "type": "transfer",
   *              "data": {
   *                  "from": "eos",
   *                  "to": "inita",
   *                  "amount": "10000000000",
   *                  "memo": "Genesis Allocation"
   *              },
   *              "createdAt": "2017-10-19T11:42:27.552Z"
   *          }
   *      ],
   *      "createdAt": "2017-10-19T11:42:27.552Z"
   *  },
   *  //...
   * ]
   */
  .get(authorize(), validate(listTransactions), controller.list)
  /**
   * @api {post} v1/transactions Create a new transactions
   * @apiDescription Request the creation of a new transaction on the EOS blockchain. Takes a fully formed and signed
   * transaction and proxies it to the `eosd` node the API service is connected to for creation.  Returns a `transaction_id`
   * along with the processed transaction and other meta information on success.
   * @apiVersion 1.0.0
   * @apiName CreateTransactions
   * @apiGroup Transaction
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   * @apiUse TransactionPostModel
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   *
   * @apiSuccessExample {json} Success Example:
   * {
   *  "transaction_id": "450636be197a79830b4ec7c4689d012b867272abd1785ef6d8c7e69bfb29fa0b",
   *  "processed": {
   *      "refBlockNum": 0,
   *      "refBlockPrefix": 0,
   *      "expiration": "2017-11-01T19:15:00",
   *      "scope": [
   *          "eos",
   *          "inita"
   *      ],
   *      "signatures": [],
   *      "actions": [
   *          {
   *              "code": "eos",
   *              "type": "newaccount",
   *              "authorization": [
   *                  {
   *                      "account": "inita",
   *                      "permission": "active"
   *                  }
   *              ],
   *              "data": {
   *                  "creator": "inita",
   *                  "name": "test",
   *                  "owner": {
   *                      "threshold": 1,
   *                      "keys": [
   *                          {
   *                              "key": "EOS4toFS3YXEQCkuuw1aqDLrtHim86Gz9u3hBdcBw5KNPZcursVHq",
   *                              "weight": 1
   *                          }
   *                      ],
   *                      "accounts": []
   *                  },
   *                  "active": {
   *                      "threshold": 1,
   *                      "keys": [
   *                          {
   *                              "key": "EOS7d9A3uLe6As66jzN8j44TXJUqJSK3bFjjEEqR4oTvNAB3iM9SA",
   *                              "weight": 1
   *                          }
   *                      ],
   *                      "accounts": []
   *                  },
   *                  "recovery": {
   *                      "threshold": 1,
   *                      "keys": [],
   *                      "accounts": [
   *                          {
   *                              "permission": {
   *                                  "account": "inita",
   *                                  "permission": "active"
   *                              },
   *                              "weight": 1
   *                          }
   *                      ]
   *                  },
   *                  "deposit": "0.00000001 EOS"
   *              },
   *              "hex_data": "000000000093dd74000000000090b1ca01000000010200b35ad060d629717bd3dbec82731094dae9cd7e9980c39625ad58fa7f9b654b010000010000000103683cff820ebe53b9b4b0f2be7eb53ab78c9bb43a41294d6ddaaaf86cf5fd4f75010000010000000001000000000093dd7400000000a8ed32320100010000000000000008454f5300000000"
   *          }
   *      ],
   *      "output": [
   *          {
   *              "notify": [],
   *              "deferred_transactions": []
   *          }
   *      ]
   *   }
   * }
   */
  .post(authorize(), validate(createTransaction), controller.create);

router
  .route('/:txnId')
  /**
   * @api {get} v1/transactions/:txnId Get a Transaction
   * @apiDescription Get Transaction information for a sepcific transaction. Regardless of block number, access a specific
   * transaction directly by its `transaction_id`.
   * @apiVersion 1.0.0
   * @apiName GetTransaction
   * @apiGroup Transaction
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiUse TransactionModel
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data
   * @apiError (Not Found 404)    NotFound     Block does not exist
   *
   * @apiSuccessExample {json} Success Example:
   *  {
   *      "_id": "59e88fa3f9a2f33694149f56",
   *      "transaction_id": "be1757939ffc05bca2f630582406ba5e552e1767d88218cd2c5f8be97d6953ad",
   *      "sequence_num": 1,
   *      "block_id": "00000001bd27a3d68b5e66519cfac498d2e96da9bfd1bacf4110f4c7c98feca3",
   *      "ref_block_num": 0,
   *      "ref_block_prefix": "0",
   *      "scope": [],
   *      "read_scope": [],
   *      "expiration": "1970-01-01T00:00:00.000Z",
   *      "signatures": [],
   *      "actions": [
   *          {
   *              "_id": "59e88fa3f9a2f33694149f57",
   *              "action_id": 0,
   *              "transaction_id": "be1757939ffc05bca2f630582406ba5e552e1767d88218cd2c5f8be97d6953ad",
   *              "authorization": [
   *                  {
   *                      "account": "eos",
   *                      "permission": "active"
   *                  }
   *              ],
   *              "handler_account_name": "eos",
   *              "type": "transfer",
   *              "data": {
   *                  "from": "eos",
   *                  "to": "inita",
   *                  "amount": "10000000000",
   *                  "memo": "Genesis Allocation"
   *              },
   *              "createdAt": "2017-10-19T11:42:27.552Z"
   *          }
   *      ],
   *      "createdAt": "2017-10-19T11:42:27.552Z"
   *  }
   */
  .get(authorize(), controller.get);

module.exports = router;

const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/transaction.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');
const { listTransactions } = require('../../validations/transaction.validation');

const router = express.Router({ mergeParams: true });

/**
 * Load EOS transaction when API with transaction identifier route parameter is hit
 */
router.param('txnId', controller.load);

router
  .route('/')
  /**
   * @api {get} v1/transactions Get list of transactions
   * @apiDescription Get a list of all EOS transactions
   * @apiVersion 1.0.0
   * @apiName ListTransactions
   * @apiGroup Transaction
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
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
   *      "messages": [
   *          {
   *              "_id": "59e88fa3f9a2f33694149f57",
   *              "message_id": 0,
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
  .get(authorize(), validate(listTransactions), controller.list);

router
  .route('/:txnId')
  /**
   * @api {get} v1/transactions/:txnId Get a Transaction
   * @apiDescription Get Transaction information for a sepcific transaction
   * @apiVersion 1.0.0
   * @apiName GetTransaction
   * @apiGroup Transaction
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
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
   *      "messages": [
   *          {
   *              "_id": "59e88fa3f9a2f33694149f57",
   *              "message_id": 0,
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

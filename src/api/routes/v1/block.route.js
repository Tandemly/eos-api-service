const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/block.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');
const transactionController = require('../../controllers/transaction.controller');
const { listTransactions } = require('../../validations/transaction.validation');
const { listBlocks } = require('../../validations/block.validation');

const router = express.Router({ mergeParams: true });

/**
 * Load EOS account when API with accountName route parameter is hit
 */
router.param('blockIdent', controller.load);

/**
 * Load EOS transaction when API with transaction identifier route parameter is hit
 */
router.param('txnId', transactionController.load);

router
  .route('/')
  /**
   * @api {get} v1/blocks Get list of blocks
   * @apiDescription Get a list of EOS blocks. This will get a list of all the irreversible blocks on
   * the EOS blockchain. By default, it returns the most recent 30 blocks.  You can request more or less
   * blocks using the paging parameters.
   *
   * @apiVersion 1.0.0
   * @apiName ListBlocks
   * @apiGroup Block
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's API access token
   *
   * @apiUse CollectionParams
   *
   * @apiSuccess {Object[]} blocks List of EOS blocks.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   *
   * @apiSuccessExample {json} Success Response:
   * [
   *  {
   *      "_id": "59e88fedf9a2f33694149feb",
   *      "block_num": 5,
   *      "block_id": "00000005d0ad2e4d4eb5b0aba69c44e7474db8ea7281a9513692445c5a34e22c",
   *      "prev_block_id": "00000004169787ea281cecfcb631603b42857fd07a10ce34dca56160f1c49c4e",
   *      "timestamp": "2017-10-19T11:42:57.000Z",
   *      "transaction_merkle_root": "0000000000000000000000000000000000000000000000000000000000000000",
   *      "producer_account_id": "initf",
   *      "transactions": [],
   *      "createdAt": "2017-10-19T11:43:42.001Z"
   *  },
   *  {
   *      "_id": "59e89014f9a2f3369414a118",
   *      "block_num": 6,
   *      "block_id": "00000006bdf30e60ec0f7e82f501d1b13230a626c434bf762ed590aee5977a1c",
   *      "prev_block_id": "00000005d0ad2e4d4eb5b0aba69c44e7474db8ea7281a9513692445c5a34e22c",
   *      "timestamp": "2017-10-19T11:43:00.000Z",
   *      "transaction_merkle_root": "2b882a0c2528cfa9d1e72403850c31627d25174f2215807725ab996b30a65372",
   *      "producer_account_id": "initg",
   *      "transactions": [
   *          {
   *              "_id": "59e88ff0f9a2f33694149fec",
   *              "transaction_id": "98865d65cb1e851673c3caec5bbc4ea3632833f83f8b763ee2d8c022d3d50c96",
   *              "sequence_num": 0,
   *              "block_id": "00000006bdf30e60ec0f7e82f501d1b13230a626c434bf762ed590aee5977a1c",
   *              "ref_block_num": 5,
   *              "ref_block_prefix": "2880484686",
   *              "scope": [
   *                  "eos",
   *                  "inita"
   *              ],
   *              "read_scope": [],
   *              "expiration": "2017-10-19T11:42:57.000Z",
   *              "signatures": [],
   *              "messages": [
   *                  "59e88ff0f9a2f33694149fed"
   *              ],
   *              "createdAt": "2017-10-19T11:43:45.002Z"
   *          },
   *          {
   *              "_id": "59e88ff1f9a2f33694149fef",
   *              "transaction_id": "2506a57d4ffba36a05a9461a2ab746707f78253e04bdc84bff7bc5c626bc7cba",
   *              "sequence_num": 1,
   *              "block_id": "00000006bdf30e60ec0f7e82f501d1b13230a626c434bf762ed590aee5977a1c",
   *              "ref_block_num": 5,
   *              "ref_block_prefix": "2880484686",
   *              "scope": [
   *                  "eos",
   *                  "inita"
   *              ],
   *              "read_scope": [],
   *              "expiration": "2017-10-19T11:42:57.000Z",
   *              "signatures": [],
   *              "messages": [
   *                  "59e88ff1f9a2f33694149ff0"
   *              ],
   *              "createdAt": "2017-10-19T11:43:45.002Z"
   *          }
   *    ]
   * ]
   */
  .get(authorize(), validate(listBlocks), controller.list);

router
  .route('/head')
  /**
   * @api {get} v1/blocks/head Get Head Block Info
   * @apiDescription Get Block information for a Head block from Blockchain.
   * This api in turns calls EOSD endpoint: http://eosnet.url/v1/chain/get_info
   * @apiVersion 1.0.0
   * @apiName GetHeadBlock
   * @apiGroup Block
   * @apiPermission user
   * @apiExample {curl} Example usage:
   *  curl -i http://localhost:3000/v1/blocks/head
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiUse FieldParam
   *
   * @apiUse BlockModel
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data
   * @apiError (Not Found 500)    Error     Error calling Blockchain eosd url
   *
   * @apiSuccessExample {json} Success Example:
   * {
   * "server_version": "bcb5bf75",
   * "head_block_num": 4414121,
   * "last_irreversible_block_num": 4414103,
   * "head_block_id": "00435aa96628222a35eafa12c740359c4334fd6a958b3455d4752544e1380694",
   * "head_block_time": "2018-03-19T17:27:22",
   * "head_block_producer": "inits",
   * "recent_slots": "1111111111111111111111111111111111111111111111111111111111111111",
   * "participation_rate": "1.00000000000000000"
   * }
   */
  .get(authorize(), controller.head);

router
  .route('/:blockIdent')
  /**
   * @api {get} v1/blocks/:ident Get Block
   * @apiDescription Get Block information for a single block.  The specified `:ident` path param can be
   * either the `block_id` or `block_num` of the specific block being requested.
   * @apiVersion 1.0.0
   * @apiName GetBlock
   * @apiGroup Block
   * @apiPermission user
   * @apiExample {curl} Example usage:
   *  curl -i http://localhost:3000/v1/blocks/00000001bd27a3d68b5e66519cfac498d2e96da9bfd1bacf4110f4c7c98feca3
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam {mixed} ident the `block_id {String}` or `block_num {Number}` of the desired block
   * @apiUse FieldParam
   *
   * @apiUse BlockModel
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data
   * @apiError (Not Found 404)    NotFound     Block does not exist
   *
   * @apiSuccessExample {json} Success Example:
   * {
   *      "_id": "59e88fedf9a2f33694149feb",
   *      "block_num": 5,
   *      "block_id": "00000005d0ad2e4d4eb5b0aba69c44e7474db8ea7281a9513692445c5a34e22c",
   *      "prev_block_id": "00000004169787ea281cecfcb631603b42857fd07a10ce34dca56160f1c49c4e",
   *      "timestamp": "2017-10-19T11:42:57.000Z",
   *      "transaction_merkle_root": "0000000000000000000000000000000000000000000000000000000000000000",
   *      "producer_account_id": "initf",
   *      "transactions": [],
   *      "createdAt": "2017-10-19T11:43:42.001Z"
   * }
   */
  .get(authorize(), controller.get);

router
  .route('/:blockIdent/transactions')
  /**
   * @api {get} v1/blocks/:blockIdent/transactions Get transactions on Block
   * @apiDescription Get a list of EOS transactions for a given block. Using the identifying `block_id` or `block_num`
   * of the specific block, requests all the transactions associated with that block.
   * @apiVersion 1.0.0
   * @apiName ListTransactionsInBlock
   * @apiGroup Transaction
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiUse CollectionParams
   *
   * @apiSuccess {Object[]} transactions List of EOS transactions for the block.
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
  .get(authorize(), validate(listTransactions), transactionController.list);

router
  .route('/:blockIdent/transactions/:txnId')
  /**
   * @api {get} v1/blocks/:blockIdent/transactions/:txnId Get Transaction on Block
   * @apiDescription Get Transaction information for a specific block->transaction. Using the specific `block_id` or `block_num`
   * for the identified block and the `transaction_id` for the specific transaction, request that transaction's information,
   * including messages.
   * @apiVersion 1.0.0
   * @apiName GetTransactionInBlock
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
   * {
   *      "_id": "59e88fa3f9a2f33694149f53",
   *      "transaction_id": "d4fb349d4c3b6d2e0f249a56cafda6d060b8b9dc98ffc498c9f425ccac343a69",
   *      "sequence_num": 0,
   *      "block_id": "00000001bd27a3d68b5e66519cfac498d2e96da9bfd1bacf4110f4c7c98feca3",
   *      "ref_block_num": 0,
   *      "ref_block_prefix": "0",
   *      "expiration": "1970-01-01T00:00:00.000Z",
   *      "createdAt": "2017-10-19T11:42:27.552Z",
   *      "messages": [
   *          {
   *              "_id": "59e88fa3f9a2f33694149f54",
   *              "message_id": 0,
   *              "transaction_id": "d4fb349d4c3b6d2e0f249a56cafda6d060b8b9dc98ffc498c9f425ccac343a69",
   *              "handler_account_name": "eos",
   *              "type": "newaccount",
   *              "data": {
   *                  "deposit": "0.0000 EOS",
   *                  "recovery": {
   *                      "accounts": [],
   *                      "keys": [
   *                          {
   *                              "weight": 1,
   *                              "key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"
   *                          }
   *                      ],
   *                      "threshold": 1
   *                  },
   *                  "active": {
   *                      "accounts": [],
   *                      "keys": [
   *                          {
   *                              "weight": 1,
   *                              "key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"
   *                          }
   *                      ],
   *                      "threshold": 1
   *                  },
   *                  "owner": {
   *                      "accounts": [],
   *                      "keys": [
   *                          {
   *                              "weight": 1,
   *                              "key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"
   *                          }
   *                      ],
   *                      "threshold": 1
   *                  },
   *                  "name": "inita",
   *                  "creator": "eos"
   *              },
   *              "createdAt": "2017-10-19T11:42:27.552Z",
   *              "authorization": [
   *                  {
   *                      "account": "eos",
   *                      "permission": "active"
   *                  }
   *              ]
   *          }
   *      ],
   *      "signatures": [],
   *      "read_scope": [],
   *      "scope": []
   * }
   */
  .get(authorize(), transactionController.get);

module.exports = router;

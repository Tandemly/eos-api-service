const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/chain.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');
const transactionController = require('../../controllers/transaction.controller');
const { listTransactions } = require('../../validations/transaction.validation');

const router = express.Router({ mergeParams: true });


router
  .route('/get_info')
  /**
   * @api {get} v1/chain/get_info Get Head Block Info
   * @apiDescription Get Block information for a Head block from Blockchain.
   * This api in turns calls EOSD endpoint: http://eosnet.url/v1/chain/get_info
   * @apiVersion 1.0.0
   * @apiName GetHeadBlock
   * @apiGroup Block
   * @apiPermission user
   * @apiExample {curl} Example usage:
   *  curl -i http://localhost:3000/v1/chain/get_info
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiUse FieldParam
   *
   * @apiUse ChainModel
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
  .get(authorize(), controller.get_info);


router
  .route('/get_required_keys')
  /**
   * @api {post} v1/chain/get_required_keys Get Required Keys to sign transaction
   * @apiDescription Get Block information for a Head block from Blockchain.
   * This api in turns calls EOSD endpoint: http://eosnet.url/v1/chain/get_required_keys
   * See: https://eosio.github.io/eos/group__eosiorpc.html#v1chaingetrequiredkeys
   * @apiVersion 1.0.0
   * @apiName GetHeadBlock
   * @apiGroup Block
   * @apiPermission user
   * @apiExample {curl} Example usage:
   *  curl http://localhost:3000/v1/chain/get_required_keys -X POST -d '{"transaction":
   *  {"ref_block_num":"100","ref_block_prefix":"137469861","expiration":"2017-09-25T06:28:49",
   *  "scope":["initb","initc"],"actions":[{"code":"currency","type":"transfer",
   *  "recipients":["initb","initc"],"authorization":[{"account":"initb","permission":"active"}],
   *  "data":"000000000041934b000000008041934be803000000000000"}],"signatures":[],"authorizations":[]},
   *  "available_keys":["EOS4toFS3YXEQCkuuw1aqDLrtHim86Gz9u3hBdcBw5KNPZcursVHq",
   *  "EOS7d9A3uLe6As66jzN8j44TXJUqJSK3bFjjEEqR4oTvNAB3iM9SA",
   *  "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"]}'
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiUse FieldParam
   *
   * @apiUse ChainModel
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data
   * @apiError (Not Found 500)    Error     Error calling Blockchain eosd url
   *
   * @apiSuccessExample {json} Success Example:
   * {
   *   "required_keys": [
   *   "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"
   *   ]
   * }
   */
  .post(authorize(), controller.get_required_keys);

module.exports = router;

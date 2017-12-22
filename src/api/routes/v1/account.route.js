const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/account.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');
const { listAccounts, createAccount } = require('../../validations/account.validation');

const router = express.Router();

/**
 * Load EOS account when API with accountName route parameter is hit
 */
router.param('accountName', controller.load);

router
  .route('/')
  /**
   * @api {get} v1/accounts List EOS Accounts
   * @apiDescription Get a list of EOS accounts. Requests a list of EOS accounts and their related information.
   * @apiVersion 1.0.0
   * @apiName ListAccounts
   * @apiGroup Account
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]              List page
   * @apiParam  {Number{1-100}}      [perPage=1]           Accounts per page
   * @apiParam  {String}             [name]                Account's name
   * @apiParam  {Number}             [eos_balance]         Account's EOS balance
   * @apiParam  {Number}             [staked_balance]      Account's staked balance
   * @apiParam  {Number}             [unstaking_balance]   Account's unstaking balance
   *
   * @apiSuccess {Object[]} users List of EOS accounts.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(authorize(), validate(listAccounts), controller.list);

router
  .route('/:accountName')
  /**
   * @api {get} v1/accounts/:ident Get EOS Account
   * @apiDescription Get EOS Account information for a sepcific account identified by `:ident`, which should be their EOS account name.
   * @apiVersion 1.0.0
   * @apiName GetAccount
   * @apiGroup Account
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiSuccess {String}  id                 User's id
   * @apiSuccess {String}  name               User's name
   * @apiSuccess {Number}  eos_balance        User's email
   * @apiSuccess {Number}  staked_balance     User's role
   * @apiSuccess {Number}  unstaking_balance  User's role
   * @apiSuccess {Date}    createdAt          Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can access the data
   * @apiError (Not Found 404)    NotFound     Account does not exist
   */
  .get(authorize(), controller.get);

router
  .route('/faucet')
  /**
   * @api {post} v1/accounts/faucet Create a new EOS account (faucet)
   * @apiDescription Request the creation of a new EOS account via the faucet mechanism. This is only
   * available on thes testnet(s). If `wants_tokens` is true, then an email will be sent to the
   * testnet coordinator, who should then follow up with a questionnaire that is required to receive
   * test tokens on the new account.
   * @apiVersion 1.0.0
   * @apiName NewAccountFaucet
   * @apiGroup Account
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam (Created 201) {String}  name           Requested EOS account name
   * @apiParam (Created 201) {String}  email          Requesting user's email address
   * @apiParam (Created 201) {Boolean} wants_tokens   Does the user want to request test tokens for development?
   * @apiParam (Created 201) {Object}  keys
   * @apiParam (Created 201) {String}  keys.active    The valid, "active" public key for the new account
   * @apiParam (Created 201) {String}  keys.owner     The valid, "owner" public key for the new account
   *
   * @apiSuccess (Created 201) {Object} response      Response from the eosd server
   * 
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Too Many Requests 429) TooManyRequests Rate limit exceeded, try again later
   */
  .post(authorize(), validate(createAccount), controller.createFromFaucet);

module.exports = router;

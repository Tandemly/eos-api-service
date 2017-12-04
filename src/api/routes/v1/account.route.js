const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/account.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');
const { listAccounts } = require('../../validations/account.validation');

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

module.exports = router;

const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/auth.controller');
const oAuthLogin = require('../../middlewares/auth').oAuth;
const {
  login,
  register,
  passwordReset,
  passwordResetChange,
  // oAuth,
  requestKey,
  refresh,
} = require('../../validations/auth.validation');

const router = express.Router();

/**
 * @api {post} v1/auth/register Register
 * @apiDescription Register a new user user with the API service. In order to use the API service
 * you'll need to register for an API account.  Registering lets you create an account (tied to your email) and get back
 * a JWT (JSON Web Token) access token that allows you to make calls to the API.  Once registered, you can get subsequent
 * tokens via [`v1/auth/login`](#api-Auth-Login).
 * @apiVersion 1.0.0
 * @apiName Register
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}          email     User's email
 * @apiParam  {String{6..128}}  password  User's password
 *
 * @apiSuccess (Created 201) {Object}  token               JWT Access token information for this new user
 * @apiSuccess (Created 201) {String}  token.tokenType     Access Token's type
 * @apiSuccess (Created 201) {String}  token.accessToken   Authorization Token
 * @apiSuccess (Created 201) {String}  token.refreshToken  Token to get a new accessToken
 *                                                   after expiration time
 * @apiSuccess (Created 201) {Number}  token.expiresIn     Access Token's expiration time
 *                                                   in miliseconds
 * @apiSuccess (Created 201) {String}  token.timezone      The server's Timezone
 *
 * @apiSuccess (Created 201) {String}  user.id         User's id
 * @apiSuccess (Created 201) {String}  user.name       User's name
 * @apiSuccess (Created 201) {String}  user.email      User's email
 * @apiSuccess (Created 201) {String}  user.role       User's role
 * @apiSuccess (Created 201) {Date}    user.createdAt  Timestamp
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 */
router.route('/register').post(validate(register), controller.register);

/**
 * @api {post} v1/auth/login Login
 * @apiDescription Get an accessToken for an existing API user.  Using your email and password, request a new JWT
 * Access Token from the service.  As JWT tokens expire, you can get a new one with this service, or use the provided
 * refresh token given to you along with the original access token.
 * @apiVersion 1.0.0
 * @apiName Login
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}         email     User's email
 * @apiParam  {String{6..128}}  password  User's password
 *
 * @apiSuccess  {Object}  token               New JWT Access token information
 * @apiSuccess  {String}  token.tokenType     Access Token's type
 * @apiSuccess  {String}  token.accessToken   Authorization Token
 * @apiSuccess  {String}  token.refreshToken  Token to get a new accessToken
 *                                                   after expiration time
 * @apiSuccess  {Number}  token.expiresIn     Access Token's expiration time
 *                                                   in miliseconds
 *
 * @apiSuccess  {String}  user.id             User's id
 * @apiSuccess  {String}  user.name           User's name
 * @apiSuccess  {String}  user.email          User's email
 * @apiSuccess  {String}  user.role           User's role
 * @apiSuccess  {Date}    user.createdAt      Timestamp
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 * @apiError (Unauthorized 401)  Unauthorized     Incorrect email or password
 */
router.route('/login').post(validate(login), controller.login);

/**
 * @api {post} v1/auth/password/reset Password Reset Request
 * @apiDescription Request a password reset for a given user/email address.  To facilitate password resets, the
 * service will email the given user's email address a link to a form (to be provided via the `url` param by caller)
 * that will have a temporary reset token and the user's id passed to the link as a query params. The caller can
 * then use those pieces of information, along with the user's email, to allow them to submit a password change via
 * [`POST v1/auth/password/reset/change`](#api-Auth-Password_Change).
 * @apiVersion 1.0.0
 * @apiName Password Reset
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}         email     User's email
 * @apiParam  {String}         url       Link to your reset password page/form
 *
 * @apiSuccess  {String}  user.id             User's id
 * @apiSuccess  {String}  user.name           User's name
 * @apiSuccess  {String}  user.email          User's email
 * @apiSuccess  {String}  user.role           User's role
 * @apiSuccess  {Date}    user.createdAt      Timestamp
 *
 * @apiSuccess  {String}  message             Message noting an email was sent
 *
 * @apiError (Bad Request 400)   ValidationError  Missing email and/or url parameters
 * @apiError (Not Found 404)     ValidationError  Email in request was not found
 * @apiError (Conflict 409)      BadState         An existing, non-expired reset token already exists
 */
router.route('/password/reset').post(validate(passwordReset), controller.passwordReset);

/**
 * @api {post} v1/auth/password/reset/change Password Change Request
 * @apiDescription Updates a given user's password, as long as the request has a valid, non-expired
 * password reset token for the given user. Password reset requests are used to generate valid reset tokens
 * and email the given user a link to a form that will receive that reset token. See
 * [`POST v1/auth/password/reset`](#api-Auth-Password_Reset) for more information.
 * @apiVersion 1.0.0
 * @apiName Password Change
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}         email     User's email
 * @apiParam  {String}         password  New password for this user
 * @apiParam  {String}         confirm   The new password a second time (must match)
 * @apiParam  {String}         token     a valid password reset token
 *
 * @apiSuccess  {Object}  user                Related User information
 * @apiSuccess  {String}  user.id             User's id
 * @apiSuccess  {String}  user.name           User's name
 * @apiSuccess  {String}  user.email          User's email
 * @apiSuccess  {String}  user.role           User's role
 * @apiSuccess  {Date}    user.createdAt      Timestamp
 *
 * @apiSuccess  {String}  message             Message noting the password was changed
 *
 * @apiError (Conflict 401)      Unauthorized     Password reset token was not authorized for this user
 * @apiError (Bad Request 400)   ValidationError  Missing email and/or url parameters
 * @apiError (Not Found 404)     ValidationError  Email in request was not found
 * @apiError (Conflict 409)      BadState         An existing, non-expired reset token already exists
 */
router
  .route('/password/reset/change')
  .post(validate(passwordResetChange), controller.passwordResetChange);

/**
 * @api {post} v1/auth/refresh-token Refresh Token
 * @apiDescription Refresh expired accessToken. When new tokens are received via registration or login, they
 * also contain a refresh token.  This refresh token can be used to request an updated JWT access token, which
 * also invalidates the existing refresh token, returning a new one.
 * @apiVersion 1.0.0
 * @apiName RefreshToken
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}  email         User's email
 * @apiParam  {String}  refreshToken  Refresh token aquired when user logged in
 *
 * @apiSuccess {String}  tokenType     Access Token's type
 * @apiSuccess {String}  accessToken   Authorization Token
 * @apiSuccess {String}  refreshToken  Token to get a new accessToken after expiration time
 * @apiSuccess {Number}  expiresIn     Access Token's expiration time in miliseconds
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 * @apiError (Unauthorized 401)  Unauthorized     Incorrect email or refreshToken
 */
router.route('/refresh-token').post(validate(refresh), controller.refresh);

/**
 * @api {post} v1/auth/request-api-key Request API key
 * @apiDescription Get an long-term API key, which can be used by applications for long-term access.  This is
 * different than the personal JWT access tokens retured by registering and login endpoints. Personal JWT access tokens
 * are short lived.  API keys (which are also using JWT) contain identifying infromation about not only the user but
 * an identity (typically an application name or other service) that wants to use the API service.  This makes it easier
 * for developing third-party applications, both server and client-side, to maintain access without dealing with the
 * expiration/refresh conditions on personal access tokens.  Once you receive a token, keep it secret, as sharing it will
 * give others the same access to using the API service as your application.
 * @apiVersion 1.0.0
 * @apiName RequestAPIKey
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}         email     User's email
 * @apiParam  {String{6..128}}  password  User's password
 * @apiParam  {String}         ident     App name that will be using api key
 *
 * @apiSuccess  {Object}  token               The API key token information
 * @apiSuccess  {String}  token.tokenType     Access Token's type
 * @apiSuccess  {String}  token.accessToken   Authorization Token
 * @apiSuccess  {String}  token.ident         The registered identifier for API token
 *
 * @apiSuccess  {Object}  user                The requesing user's information
 * @apiSuccess  {String}  user.id             User's id
 * @apiSuccess  {String}  user.name           User's name
 * @apiSuccess  {String}  user.email          User's email
 * @apiSuccess  {String}  user.role           User's role
 * @apiSuccess  {Date}    user.createdAt      Timestamp
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 * @apiError (Unauthorized 401)  Unauthorized     Incorrect email or password
 */
router.route('/request-api-key').post(validate(requestKey), controller.requestKey);

/**
 * @apiIgnore Not Implemented for this service
 * @api {post} v1/auth/refresh-token Facebook Login
 * @apiDescription Login with facebook. Creates a new user if it does not exist
 * @apiVersion 1.0.0
 * @apiName FacebookLogin
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}  access_token  Facebook's access_token
 *
 * @apiSuccess {String}  tokenType     Access Token's type
 * @apiSuccess {String}  accessToken   Authorization Token
 * @apiSuccess {String}  refreshToken  Token to get a new accessToken after expiration time
 * @apiSuccess {Number}  expiresIn     Access Token's expiration time in miliseconds
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 * @apiError (Unauthorized 401)  Unauthorized    Incorrect access_token
 */
// router.route('/facebook')
//   .post(validate(oAuth), oAuthLogin('facebook'), controller.oAuth);

/**
 * @apiIgnore Not Implemented for this service
 * @api {post} v1/auth/refresh-token Google Login
 * @apiDescription Login with google. Creates a new user if it does not exist
 * @apiVersion 1.0.0
 * @apiName GoogleLogin
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}  access_token  Google's access_token
 *
 * @apiSuccess {String}  tokenType     Access Token's type
 * @apiSuccess {String}  accessToken   Authorization Token
 * @apiSuccess {String}  refreshToken  Token to get a new accpessToken after expiration time
 * @apiSuccess {Number}  expiresIn     Access Token's expiration time in miliseconds
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 * @apiError (Unauthorized 401)  Unauthorized    Incorrect access_token
 */
// router.route('/google')
//   .post(validate(oAuth), oAuthLogin('google'), controller.oAuth);

module.exports = router;

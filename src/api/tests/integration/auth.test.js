/* eslint-disable arrow-body-style */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const sinon = require('sinon');
const app = require('../../../index');
const User = require('../../models/user.model');
const RefreshToken = require('../../models/refreshToken.model');
const ResetToken = require('../../models/resetToken.model');
const authProviders = require('../../services/authProviders');

const sandbox = sinon.createSandbox();

describe('Authentication API', () => {
  let dbUser;
  let user;
  let refreshToken;
  let resetToken;

  beforeEach(async () => {
    dbUser = {
      email: 'branstark@gmail.com',
      password: 'mypassword',
      name: 'Bran Stark',
      role: 'admin',
    };

    user = {
      email: 'sousa.dfs@gmail.com',
      password: '123456',
      name: 'Daniel Sousa',
    };

    refreshToken = {
      token:
        '5947397b323ae82d8c3a333b.c69d0435e62c9f4953af912442a3d064e20291f0d228c0552ed4be473e7d191ba40b18c2c47e8b9d',
      userId: '5947397b323ae82d8c3a333b',
      userEmail: dbUser.email,
      expires: new Date(),
    };

    resetToken = {
      token:
        '5947397b323ae82d8c3a333b.c69d0435e62c9f4953af912442a3d064e20291f0d228c0552ed4be473e7d191ba40b18c2c47e8b9d',
      userId: '5947397b323ae82d8c3a333b',
      userEmail: dbUser.email,
      expires: new Date(),
      resetUrl: 'http://tandem.ly',
    };

    await User.remove({});
    await User.create(dbUser);
    await RefreshToken.remove({});
    await ResetToken.remove({});
  });

  afterEach(() => sandbox.restore());

  describe('POST /v1/auth/register', () => {
    it('should register a new user when request is ok', () => {
      return request(app)
        .post('/v1/auth/register')
        .send(user)
        .expect(httpStatus.CREATED)
        .then((res) => {
          delete user.password;
          expect(res.body.token).to.have.a.property('accessToken');
          expect(res.body.token).to.have.a.property('refreshToken');
          expect(res.body.token).to.have.a.property('expiresIn');
          expect(res.body.user).to.include(user);
        });
    });

    it('should report error when email already exists', () => {
      return request(app)
        .post('/v1/auth/register')
        .send(dbUser)
        .expect(httpStatus.CONFLICT)
        .then((res) => {
          const field = res.body.errors[0].field;
          const location = res.body.errors[0].location;
          const messages = res.body.errors[0].messages;
          expect(field).to.be.equal('email');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"email" already exists');
        });
    });

    it('should report error when the email provided is not valid', () => {
      user.email = 'this_is_not_an_email';
      return request(app)
        .post('/v1/auth/register')
        .send(user)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const field = res.body.errors[0].field;
          const location = res.body.errors[0].location;
          const messages = res.body.errors[0].messages;
          expect(field).to.be.equal('email');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"email" must be a valid email');
        });
    });

    it('should report error when email and password are not provided', () => {
      return request(app)
        .post('/v1/auth/register')
        .send({})
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const field = res.body.errors[0].field;
          const location = res.body.errors[0].location;
          const messages = res.body.errors[0].messages;
          expect(field).to.be.equal('email');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"email" is required');
        });
    });
  });

  describe('POST /v1/auth/login', () => {
    it('should return an accessToken and a refreshToken when email and password matches', () => {
      return request(app)
        .post('/v1/auth/login')
        .send(dbUser)
        .expect(httpStatus.OK)
        .then((res) => {
          delete dbUser.password;
          expect(res.body.token).to.have.a.property('accessToken');
          expect(res.body.token).to.have.a.property('refreshToken');
          expect(res.body.token).to.have.a.property('expiresIn');
          expect(res.body.user).to.include(dbUser);
        });
    });

    it('should report error when email and password are not provided', () => {
      return request(app)
        .post('/v1/auth/login')
        .send({})
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const field = res.body.errors[0].field;
          const location = res.body.errors[0].location;
          const messages = res.body.errors[0].messages;
          expect(field).to.be.equal('email');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"email" is required');
        });
    });

    it('should report error when the email provided is not valid', () => {
      user.email = 'this_is_not_an_email';
      return request(app)
        .post('/v1/auth/login')
        .send(user)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const field = res.body.errors[0].field;
          const location = res.body.errors[0].location;
          const messages = res.body.errors[0].messages;
          expect(field).to.be.equal('email');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"email" must be a valid email');
        });
    });

    it("should report error when email and password don't match", () => {
      return request(app)
        .post('/v1/auth/login')
        .send(user)
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          const code = res.body.code;
          const message = res.body.message;
          expect(code).to.be.equal(401);
          expect(message).to.be.equal('Incorrect email or refreshToken');
        });
    });
  });

  describe('POST /v1/auth/request-api-key', () => {
    it('should return an API accessToken when email and password matches', () => {
      return request(app)
        .post('/v1/auth/request-api-key')
        .send({ ...dbUser, ident: 'my-app' })
        .expect(httpStatus.OK)
        .then((res) => {
          delete dbUser.password;
          expect(res.body.token).to.have.a.property('tokenType');
          expect(res.body.token).to.have.a.property('accessToken');
          expect(res.body.token).to.have.a.property('ident');
          expect(res.body.user).to.include(dbUser);
        });
    });

    it('should report error when email and password are not provided', () => {
      return request(app)
        .post('/v1/auth/request-api-key')
        .send({})
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const field = res.body.errors[0].field;
          const location = res.body.errors[0].location;
          const messages = res.body.errors[0].messages;
          expect(field).to.be.equal('email');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"email" is required');
        });
    });

    it('should report error when the email provided is not valid', () => {
      user.email = 'this_is_not_an_email';
      return request(app)
        .post('/v1/auth/request-api-key')
        .send({ ...user, ident: 'my-app' })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const field = res.body.errors[0].field;
          const location = res.body.errors[0].location;
          const messages = res.body.errors[0].messages;
          expect(field).to.be.equal('email');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"email" must be a valid email');
        });
    });

    it("should report error when email and password don't match", () => {
      return request(app)
        .post('/v1/auth/request-api-key')
        .send({ ...user, ident: 'my-app' })
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          const code = res.body.code;
          const message = res.body.message;
          expect(code).to.be.equal(401);
          expect(message).to.be.equal('Incorrect or missing password');
        });
    });
  });

  // describe('POST /v1/auth/facebook', () => {
  //   it('should create a new user and return an accessToken when user does not exist', () => {
  //     sandbox.stub(authProviders, 'facebook').callsFake(fakeOAuthRequest);
  //     return request(app)
  //       .post('/v1/auth/facebook')
  //       .send({ access_token: '123' })
  //       .expect(httpStatus.OK)
  //       .then((res) => {
  //         expect(res.body.token).to.have.a.property('accessToken');
  //         expect(res.body.token).to.have.a.property('refreshToken');
  //         expect(res.body.token).to.have.a.property('expiresIn');
  //         expect(res.body.user).to.be.an('object');
  //       });
  //   });

  //   it('should return an accessToken when user already exists', async () => {
  //     dbUser.email = 'test@test.com';
  //     await User.create(dbUser);
  //     sandbox.stub(authProviders, 'facebook').callsFake(fakeOAuthRequest);
  //     return request(app)
  //       .post('/v1/auth/facebook')
  //       .send({ access_token: '123' })
  //       .expect(httpStatus.OK)
  //       .then((res) => {
  //         expect(res.body.token).to.have.a.property('accessToken');
  //         expect(res.body.token).to.have.a.property('refreshToken');
  //         expect(res.body.token).to.have.a.property('expiresIn');
  //         expect(res.body.user).to.be.an('object');
  //       });
  //   });

  //   it('should return error when access_token is not provided', async () => {
  //     return request(app)
  //       .post('/v1/auth/facebook')
  //       .expect(httpStatus.BAD_REQUEST)
  //       .then((res) => {
  //         const field = res.body.errors[0].field;
  //         const location = res.body.errors[0].location;
  //         const messages = res.body.errors[0].messages;
  //         expect(field).to.be.equal('access_token');
  //         expect(location).to.be.equal('body');
  //         expect(messages).to.include('"access_token" is required');
  //       });
  //   });
  // });

  // describe('POST /v1/auth/google', () => {
  //   it('should create a new user and return an accessToken when user does not exist', () => {
  //     sandbox.stub(authProviders, 'google').callsFake(fakeOAuthRequest);
  //     return request(app)
  //       .post('/v1/auth/google')
  //       .send({ access_token: '123' })
  //       .expect(httpStatus.OK)
  //       .then((res) => {
  //         expect(res.body.token).to.have.a.property('accessToken');
  //         expect(res.body.token).to.have.a.property('refreshToken');
  //         expect(res.body.token).to.have.a.property('expiresIn');
  //         expect(res.body.user).to.be.an('object');
  //       });
  //   });

  //   it('should return an accessToken when user already exists', async () => {
  //     dbUser.email = 'test@test.com';
  //     await User.create(dbUser);
  //     sandbox.stub(authProviders, 'google').callsFake(fakeOAuthRequest);
  //     return request(app)
  //       .post('/v1/auth/google')
  //       .send({ access_token: '123' })
  //       .expect(httpStatus.OK)
  //       .then((res) => {
  //         expect(res.body.token).to.have.a.property('accessToken');
  //         expect(res.body.token).to.have.a.property('refreshToken');
  //         expect(res.body.token).to.have.a.property('expiresIn');
  //         expect(res.body.user).to.be.an('object');
  //       });
  //   });

  //   it('should return error when access_token is not provided', async () => {
  //     return request(app)
  //       .post('/v1/auth/google')
  //       .expect(httpStatus.BAD_REQUEST)
  //       .then((res) => {
  //         const field = res.body.errors[0].field;
  //         const location = res.body.errors[0].location;
  //         const messages = res.body.errors[0].messages;
  //         expect(field).to.be.equal('access_token');
  //         expect(location).to.be.equal('body');
  //         expect(messages).to.include('"access_token" is required');
  //       });
  //   });
  // });

  describe('POST /v1/auth/refresh-token', () => {
    it('should return a new accessToken when refreshToken and email match', async () => {
      await RefreshToken.create(refreshToken);
      return request(app)
        .post('/v1/auth/refresh-token')
        .send({ email: dbUser.email, refreshToken: refreshToken.token })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.have.a.property('accessToken');
          expect(res.body).to.have.a.property('refreshToken');
          expect(res.body).to.have.a.property('expiresIn');
        });
    });

    it("should report error when email and refreshToken don't match", async () => {
      await RefreshToken.create(refreshToken);
      return request(app)
        .post('/v1/auth/refresh-token')
        .send({ email: user.email, refreshToken: refreshToken.token })
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          const code = res.body.code;
          const message = res.body.message;
          expect(code).to.be.equal(401);
          expect(message).to.be.equal('Incorrect email or refreshToken');
        });
    });

    it('should report error when email and refreshToken are not provided', () => {
      return request(app)
        .post('/v1/auth/refresh-token')
        .send({})
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const field1 = res.body.errors[0].field;
          const location1 = res.body.errors[0].location;
          const messages1 = res.body.errors[0].messages;
          const field2 = res.body.errors[1].field;
          const location2 = res.body.errors[1].location;
          const messages2 = res.body.errors[1].messages;
          expect(field1).to.be.equal('email');
          expect(location1).to.be.equal('body');
          expect(messages1).to.include('"email" is required');
          expect(field2).to.be.equal('refreshToken');
          expect(location2).to.be.equal('body');
          expect(messages2).to.include('"refreshToken" is required');
        });
    });
  });

  describe('POST /v1/auth/password/reset', () => {
    it('should create a new resetToken when given a valid email match and url', async () => {
      await ResetToken.create(resetToken);
      return request(app)
        .post('/v1/auth/password/reset')
        .send({ email: dbUser.email, url: 'http://test.com' })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.have.a.property('user');
          expect(res.body.user).to.have.a.property('id');
          expect(res.body.user).to.have.a.property('email');
          expect(res.body).to.have.a.property('message');
        });
    });

    it("should report error when email doesn't match in system", async () => {
      return request(app)
        .post('/v1/auth/password/reset')
        .send({ email: user.email, url: 'http://test.com' })
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          const code = res.body.code;
          const message = res.body.message;
          expect(code).to.be.equal(404);
          expect(message).to.be.equal('Non-existant email');
        });
    });

    it('should report error when email or url are not provided', () => {
      return request(app)
        .post('/v1/auth/password/reset')
        .send({})
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const field1 = res.body.errors[0].field;
          const location1 = res.body.errors[0].location;
          const messages1 = res.body.errors[0].messages;
          const field2 = res.body.errors[1].field;
          const location2 = res.body.errors[1].location;
          const messages2 = res.body.errors[1].messages;
          expect(field1).to.be.equal('email');
          expect(location1).to.be.equal('body');
          expect(messages1).to.include('"email" is required');
          expect(field2).to.be.equal('url');
          expect(location2).to.be.equal('body');
          expect(messages2).to.include('"url" is required');
        });
    });
  });

  describe('POST /v1/auth/password/reset/change', () => {
    it('should reset password when given a valid email and matching reset token ', async () => {
      await ResetToken.create(resetToken);
      await RefreshToken.create(refreshToken);
      return request(app)
        .post('/v1/auth/password/reset/change')
        .send({
          email: dbUser.email,
          password: 'sekrit',
          confirm: 'sekrit',
          token: resetToken.token,
        })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.have.a.property('user');
          expect(res.body.user).to.have.a.property('id');
          expect(res.body.user).to.have.a.property('email');
          expect(res.body).to.have.a.property('message');
          // User password changed
          expect(User.findById(res.body.user.id).password).to.not.be.equal('mypassword');
          // All tokens were removed
          expect(ResetToken.find({}).length).to.be.undefined;
          expect(RefreshToken.find({}).length).to.be.undefined;
        });
    });

    it("should report error when email doesn't match", async () => {
      return request(app)
        .post('/v1/auth/password/reset/change')
        .send({
          email: 'bad@mail.com',
          password: 'sekrit',
          confirm: 'sekrit',
          token: resetToken.token,
        })
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          const code = res.body.code;
          const message = res.body.message;
          expect(code).to.be.equal(404);
          expect(message).to.be.equal('User email not found or invalid');
        });
    });

    it("should report error when token doesn't match", async () => {
      return request(app)
        .post('/v1/auth/password/reset/change')
        .send({ email: dbUser.email, password: 'sekrit', confirm: 'sekrit', token: 'no-match' })
        .expect(httpStatus.CONFLICT)
        .then((res) => {
          const code = res.body.code;
          const message = res.body.message;
          expect(code).to.be.equal(409);
          expect(message).to.be.equal('No matching reset token found for email');
        });
    });

    it('should report error when any of the fields are not provided', () => {
      return request(app)
        .post('/v1/auth/password/reset/change')
        .send({})
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const [email, password, confirm, token] = res.body.errors;
          expect(email.field).to.be.equal('email');
          expect(email.location).to.be.equal('body');
          expect(email.messages).to.include('"email" is required');
          expect(password.field).to.be.equal('password');
          expect(password.location).to.be.equal('body');
          expect(password.messages).to.include('"password" is required');
          expect(confirm.field).to.be.equal('confirm');
          expect(confirm.location).to.be.equal('body');
          expect(confirm.messages).to.include('"confirm" is required');
          expect(token.field).to.be.equal('token');
          expect(token.location).to.be.equal('body');
          expect(token.messages).to.include('"token" is required');
        });
    });
  });
});

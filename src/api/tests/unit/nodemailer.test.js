/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const request = require('supertest');
const httpStatus = require('http-status');
const nodemailer = require('nodemailer');
const { expect } = require('chai');
const sinon = require('sinon');
const { some, omitBy, isNil } = require('lodash');
const { mail } = require('../../utils/email');

// Message object
const message = {
  to: 'Recipient <recipient@example.com>',
  subject: 'Nodemailer is unicode friendly ✔',
  message: '<p><b>Hello</b> to myself!</p>',
};

// Setup test case for emailing
// const transporter = nodemailer.createTransport(config);
// const testMail = Promise.promisify(transporter.sendMail, { context: transporter });

describe('SMTP mail testing', () => {
  it('should be able to send email via SMTP config', function () {
    this.timeout(10000);
    return mail(message).then((info) => {
      expect(info).to.be.an('object');
      expect(info).to.haveOwnProperty('messageId');
      expect(info.response).to.match(/^250 Accepted/);
    });
  });
});

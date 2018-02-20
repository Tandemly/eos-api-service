const path = require('path');

// import .env variables
require('dotenv-safe').load({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});

// SMTP mail setup
// Default to ehtereal to keep from breaking things, which
// will just send emails to the void
let mail = {
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: 'qxyqzjzc6w5corhw@ethereal.email',
    pass: 'Yc3SPsMfD1Dakzpw2S',
  },
};

if (process.env.NODE_ENV === 'test' && process.env.TEST_SMTP_HOST) {
  mail = {
    host: process.env.TEST_SMTP_HOST,
    port: process.env.TEST_SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.TEST_SMTP_USER,
      pass: process.env.TEST_SMTP_PASS,
    },
  };
} else if (process.env.SMTP_HOST) {
  mail = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
}

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
  mongo: {
    uri: process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TESTS : process.env.MONGO_URI,
  },
  service_name: process.env.SERVICE_NAME,
  mail,
  eosd: {
    uri:
      process.env.NODE_ENV === 'test'
        ? process.env.EOSD_CONNECTOR_TEST_URI
        : process.env.EOSD_CONNECTOR_URI,
  },
  faucet: {
    notify: process.env.FAUCET_NOTIFY_ADDRESS,
    fromAddress: process.env.FAUCET_FROM_ADDRESS,
  },
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
};

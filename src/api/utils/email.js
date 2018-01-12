const nodemailer = require('nodemailer');
const config = require('../../config/vars');

const transporter = nodemailer.createTransport({ pool: false, ...config.mail });

const noreply = '"No Reply Ghost 👻" <noreply@api-service.com>';

// const sendMail = Promise.promisify(transporter.sendMail, { context: transporter });

async function mail({ from = noreply, to, subject, message }) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(
      {
        from,
        to,
        subject,
        html: message,
      },
      (err, info) => {
        transporter.close();
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      },
    );
  });
}

module.exports = {
  mail,
};

// simple nodemailer + ethereal test script
const nodemailer = require('nodemailer');
const config = require('../../config/vars');

const transporter = nodemailer.createTransport(config.mail);

// Message object
const message = {
  from: '"API Service 👻" <ghost@api-service.com>',
  to: 'Recipient <recipient@example.com>',
  subject: 'Nodemailer is unicode friendly ✔',
  html: '<p><b>Hello</b> to myself!</p>',
};

// setup email data with unicode symbols
const mailOptions = {
  ...message,
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log(error);
  }
  console.log('Message sent: %s', info.messageId);
  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
});

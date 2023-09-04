const nodemailer = require('nodemailer');
require('dotenv').config()

const transporter = nodemailer.createTransport({
    service: `gmail`,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  exports.sendEmail = (email,text) => {
    const mailOptions = {
        from: `${process.env.EMAIL}`,
        to: email,
        subject: 'Email Subject',
        text: text
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error occurred while sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
    });
  }
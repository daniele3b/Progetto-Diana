const nodemailer = require("nodemailer");
const config = require('config')
require('dotenv').config()

let transporter = nodemailer.createTransport({
    host: config.get('email_host'),
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.USER_EMAIL, // generated ethereal user
      pass: process.env.PW_EMAIL // generated ethereal password
    }
  });


  exports.transporter=transporter
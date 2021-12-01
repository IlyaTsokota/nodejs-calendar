const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const config = require('../config');

const transporter = nodemailer.createTransport(sendgrid({
    auth: {
        'api_key': config.SENDGRID_API,
    },
}));

module.exports = transporter;

const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const mailConfigPath = path.join(__dirname, '..', 'data', 'mail.json');
const mailConfig = JSON.parse(fs.readFileSync(mailConfigPath, 'utf8'));

const transporter = nodemailer.createTransport({
  service: mailConfig.service,
  host: mailConfig.host,
  port: mailConfig.port,
  secure: mailConfig.secure, 
  auth: {
    user: mailConfig.auth.user,
    pass: mailConfig.auth.pass,
  },
});

const sendEmail = (to, subject, html) => {
  const mailOptions = {
    from: mailConfig.from,   
    to: to,                  
    subject: subject,        
    html: html, 
  };

  return transporter.sendMail(mailOptions)
    .then(info => {
      console.log("Email sent:", info.response);
      return info.response;
    })
    .catch(error => {
      console.error("Error sending email:", error);
      throw error;
    });
};

module.exports = { sendEmail };

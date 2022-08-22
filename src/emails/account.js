const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "sanockimike@gmail.com",
    subject: "Welcome to hotstreak!",
    text: `Welcome to the app, ${name}. Let us know how you found us!`,
  });
};

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "sanockimike@gmail.com",
    subject: "Goodbye!",
    text: `Thanks for using hotstreak ${name}. Your account has been deleted!\n\nIf there was anything we could have done please let us know!`,
  });
};

module.exports = { sendWelcomeEmail, sendCancelationEmail };

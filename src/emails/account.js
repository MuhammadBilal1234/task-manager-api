const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "bilalkazmi542543@gmail.com",
        subject: "This is my first Creation",
        text: `Welcome to our Home ${name}`
    });
};

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "bilalkazmi542543@gmail.com",
        subject: "This is my first Creation",
        text: `Sorry for Last Email ${name}`
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
};

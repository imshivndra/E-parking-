const mailgun = require("mailgun-js");
const sendMail = async (email, otp) => {
  const mg = mailgun({
    apiKey: "4d19684484cd8e2255c9cf736b460519-07e45e2a-2edc058f",
    domain: "sandbox7aa00be942c3454e85820c9cdb12e2d8.mailgun.org",
  });
  const data = {
    from: "eparkeasy@gmail.com",
    to: email,
    subject: "verify your park easy email",
    text: `Here Is Your   ${otp }  `
};
  await mg.messages().send(data, function (error, body) {
    if (error) console.log("error", error);

    console.log("body", body);
  });
};

module.exports = {
  sendMail,
};

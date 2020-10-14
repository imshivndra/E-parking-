const mailgun = require("mailgun-js");
const sendMail = async (email, otp) => {
  
  const mg = mailgun({
    apiKey: process.env.mailApiKey,
    domain: process.env.mailDomain,
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

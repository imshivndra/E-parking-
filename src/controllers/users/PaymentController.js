const {
  okResponse,
  badRequestError,
  to,
  unverifiedError,
  loginResponse,
} = require("../../../global_functions");
const Razorypay = require("razorpay");

// setup
const razorypay = new Razorypay({
  key_id: process.env.KEYID,
  key_secret: process.env.KEYSECRET,
});

// initate order return with order id
const initiateOrder = async (req, res) => {
  const data = req.body;

  console.log(data);

  console.log(typeof data.amount);

  razorypay.orders.create(data, (err, order) => {
    if (err) {
      return badRequestError(res, err);
    }

    return okResponse(res, order, "Order Created Successfully");
  });
};

module.exports = {
  initiateOrder,
};

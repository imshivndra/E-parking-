const jwt = require("jsonwebtoken");
const { badRequestError } = require("../../global_functions");

function VerifyJWT(req, res, next) {
  
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).send("empty token");
  jwt.verify(token, JWT_SECRET, (error, user) => {
    if (error) {
      return badRequestError(res, "authorization token expired or wrong");
    }

    req.body.email = user.email;
    req.body.userId=user.userId;

    

    next();
  });
}
module.exports = VerifyJWT;

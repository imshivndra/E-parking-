const jwt = require("jsonwebtoken");
const { badRequestError } = require("../../global_functions");

function VerifyUserJWT(req, res, next) {
  
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).send("empty token");
  jwt.verify(token, process.env.JWT_USER_SECRET, (error, user) => {
    if (error) {
      return badRequestError(res, "authorization token expired or wrong");
    }

    req.user=user;

    

    next();
  });
};

module.exports = {VerifyUserJWT
                 }

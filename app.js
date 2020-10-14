const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");

//environvent variable config
const dotenv=require('dotenv');
dotenv.config();

//Assigning port for application
const port = process.env.PORT || 6000;

//Initializing Express Router
const router = express.Router();

//knex initialisation and config
const knexConfig = require("./knexfile")[process.env.NODE_ENV || "development"];
const knex = require("knex")(knexConfig);

//objection dependencies
const { Model } = require("objection");
Model.knex(knex);

//Express middlewares
const app = express();
app
  .use(bodyParser.json())
  .use(router)
  .use(
    cors({
      credentials: true,
      origin: (origin, callback) => callback(null, true),
    })
  )
  .use(morgan("dev"));

//API routes
const user = require("./src/routes/index").user;

//REST API end points
app.use("/user", user);

//Server port
app.listen(port, () => {
  console.log("Server is up on port 6000");
});

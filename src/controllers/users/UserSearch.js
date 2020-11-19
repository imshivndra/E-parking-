const {
  okResponse,
  badRequestError,
  to,
  unverifiedError,
  loginResponse,
} = require("../../../global_functions");

const Locations = require("../../models/locationsModel");

const knexConfig = require("../../../knexfile")[
  process.env.NODE_ENV || "development"
];
const knex = require("knex")(knexConfig);

const NearByParkings = async (req, res) => {
  let { lon, lat } = req.body;
  let { userId } = req.user;

  let [error, result] = await to(
    Locations.query()
    .select("id","parkingAddress")
      .where(
        knex.raw(
          `ST_DWithin(geom, ST_MakePoint(${lon},${lat})::geography, 1000)`
        )
      )
      .returning("id","parkingAddress")
      .throwIfNotFound()
  );
  if (error) {
    console.log("error : ", error);
    return badRequestError(res, "no nearby location found ");
  }
  return okResponse(res, result, "query succed");
};

module.exports = { NearByParkings };

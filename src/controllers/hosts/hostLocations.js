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


const HostBookings = async (req, res) => {
  //let { lat, lon, parkingAddress, parkingName,noOfSpots,parkingCost,parkingDescription } = req.body;
  let { userId } = req.user;
console.log(req.body);
  const [error, result] = await to(
    Locations.query()
      .where("userId", userId)
      .select( "parkingAddress", "parkingName","noOfSpots","parkingCost","parkingDescription","parkingImage")
      .throwIfNotFound()
  );
  if (error) {
    console.log("error : ", error);
    return badRequestError(res, "NO location registered for this ID ");
  }
  return okResponse(res, result, "query succed");
};






const AddParking = async (req, res) => {
  let { lat, lon, parkingAddress, parkingName,noOfSpots,parkingCost,parkingDescription } = req.body;
  let { userId } = req.user;
console.log(req.body);
  const [error, result] = await to(
    Locations.query().insert({
      userId: userId,
      noOfSpots:noOfSpots,
      parkingName:parkingName,
      parkingAddress: parkingAddress,
      parkingCost:parkingCost,
      parkingDescription: parkingDescription,
      geom: knex.raw(
        `ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)`
      )
    })
  );
  if (error) {
    console.log(error);
    return badRequestError(res, "unable to insert location");
  }
  return okResponse(res, result, "location added");
};



module.exports = { AddParking,HostBookings, };

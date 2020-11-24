const {
  okResponse,
  badRequestError,
  to,
  unverifiedError,
  loginResponse,
} = require("../../../global_functions");

const Locations = require("../../models/locationsModel");
const Bookings = require("../../models/bookingModel");

const knexConfig = require("../../../knexfile")[
  process.env.NODE_ENV || "development"
];
const knex = require("knex")(knexConfig);

const NearByParkings = async (req, res) => {
  let { lon, lat } = req.body;
  let { userId } = req.user;

  let [error, result] = await to(
    Locations.query()
      .where(
        knex.raw(
          `ST_DWithin(geom, ST_MakePoint(${lon},${lat})::geography, 2000)`
        )
      )
      .returning("id", "parkingAddress")
      .throwIfNotFound()
  );
  if (error) {
    console.log("error : ", error);
    return badRequestError(res, "no nearby location found ");
  }
  return okResponse(res, result, "query succed");
};

const CheckTimeSlot = async (req, res) => {
  let { parkingId, bookingStartDateTime, bookingEndDateTime } = req.body;
  let spotCount;

  let [error, slot_details] = await to(
    Locations.query()
      .where("id", parkingId)
      .select("noOfSpots", "id")
      .withGraphFetched("bookings(countSpots)")
      .modifiers({
        countSpots(builder) {
          builder
            .groupBy("parkingId")
            .count("spotNo")
            .where((builder) => {
              builder
                .where("startDateTime", "<=", bookingStartDateTime)
                .andWhere("endDateTime", ">=", bookingStartDateTime);
            })
            .orWhere((builder) => {
              builder
                .where("startDateTime", "<=", bookingEndDateTime)
                .andWhere("endDateTime", ">=", bookingEndDateTime);
            });
        },
      })
  );

  if (error) {
    console.log("error : ", error);
    return badRequestError(res, "no nearby location found ");
  }

  if (slot_details[0].bookings.length == 0) {
    spotCount = 0;
  } else {
    let count = slot_details.bookings[0].count;
    spotCount = parseInt(count, 10);
  }

  if (slot_details[0].noOfSpots > spotCount) {
    return okResponse(res, slot_details, "Succed ! ");
  }

  return badRequestError(res, "All parking spaces are full");
};

module.exports = { NearByParkings, CheckTimeSlot };

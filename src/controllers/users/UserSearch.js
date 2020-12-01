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



const ParkingDetails = async (req, res) => {
  let { id } = req.body;
  //let { userId } = req.user;
console.log(id);
  let [error, result] = await to(
    Locations.query()
      .where("id", id)
      .select("id", "parkingAddress","parkingName", "parkingDescription", "parkingCost", "parkingImage")
      .throwIfNotFound()
  );
  if (error) {
    console.log("error : ", error);
    return badRequestError(res, "NO description for this locationID ");
  }
  return okResponse(res, result, "query succed");
};



const NearByParkings = async (req, res) => {
  let { lon, lat } = req.body;
  let { userId } = req.user;

  let [error, result] = await to(
    Locations.query()
      .where(
        knex.raw(
          `ST_DWithin(geom, ST_MakePoint(${lon},${lat})::geography, 1500)`
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




/*const CheckTimeSlot = async (req, res) => {
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
};*/
//Book Parking Space

const BookParkingSpace = async (req, res) => {
  let { parkingId, bookingStartDateTime, bookingEndDateTime } = req.body;
  let { userId } = req.user;
  let spotAssigned;
  let x;

  let [error, slot_details] = await to(
    Locations.query()
      .where("id", parkingId)
      .select("noOfSpots", "id")
      .withGraphFetched(
        "[bookings(countSpots) as spotCount,bookings(selectSpot) as spotNo]"
      )
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
        selectSpot(builder) {
          builder.select("spotNo").where("parkingId", parkingId);
        },
      })
  );

  if (error) {
    console.log("error : ", error);
    return badRequestError(res, "no nearby location found ");
  }

  if (slot_details[0].spotCount.length == 0) {
    spotCount = 0;
  } else {
    let count = slot_details[0].spotCount[0].count;
    spotCount = parseInt(count, 10);
  }

  if (slot_details[0].noOfSpots > spotCount) {
    console.log("slot details  ", slot_details);

    for (i = 1; i <= slot_details[0].noOfSpots; i++) {
      console.log("inside For loop");
      console.log(
        "if condition : ",
        slot_details[0].spotNo.filter((spot) => spot.spotNo == i)
      );
      if (
        slot_details[0].spotNo.filter((spot) => spot.spotNo == i).length == 0
      ) {
        spotAssigned = i;
        console.log("Spot Assigned : ", spotAssigned);
        console.log("iteration no: ", i);

        let [bookingError, Booked] = await to(
          Bookings.query()
            .insert({
              parkingId,
              startDateTime: bookingStartDateTime,
              endDateTime: bookingEndDateTime,
              userId,
              spotNo: spotAssigned,
            })
            .returning("*")
        );

        if (bookingError) {
          console.log("booking error ", bookingError);
          badRequestError(res, "unable to insert booking details");
        }

        return okResponse(res, Booked, "Booking Completed ");

        break;
      }
    }
  } else {
    return badRequestError(res, "All parking spaces are full");
  }
};

module.exports = { ParkingDetails, NearByParkings,  BookParkingSpace };

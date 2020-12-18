const express = require("express");
const { UserSearchController } = require("../../controllers");
const VerifyUserJWT = require("../../middleware/jwt").VerifyUserJWT;
const VerifyHostJWT = require("../../middleware/jwt").VerifyHostJWT;
const UserAuthController = require("../../controllers/index")
  .UserAuthController;

const PaymentController = require("../../controllers/index").PaymentController;

const router = express.Router();

//API routes for Users
router.post("/signup", UserAuthController.SignUp);
router.post("/verifyotp", UserAuthController.VerifyOTP);
router.post("/login", UserAuthController.Login);
router.post("/forgotpassword", UserAuthController.ForgotPassword);
router.get("/verifyresetlink", UserAuthController.ResetLink);
router.post("/resetpassword", UserAuthController.ResetPassword);
router.post(
  "/changeuserpassword",
  VerifyUserJWT,
  UserAuthController.ChangePassword
);

//User search API
router.post("/nearbyparking", UserSearchController.NearByParkings);
router.post(
  "/nearbyparkingwithlocation",
  UserSearchController.NearByParkingsByPlace
);
router.post(
  "/parkingdetails",
  VerifyUserJWT,
  UserSearchController.ParkingDetails
);

//router.post('/timeslot',UserSearchController.CheckTimeSlot);
router.post("/bookspace", VerifyUserJWT, UserSearchController.BookParkingSpace);

//only dor development

router.delete("/delete", UserAuthController.Delete);

// transaction Routes
router.post("/payment", VerifyUserJWT, PaymentController.initiateOrder);

module.exports = router;

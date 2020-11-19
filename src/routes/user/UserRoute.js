const express=require("express");
const { UserSearchController } = require("../../controllers");
const VerifyUserJWT=require("../../middleware/jwt").VerifyUserJWT;
const VerifyHostJWT=require("../../middleware/jwt").VerifyHostJWT;
const UserAuthController=require("../../controllers/index").UserAuthController;





const router=express.Router();

//API routes for Users 
router.post('/signup',UserAuthController.SignUp);
router.post('/verifyotp',UserAuthController.VerifyOTP);
router.post('/login',UserAuthController.Login);
router.post('/forgotpassword',UserAuthController.ForgotPassword);
router.get("/verifyresetlink",UserAuthController.ResetLink);
router.post('/resetpassword',UserAuthController.ResetPassword);
router.post('/changeuserpassword',VerifyUserJWT,UserAuthController.ChangePassword);

//User search API
router.post('/nearbyparking',VerifyUserJWT,UserSearchController.NearByParkings);



//only dor development

router.delete('/delete',UserAuthController.Delete);









module.exports=router;
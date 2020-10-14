const express=require("express");
const VerifyJWT=require("../../middleware/jwt");
const UserAuthController=require("../../controllers/index").UserAuthController;





const router=express.Router();

//API routes for Users 
router.post('/signup',UserAuthController.SignUp);
router.post('/verifyotp',UserAuthController.VerifyOTP);
router.post('/login',UserAuthController.Login);
router.post('/forgotpassword',UserAuthController.ForgotPassword);
router.get("/verifyresetlink",UserAuthController.ResetLink);
router.post('/resetpassword',UserAuthController.ResetPassword);
router.post('/changepassword',VerifyJWT,UserAuthController.ChangePassword);




//only dor development
router.delete('/delete',UserAuthController.Delete);









module.exports=router;
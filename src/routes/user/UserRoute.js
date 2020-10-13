const express=require("express");
const UserAuthController=require("../../controllers/index").UserAuthController;





const router=express.Router();

//API routes for Users 
router.post('/signup',UserAuthController.SignUp);
router.delete('/delete',UserAuthController.Delete);








module.exports=router;
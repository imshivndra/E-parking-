const express=require("express");
const { VerifyUserJWT } = require("../../middleware/jwt");  
const router=express.Router();

const HostLocations=require("../../controllers/index").HostLocations;



router.post('/addparking',VerifyUserJWT,HostLocations.AddParking);


module.exports=router;
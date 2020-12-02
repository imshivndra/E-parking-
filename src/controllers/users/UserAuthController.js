const {
  okResponse,
  badRequestError,
  to,
  unverifiedError,
  loginResponse,
} = require("../../../global_functions");
const Users = require("../../models/usersModel");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const { sendMail } = require("../../mailService/mailer");

const SignUp = async (req, res) => {
  let { email, password,userType } = req.body;
  console.log("mail key", process.env.mailApiKey);

  //Default profile picture URL
  const userProfileImage =
    "https://res.cloudinary.com/hmwv9zdrw/image/upload/v1600970783/user_vopbzk.png";


    if (!userType)
    return badRequestError(res, "userType not defined");
  
    //email and password validation before inserting user
  if (!validator.isEmail(email || ""))
    return badRequestError(res, "Enter a valid email address");
  if (password === "") return badRequestError(res, "password can not be empty");

  let [error, result] = await to(Users.query().where("email", email).first());
  if (error) console.log(error);
  if (result) {
    console.log(result);
    return badRequestError(res, " email already exists");
  }

  password = await bcrypt.hash(password, 10); //hashing password on validating email and pass

  //generating time based otp for verification using speakeasy
  let otp = speakeasy.totp({
    secret: process.env.OTP_SECRET + email,
    encoding: "base32",
  });

  //inserting user details
  let [err, user_inserted] = await to(
    Users.query()
      .insert({ email, password, userProfileImage,userType, otp })
      .returning("*")
  );
  if (err) badRequestError(res, "unable to insert user");

  //sending token through mailgun api
  sendMail(email, `OTP ${otp}`);
  //returning response on insertion
  delete user_inserted.password;
  console.log("USER ki detail ", user_inserted);
  return okResponse(res, "user inserted successfully");
};

//verifies signup  OTP

const VerifyOTP = async (req, res) => {
  let access_token;
  let { otp, email } = req.body;
  let token_validates = await speakeasy.totp.verify({
    secret: process.env.OTP_SECRET + email,
    encoding: "base32",
    token: otp,
    window: 6,
  });

  //if  OTP is Matched
  if (token_validates === true) {
    let [error, verified] = await to(
      Users.query()
        .update({ isEmailVerified: true })
        .where("email", email)
        .first()
        .andWhere("otp", otp)
        .returning("*")
        .throwIfNotFound()
    );

    if (error) {
      console.log(error);
      return unverifiedError(res, "Wrong OTP");
    }
   
       access_token = jwt.sign(
        { email: verified.email, userId: verified.id,userType:verified.userType},
        process.env.JWT_USER_SECRET,
        {
          expiresIn: "5h",
        }
      )
    
     
        
      const isEmailVerified = verified.isEmailVerified;

      res.setHeader("Authorization", access_token);
      res.setHeader("access-control-expose-headers", "authorization");
      return okResponse(res, { isEmailVerified }, "email verified");
        }   
   else return badRequestError(res, "wrong OTP");
};


//Login User

const Login = async (req, res) => {
  let access_token;
  let { email, password } = req.body;
  if (!validator.isEmail(email || ""))
    return badRequestError(res, "Enter a valid email address ");
  if (password === "") return unverifiedError(res, "password field is empty");
  let [incorrect, user_returned] = await to(
    Users.query().findOne("email", email).throwIfNotFound()
  );

  if (incorrect) return badRequestError(res, "email does not exists");

  //Checking whether email is verified
  if (user_returned.isEmailVerified === true) {
    //checking password
    if (await bcrypt.compare(password, user_returned.password)) {
      //Generating JWT token on correct password for USER type

      
       access_token = await jwt.sign(
        { email, userId: user_returned.id,userType:user_returned.userType },
        process.env.JWT_USER_SECRET,
        {
          expiresIn: "5h",
        }
      );
           
      res.setHeader("Authorization", access_token);
      res.setHeader("access-control-expose-headers", "authorization");

      delete user_returned.password;
      return okResponse(res,user_returned,"loged in successfully");
    }
    //Error returned when password is invalid
    return unverifiedError(res, "invalid password");
  }

  //if email id is not verified

  if (user_returned.isEmailVerified === false) {
    //checking password
    if (await bcrypt.compare(password, user_returned.password)) {
      //generating OTP to send on registered email
      let otp = speakeasy.totp({
        secret: process.env.OTP_SECRET + email,
        encoding: "base32",
      });
      sendMail(email, `OTP ${otp}`); //sending token on registered email id

      //inserting OTP in users db
      let [error, updated] = await to(
        Users.query()
          .where("email", email)
          .first()
          .update({ otp: otp })
          .returning("email")
          .throwIfNotFound()
      );
      if (updated)
        return loginResponse(res, null, false, "token sent to your email");
      else return console.log(error);
    }
    return unverifiedError(res, "invalid password");
  }
};
//Forgot password
//sending reset password link on user's email

const ForgotPassword = async (req, res) => {
  let { email } = req.body;

  if (!validator.isEmail(email || ""))
    return badRequestError(res, "Enter a valid email address ");

  let [not_found, user_returned] = await to(
    Users.query().findOne("email", email).throwIfNotFound()
  );
  if (not_found) return badRequestError(res, "email id not registered");

  //creating reset token
  let verification_token = await jwt.sign(
    { email: email },
    process.env.JWT_SECRET,
    {
      expiresIn: "600s",
    }
  );

  let verification_link =
    "http://localhost:3000/reset-password/verifyresetlink?verification_link=" +
    verification_token;

  sendMail(email, `verfication link ${verification_link}`);
  return okResponse(res, null, "verification link is sent to your email ");
};
//Reset link for new password

const ResetLink = (req, res) => {
  verification_link = req.query.verification_link;
  if (!verification_link) return badRequestError(res, "empty link");
  jwt.verify(verification_link, process.env.JWT_SECRET, (error, result) => {
    if (error) return badRequestError(res, "not verified");
    else {
      let reset_token = jwt.sign({ email: result.email }, process.env.JWT_SECRET, {
        expiresIn: "600s",
      });
      return okResponse(res, reset_token, "verified");
    }
  });
};

//reset password
const ResetPassword = async (req, res) => {
  let access_token;
  let { reset_token, password } = req.body;
  //verifying reset token for changing password
  jwt.verify(
    reset_token,
    process.env.JWT_SECRET,
    async (notverified, verified) => {
      if (notverified) return badRequestError(res, "password not changed");
      if (verified) {
        let email = verified.email;
        let hashed_password = await bcrypt.hash(password, 10);
        let [error, user_updated] = await to(
          Users.query()
            .findOne("email", email)
            .update({ password: hashed_password })
            .throwIfNotFound()
        );
        if (error) return badRequestError(res, "unable to insert password");

        delete user_updated.password;

        //Generating JWT token  for USER type
       
         access_token = jwt.sign(
          { email, userId: user_updated.id,userType:user_updated.userType },
          process.env.JWT_USER_SECRET,
          { expiresIn: "2h" }
        );
         

        res.setHeader("Authorization", access_token);
        res.setHeader("access-control-expose-headers", "authorization");

        return okResponse(res, user_updated, "password changed successfully");
      }
    }
  );
};
// Change user password
const ChangePassword = async (req, res) => {
  let { new_password, old_password,email } = req.body;
  if (!email) return badRequestError(res, "email field is empty");
  if (!new_password || !old_password)
    return badRequestError(res, "password field is empty");

  let [error, user_detail] = await to(
    Users.query()
      .findOne("email", email)
      .returning("password")
      .throwIfNotFound()
  );
  if (user_detail) {
    //checking old password entered by user
    if (await bcrypt.compare(old_password, user_detail.password)) {
      //if matched then hashing new password
      let new_hashed_password = await bcrypt.hash(new_password, 10);
      let [err, password_updated] = await to(
        Users.query()
          .where("email", email)
          .update({ password: new_hashed_password })
          .throwIfNotFound()
      );
      if (password_updated)
        return okResponse(res, undefined, "password changed successfully");
    } else {
      return badRequestError(res, "old password did not match");
    }
  }
};

//ignore only for testing

const Delete = async (req, res) => {
  let {id}=req.body;
  let [error, deleted] = await to(Users.query().where("id",id).delete().throwIfNotFound());
  if (error) badRequestError(res, "unable to delete");
  okResponse(res, deleted, "delete successfull");
};

module.exports = {
  SignUp,
  Delete,
  VerifyOTP,
  Login,
  ForgotPassword,
  ResetPassword,
  ChangePassword,
  ResetLink
};

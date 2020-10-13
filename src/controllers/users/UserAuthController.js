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
const {sendMail}=require("../../mailService/mailer");

const SignUp = async (req, res) => {
  let { email, password } = req.body;

  //Default profile picture URL
  const userProfileImage =
    "https://res.cloudinary.com/hmwv9zdrw/image/upload/v1600970783/user_vopbzk.png";

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
      .insert({ email, password, userProfileImage, otp })
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







//ignore only for testing

const Delete = async (req, res) => {
  let [error, deleted] = await to(Users.query().delete());
  if (error) badRequestError(res, "unable to delete");
  okResponse(res, deleted, "delete successfull");
};

module.exports = {
  SignUp,
  Delete
};

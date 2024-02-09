const express = require("express")
const router = new express.Router()
const accCont = require("../controllers/accountController")
const utilities = require("../utilities/")
const accValidate = require("../utilities/account-validation")

//Route to access account
router.get("/", utilities.checkLogin, accCont.buildAccount)
// Route to Login
router.get("/login", utilities.handleErrors(accCont.buildLogin))
// Route to Register
router.get("/register", utilities.handleErrors(accCont.buildRegister))
// Route to Account Update
router.get("/update", accCont.buildUpdateView)
// Route to Password Update
router.get("/update/password", accCont.buildUpdateView)


// Route to Post Register
router.post("/register", accValidate.registrationRules(), accValidate.checkRegData, utilities.handleErrors(accCont.registerAccount))
// Process the login attempt
router.post(
  "/login",
  accValidate.loginRules(),
  accValidate.checkLoginData,
  utilities.handleErrors(accCont.accountLogin)
)
// Process Update Attempt
router.post("/update",accValidate.updateAccountRules(), accValidate.checkUpdateData, accCont.updateData )
router.post("/update/password", accValidate.updatePasswordRules(), accValidate.checkUpdatePasswordData, accCont.updatePassword )


  
module.exports = router
const express = require("express")
const router = new express.Router()
const accCont = require("../controllers/accountController")
const utilities = require("../utilities/")
const accValidate = require("../utilities/account-validation")

//Route to access account
router.get("/", utilities.checkLogin, utilities.handleErrors(accCont.buildAccount))
// Route to Login
router.get("/login", utilities.handleErrors(accCont.buildLogin))
// Route to Register
router.get("/register", utilities.handleErrors(accCont.buildRegister))
// Route to Account Update
router.get("/update", utilities.handleErrors(accCont.buildUpdateView))
// Route to Password Update
router.get("/update/password", utilities.handleErrors(accCont.buildUpdateView))
// Route to Password Update
router.get("/orders", utilities.handleErrors(accCont.buildOrderHistoryView))


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
router.post("/update",accValidate.updateAccountRules(), accValidate.checkUpdateData, utilities.handleErrors(accCont.updateData))
router.post("/update/password", accValidate.updatePasswordRules(), accValidate.checkUpdatePasswordData, utilities.handleErrors(accCont.updatePassword))


  
module.exports = router
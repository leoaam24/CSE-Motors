const express = require("express")
const router = new express.Router()
const accCont = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require("../utilities/account-validation")

// Route to Login
router.get("/login", utilities.handleErrors(accCont.buildLogin))

// Route to Register
router.get("/register", utilities.handleErrors(accCont.buildRegister))

// Route to Post Register
router.post("/register", regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accCont.registerAccount))

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors((req, res) => {
    res.status(200).send('login process')
  })
)
  
module.exports = router
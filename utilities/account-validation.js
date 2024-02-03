const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
    return [
        //first name is required must be a string
        body("account_firstname")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a firstname."), //on error this message is sent.

        //last name is required and must be a string
        body("account_lastname")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a last name."), //on error this message is sent.

        // valid email is required and cannot already exist in the DB
        body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists){
              throw new Error("Email exists. Please log in or use different email.")
            }
          }),

        body("account_password")
        .trim()
        .isStrongPassword({ 
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
}

/* *******************************************************
 * Check data and return errors or continue to registration
 * ******************************************************/
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Register",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

/* ******************
 * Login Rules
 * *****************/
validate.loginRules = () => {
    return [
     
        // valid email is required and has to exist
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required.")
            .custom(async (account_email, {req})  => {
                const account_password = req.body.account_password
                //Check Email is valid
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (!emailExists){
                  throw new Error("Email is not registered. Please register or try a different email")
                }
                const isValidCredentials = await accountModel.checkCredentials(account_email, account_password)
                console.log(isValidCredentials)
                if(!isValidCredentials){
                    throw new Error("Invalid email or password")
                }
            }),
   
        // password is required and must be strong password
        // body("account_password")
        //     .trim()
        //     .isLength({min: 12})
        //     .withMessage("Password must have at least 12 characters length"),
           
    ]
}


/* ******************
 * Check Login Data
 * *****************/
validate.checkLoginData = async (req, res, next) => {
    const { account_email, account_password } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
          errors,
          title: "Login",
          nav,
          account_email
        })
        return
      }
      next()
}


module.exports = validate
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}
const jwt = require("jsonwebtoken")

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
        let responseLogin = res.locals.loggedin
        res.render("account/register", {
            responseLogin,
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
        let responseLogin = res.locals.loggedin
        let nav = await utilities.getNav()
        res.render("account/login", {
          errors,
          title: "Login",
          nav,
          account_email,
          responseLogin
        })
        return
      }
      next()
}

/*  **********************************
 *  Update Account Data Validation Rules
 * ********************************* */
validate.updateAccountRules = () => {
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
        .custom(async (account_email, {req})  => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            const emailExistsValue = utilities.checkEmailFromToken(req)
            if (emailExists)
            {
                if(emailExistsValue == account_email){
                    return true
                } else {
                    throw new Error("Email exists. Please log in or use different email.")
                }
            }
        }),
    ]
}

/*  **********************************
 *  Update Password Data Validation Rules
 * ********************************* */
validate.updatePasswordRules = () => {
    return [
        body("old_account_password")
        .trim()
        .isStrongPassword({ 
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Invalid Password.")
        .custom(async (old_account_password, {req}) => {
            let token = req.cookies.jwt
            let decoded = jwt.decode(token)
            let account_email = decoded.account_email
            const isValidPassword = await accountModel.matchAccountPass(account_email, old_account_password)
            console.log(isValidPassword)
            if (!isValidPassword) {
                throw Error("Old password didn't match.")
            }
        }),

        body("new_account_password")
        .trim()
        .isStrongPassword({ 
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Please enter a valid password.")
    ]
}


/* *******************************************************
 * Check data and return errors or continue to update
 * ******************************************************/
validate.checkUpdateData = async (req, res, next) => {
    const { account_firstname, account_lastname } = req.body
    let errors = []
    errors = validationResult(req)
    let account_email = await utilities.checkEmailFromToken(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let responseLogin = res.locals.loggedin
        res.render("account/update", {
            responseLogin,
            errors,
            title: "Update Account",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

/* *******************************************************
 * Check data and return errors or continue to update password
 * ******************************************************/
validate.checkUpdatePasswordData = async (req, res, next) => {
    let token = req.cookies.jwt
    let decoded = jwt.decode(token)
    let decode_account_email = decoded.account_email
    const accountData = await accountModel.getAccountByEmail(decode_account_email)
    let account_firstname = accountData.account_firstname
    let account_lastname = accountData.account_lastname
    let account_email = accountData.account_email
    const { old_account_password } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let responseLogin = res.locals.loggedin
        res.render("account/update/password", {
            responseLogin,
            errors,
            title: "Update Password",
            nav,
            account_firstname,
            account_lastname,
            account_email
        })
        return
    }
    next()
}

module.exports = validate
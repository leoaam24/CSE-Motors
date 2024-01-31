const utilities = require(".")
const { body, validationResult } = require("express-validator")
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
        .withMessage("A valid email is required"),

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

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

module.exports = validate
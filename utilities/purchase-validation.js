const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const validate = {}

/* *******************
 * Confirm Purchase Rules
 * ******************/
validate.confirmPurchaseRules = () => {
    return [

        body("delivery_address")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a valid address."),

        body("phone_number")
        .trim()
        .isNumeric()
        .isLength({ min: 7 })
        .withMessage("Please provide a valid phone number."), 

    ]
}

/* *************************
 * Check Confirm Purchase Post
 * ************************/
validate.checkConfirmPurchPost = async function(req, res, next) {
    const {delivery_address, phone_number, vehicle_id} = req.body
    let errors = []
    errors = validationResult(req)
    let data = await invModel.getInventoryByInventoryId(vehicle_id)
    let inv_make = data[0].inv_make
    let inv_model = data[0].inv_model
    let inv_year = data[0].inv_year
    let inv_price = data[0].inv_price
    let inv_image = data[0].inv_image
    let inv_id = data[0].inv_id
    if (!errors.isEmpty()) {
        let responseLogin = res.locals.loggedin
        let nav = await utilities.getNav()
        res.render("inventory/confirm-purchase", {
            responseLogin,
            errors,
            title: "Purchase",
            nav,
            inv_make,
            inv_model,
            inv_year,
            inv_price,
            inv_id,
            inv_image,
            delivery_address,
            phone_number
        })
        return
    }
    next()
}

module.exports = validate
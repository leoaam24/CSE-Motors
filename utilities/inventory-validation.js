const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const validate = {}

/* *******************
 * Add Inventory Rules
 * ******************/
validate.addInventoryRules = () => {
    return [

        body("inv_make")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide the make of the car."),

        body("inv_model")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide the model of the car."),

        body("inv_year")
        .trim()
        .isLength({ min: 4 })
        .withMessage("Please provide the year of the car."),

        body("inv_description")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a short description of the car."),

        // body("inv_image")
        // .trim()
        // .isLength({ min: 1 })
        // .withMessage("Please provide the image file of the car."),

        // body("inv_thumbnail")
        // .trim()
        // .isLength({ min: 1 })
        // .withMessage("Please provide the thumbnail file of the car."),

        body("inv_price")
        .trim()
        .isNumeric()
        .isLength({ min: 1 })
        .withMessage("Please provide the price of the car."), 

        body("inv_miles")
        .trim()
        .isNumeric()
        .isLength({ min: 1 })
        .withMessage("Please provide the milage of the car."), 
    ]
}

/* *************************
 * Check Add Inventory Post
 * ************************/
validate.checkAddInventoryPost = async function(req, res, next) {
    const {inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles} = req.body
    let errors = []
    errors = validationResult(req)
    let classData = await invModel.getClassifications()
    let classNames = []
    classData.rows.forEach(classfication => {
    classNames.push(classfication) 
    })
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-inventory", {
            errors,
            title: "Add Inventory",
            nav,
            classNames
        })
        return
    }
    next()
}

/* ************************
 * Add Classification Rules
 * ************************/
validate.addClassificationRules = () => {
    return [

        body("classification_name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide the new car classification.")
        .custom(async (classification_name) => {
            const classExist = await invModel.checkExistingClassification(classification_name)
            console.log(classExist)
            if (classExist) {
                throw new Error('Classification Exists. Please enter a new one.')
            }
        })
    ]
}

/* *****************************
 * Check Add Classification POST
 * *****************************/
validate.checkAddClassification = async function(req, res, next) {
    const {classification_name} = req.body
    console.log(classification_name)
    let errors = []
    errors = validationResult(req)
    console.log(errors)
    if (!errors.isEmpty()){
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add Classification",
            nav
        })
        return
    } 
    next()
   


}



module.exports = validate
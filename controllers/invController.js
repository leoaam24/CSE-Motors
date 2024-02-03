const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
    } catch(err) {
        console.log(err)
        throw(err)
    }
    
}

/* ***************************
 *  Build inventory by inventory view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
    try {
    const inventory_id = req.params.inventoryId
    const data = await invModel.getInventoryByInventoryId(inventory_id)
    const grid = await utilities.buildInventoryGrid(data)
    let nav = await utilities.getNav()
    const inventoryName = data[0].inv_make
    res.render("./inventory/inventoryId", {
        title: inventoryName,
        nav,
        grid,
    })
    } catch(err){
        throw(err)
    }
}

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagementView = async function(req, res, next){
    try {
        let nav = await utilities.getNav()
        res.render("./inventory/management", {
            errors: null,
            title: "Management View",
            nav,
        })
    } catch(err) {
        throw(err)
    }
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassificationView = async function(req, res, next){
    try {
        let nav = await utilities.getNav()
        res.render("./inventory/add-classification", {
            errors: null,
            title: "Add Classification",
            nav,
        })
    } catch(err){
        throw(err)
    }
}

/* ***************************
 *  Process Add Classification
 * ************************** */
invCont.addClassificationDatabase = async function(req, res){
    let nav = await utilities.getNav()
    const { classification_name } = req.body
    console.log(classification_name)
    const addClass = await invModel.addClassDatabase(classification_name)

    if (addClass) {
        req.flash(
            "notice",
            `New Classification named ${classification_name} was added.`
        )
        res.status(200).render("inventory/add-classification", {
            errors: null,
            title: "Add Classification",
            nav
        })
    } else {
        req.flash("notice", "Sorry, the registration failed")
        res.status(500).render("inventory/add-classification", {
            title: "Add Classification",
            nav,
            classification_name,
        })
    }

}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventoryView = async function(req, res, next){
    try {
        let nav = await utilities.getNav()
        let classData = await invModel.getClassifications()
        let classNames = []
        classData.rows.forEach(classfication => {
           classNames.push(classfication) 
        })
        res.render("inventory/add-inventory", {
            errors: null,
            title: "Add Inventory",
            nav,
            classNames,
        })
    } catch(err){
        throw(err)
    }
}

/* ***************************
 *  Process Add Inventory
 * ************************** */
invCont.addInventoryDatabase = async function(req, res){
    let nav = await utilities.getNav()
    const { 
        inv_make, 
        inv_model, 
        inv_year, 
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id } = req.body
    const addInventory = await invModel.addInvDatabase(
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
    )
    if (addInventory) {
        let classData = await invModel.getClassifications()
        let classNames = []
        classData.rows.forEach(classfication => {
           classNames.push(classfication) 
        })
        req.flash(
            "notice",
            `New Car Added to the Inventory.`
        )
        res.status(200).render("./inventory/add-inventory", {
            errors: null,
            title: "Add Inventory",
            nav,
            classNames,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed")
        res.status(500).render("./inventory/add-inventory", {
            errors: null,
            title: "Add Inventory",
            nav,
        })
    }

}



module.exports = invCont



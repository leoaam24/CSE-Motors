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
    let responseLogin = res.locals.loggedin
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        responseLogin,
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
    let responseLogin = res.locals.loggedin
    const inventoryName = data[0].inv_make
    res.render("./inventory/inventoryId", {
        responseLogin,
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
        let responseLogin = res.locals.loggedin
        const decodedToken = utilities.checkCredentials(req, res, next)
        const classificationSelect = await invModel.getClassifications()
        if (decodedToken.account_type == 'Employee' || decodedToken.account_type == 'Admin') {
                req.flash("notice", `You have logged in as ${decodedToken.account_type}`)
                res.render("./inventory/management", {
                responseLogin,
                errors: null,
                title: "Management View",
                nav,
                classificationSelect
            })
        } else {
            req.flash("notice", "Welcome Customer")
            res.redirect("/")
        }
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
        let responseLogin = res.locals.loggedin
        res.render("./inventory/add-classification", {
            responseLogin,
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
    let responseLogin = res.locals.loggedin
    const { classification_name } = req.body
    console.log(classification_name)
    const addClass = await invModel.addClassDatabase(classification_name)

    if (addClass) {
        req.flash(
            "notice",
            `New Classification named ${classification_name} was added.`
        )
        res.status(200).render("inventory/add-classification", {
            responseLogin,
            errors: null,
            title: "Add Classification",
            nav
        })
    } else {
        req.flash("notice", "Sorry, the registration failed")
        res.status(500).render("inventory/add-classification", {
            responseLogin,
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
        let responseLogin = res.locals.loggedin
        let classData = await invModel.getClassifications()
        let classNames = []
        classData.rows.forEach(classfication => {
           classNames.push(classfication) 
        })
        res.render("inventory/add-inventory", {
            responseLogin,
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
        let responseLogin = res.locals.loggedin
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
            responseLogin,
            errors: null,
            title: "Add Inventory",
            nav,
            classNames,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed")
        res.status(500).render("./inventory/add-inventory", {
            responseLogin,
            errors: null,
            title: "Add Inventory",
            nav,
        })
    }

}

/* ***************************
 *  Process Upadte Inventory
 * ************************** */
invCont.updateInventory = async function(req, res, next){
    let nav = await utilities.getNav()
    let responseLogin = res.locals.loggedin
    const { 
        inv_id,
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
    const updateResult = await invModel.updateInventory(
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
        inv_id
    )
    if (updateResult) {
        console.log(updateResult)
        const itemName = updateResult.inv_make + " " + updateResult.inv_model
        req.flash(
            "notice",
            `The ${itemName} was successfully updated.`
        )
        res.redirect("/inv")
    } else {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model
        let classificationSelect = await invModel.getClassifications()
        req.flash("notice", "Sorry, the insert failed")
        res.status(500).render("inventory/edit-inventory", {
            responseLogin,
            errors: null,
            title: "Edit " + itemName,
            nav,
            classificationSelect: classificationSelect,
            inv_id,
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
        })
    }

}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async function (req, res, next) {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

/* ***************************
 *  Build Inventory Edit Form
 * ************************** */
invCont.buildInventoryEditView = async function(req, res, next){
    try {
        let nav = await utilities.getNav()
        let responseLogin = res.locals.loggedin
        const inv_id = parseInt(req.params.inventory_id)
        let itemRawData = await invModel.getInventoryByInventoryId(inv_id)
        let itemData = itemRawData[0]
        console.log(itemData)
        const classificationSelect = await invModel.getClassifications()
        console.log(classificationSelect)
        const itemName =`${itemData.inv_make} ${itemData.inv_model}`
        res.render("./inventory/edit-inventory", {
            responseLogin,
            errors: null,
            title: "Edit " + itemName,
            nav,
            classificationSelect: classificationSelect,
            inv_id: itemData.inv_id,
            inv_make: itemData.inv_make,
            inv_model: itemData.inv_model,
            inv_year: itemData.inv_year,
            inv_description: itemData.inv_description,
            inv_image: itemData.inv_image,
            inv_thumbnail: itemData.inv_thumbnail,
            inv_price: itemData.inv_price,
            inv_miles: itemData.inv_miles,
            inv_color: itemData.inv_color,
            classification_id: itemData.classification_id
        })
    } catch(err){
        throw(err)
    }
}

/* ***************************
 *  Build Delete Inventory View
 * ************************** */
invCont.buildDeleteInvView = async function(req, res, next){
    try {
        let nav = await utilities.getNav()
        let responseLogin = res.locals.loggedin
        const inv_id = parseInt(req.params.inventory_id)
        let itemRawData = await invModel.getInventoryByInventoryId(inv_id)
        let itemData = itemRawData[0]
        const itemName =`${itemData.inv_make} ${itemData.inv_model}`
        res.render("./inventory/delete-inventory", {
            responseLogin,
            errors: null,
            title: "Delete " + itemName,
            nav,
            inv_id: itemData.inv_id,
            inv_make: itemData.inv_make,
            inv_model: itemData.inv_model,
            inv_year: itemData.inv_year,
            inv_price: itemData.inv_price,
        })
    } catch(err){
        throw(err)
    }
}

/* ***************************
 *  Process Delete Inventory
 * ************************** */
invCont.deleteInventory = async function(req, res, next){
    let nav = await utilities.getNav()
    let responseLogin = res.locals.loggedin
    const { 
        inv_id,
    } = req.body
    const deleteResult = await invModel.deleteInventory(
        inv_id
    )
    if (deleteResult) {
        req.flash(
            "notice",
            "The selected item was successfully deleted."
        )
        res.redirect("/inv")
    } else {
        const itemName = deleteResult.inv_make + " " + deleteResult.inv_model
        req.flash("notice", "Sorry, the deletion failed")
        res.status(500).render("inventory/delete-inventory", {
            responseLogin,
            errors: null,
            title: "Delete " + itemName,
            nav,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_price,
        })
    }

}


module.exports = invCont



const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const invValidation = require('../utilities/inventory-validation')
const utilities = require("../utilities/")

//Route to management view
router.get('/', utilities.handleErrors(invController.buildManagementView))
//Route to build add classification
router.get('/addClassification', utilities.handleErrors(invController.buildAddClassificationView))
//Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
//Route to build inventory by inventory view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId))
//Route to build add inventory view
router.get("/addInventory", utilities.handleErrors(invController.buildAddInventoryView))

//Route to post add classification
router.post('/addClassification', invValidation.addClassificationRules(), invValidation.checkAddClassification, utilities.handleErrors(invController.addClassificationDatabase))
//Route to post add inventory
router.post('/addInventory', invValidation.addInventoryRules(), invValidation.checkAddInventoryPost, utilities.handleErrors(invController.addInventoryDatabase))

module.exports = router;
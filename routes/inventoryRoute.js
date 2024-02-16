const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const invValidation = require('../utilities/inventory-validation')
const purchValidation = require("../utilities/purchase-validation")
const utilities = require("../utilities/")

//Route to management view
router.get('/', utilities.handleErrors(invController.buildManagementView))
//Route to build add classification
router.get('/addClassification/', utilities.handleErrors(invController.buildAddClassificationView))
//Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
//Route to build inventory by inventory view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId))
//Route to build add inventory view
router.get("/addInventory/", utilities.handleErrors(invController.buildAddInventoryView))
//Route for Inventory Management View
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))
// Route for Inventory Edit
router.get("/edit/:inventory_id", utilities.handleErrors(invController.buildInventoryEditView))
//Route for Deleting Invetory Entry
router.get("/delete/:inventory_id", utilities.handleErrors(invController.buildDeleteInvView))

//Route to post add classification
router.post('/addClassification/', invValidation.addClassificationRules(), invValidation.checkAddClassification, utilities.handleErrors(invController.addClassificationDatabase))
//Route to post add inventory
router.post('/addInventory/', invValidation.addInventoryRules(), invValidation.checkAddInventoryPost, utilities.handleErrors(invController.addInventoryDatabase))
//Route to post edit inventory
router.post('/update/',invValidation.addInventoryRules(), invValidation.checkUpdateData, utilities.handleErrors(invController.updateInventory))
//Route to post delete inventory
router.post('/delete/', utilities.handleErrors(invController.deleteInventory))
//Route to post purchase confirm
router.post('/detail/checkout/:inventory_id', utilities.checkLogin, utilities.handleErrors(invController.buildConfirmPurchaseView))
//Route to post process purchase
router.post('/thank-you', purchValidation.confirmPurchaseRules(), purchValidation.checkConfirmPurchPost, invController.purchaseVehicle )


module.exports = router;
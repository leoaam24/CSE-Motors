const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function(req, res){
    const nav = await utilities.getNav()
    let responseLogin = res.locals.loggedin
    req.flash("notice", "This is a flash message.")
    res.render("index", {title: "Home", nav, responseLogin})
}

baseController.logOut = async function(req, res){
    const nav = await utilities.getNav()
    res.clearCookie('jwt')
    req.flash("notice", "User successfully logged out.")
    res.render("index", {title: "Home", nav})
}

module.exports = baseController

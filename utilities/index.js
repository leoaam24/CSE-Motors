const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id + 
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if (data.length > 0){
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
            + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + 'details"><img src="' + vehicle.inv_thumbnail
            +'" alt="Image of' + vehicle.inv_make + ' ' +vehicle.inv_model
            + ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View '
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
            + vehicle.inv_make + ' ' + vehicle.inv_model +  '</a>'
            grid += '</h2>'
            grid += '<span>$'
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }

    return grid
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildInventoryGrid = async function(data){
    let grid
    let subgrid
    if (data){
        try {
        grid = '<div class="car-info">'
        grid += '<img src="' + data[0].inv_image
        + '" alt="Image of ' + data[0].inv_make + ' ' + data[0].inv_model
        + ' on CSE Motors" title="View of' + ' ' + data[0].inv_make + ' ' + data[0].inv_model + '" />'
        subgrid = '<div class="car-details">'
        subgrid += '<h2>' + data[0].inv_year+ ' ' + data[0].inv_make+ ' ' + data[0].inv_model +'</h2>'
        subgrid += '<hr>'
        subgrid += '<h3 class="car-price-wrapper"> No-Haggle Price' + '<span class="car-price">' + ' ' +'$'+new Intl.NumberFormat('en-US').format(data[0].inv_price) + '</span>' + '</h3>'
        subgrid += '<h3> Milage: ' + new Intl.NumberFormat('en-US').format(data[0].inv_miles) + '</h3>'
        subgrid += '<h3> Color: ' + data[0].inv_color + '</h3>'
        subgrid += '<h3 class="car-description">' + data[0].inv_description + '</h3>'
        subgrid += '<form action="/inv/detail/checkout/' + data[0].inv_id +'"'+' '+ 'method="post">'
        subgrid += '<input type="submit" id="purchaseBtn" value="Purchase Now">'
        subgrid += '</form>'
        subgrid += '</div>'
        grid += subgrid
        grid += '</div>' 
    } catch(err){
        throw err
    }
    } else {
        grid += '<p class="notice">Sorry, no matching vehicle could be found.</p>'
    }
    
    return grid
}

/* **************************************
* Build the login view HTML
* ************************************ */
// Util.buildLoginView = async function(){
//     let myForm
//     myForm = '<div id=form-wrapper>'
//     myForm += '<form class="myForm" id="loginForm" action="/account/login" method="post">'
//     myForm += '<label for="account_email">Email</label>'
//     myForm += '<input type="email" id="account_email" name="account_email" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Please Enter a Valid Email" placeholder="Email" autofocus required>'
//     myForm += '<label for="account_password">Password</label>'
//     myForm += '<input type="password" id="account_password" name="account_password" placeholder="Password" title="Please Enter Your Password" required>'
//     myForm += '<span><i>There must be at least 12 characters, one must be a number, one must be a lowercase letter, one must be a capital letter, and one must be a non-alphanumeric character.</i></span>'
//     myForm += '<input type="submit" Value="LOGIN" id="loginBtn">'
//     myForm += '<p>No account?<span class="signUp"><a href="/account/register">Sign-Up</a></span></p>'
//     myForm += '</form>'
//     myForm += '</div>'

//     return myForm
// }
/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */

Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.CheckJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    req.flash("Please log in")
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }
                res.locals.accountData = accountData
                res.locals.loggedin = 1
                next()
            }
        )
    } else {
        next()
    }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }

}

/* ****************************************
 *  Check Account Type
 * ************************************ */
Util.checkCredentials = (req, res, next) => {
    if (req.cookies.jwt) {
        let token = req.cookies.jwt
        let decoded = jwt.decode(token)
        return decoded
    }
}

Util.checkEmailFromToken = (req,res,next) => {
    if (req.cookies.jwt) {
        let token = req.cookies.jwt
        let decoded = jwt.decode(token)
        return decoded.account_email
    }
}

module.exports = Util
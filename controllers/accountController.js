const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const ordModel = require("../models/orders-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res){
    let nav = await utilities.getNav()
    const { 
        account_firstname,
        account_lastname,
        account_email,
        account_password,
     } = req.body

     //Hash the password before storing
     let hashedPassword
     try {
        //regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
     } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration')
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
     }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
     )

     if (regResult) {
        let errors = []
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login",{
            errors: null,
            title: "Login",
            nav,
        })
     } else {
        req.flash("notice", "Sorry, the registration failed")
        res.status(501).render("account/register", {
            errors: null,
            title: "Registration",
            nav,
        })
     }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
let nav = await utilities.getNav() 
let responseLogin = res.locals.loggedin
const {account_email, account_password } = req.body
const accountData = await accountModel.getAccountByEmail(account_email)
if(!accountData) {
    req.flash("notice", "Please check you credentials and try again.")
    res.status(400).render("account/login", {
        responseLogin,
        title: "Login",
        nav,
        errors: null,
        account_email,
    })
    return
}
try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
        delete accountData.account_password
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET,{expiresIn: 3600 * 1000})
        res.cookie("jwt", accessToken, {httpOnly: true, maxAge: 3600* 1000})
        return res.redirect("/account/")
    }   
} catch (error) {
    return new Error('Access Forbidden')
} 
}

/* ****************************************
*  Deliver Logged In View
* *************************************** */
async function buildAccount(req, res, next) {
    let nav = await utilities.getNav()
    const decodedToken = utilities.checkCredentials(req, res, next)
    let accountType = decodedToken.account_type
    let accountFirstName = decodedToken.account_firstname
    let responseLogin = res.locals.loggedin
    res.render("account/index", {
        title: "Account",
        nav,
        errors: null,
        responseLogin,
        accountType,
        accountFirstName
    })
}

/* ****************************************
*  Deliver Update View
* *************************************** */
async function buildUpdateView(req, res, next) {
    const decodedToken = utilities.checkCredentials(req, res, next)
    let account_email = decodedToken.account_email
    let data = await accountModel.getAccountByEmail(account_email)
    console.log(data)
    let account_firstname = data.account_firstname
    let account_lastname = data.account_lastname
    let account_id = data.account_id
    let nav = await utilities.getNav()
    let responseLogin = res.locals.loggedin
    res.render("account/update", {
        responseLogin,
        title: "Update Account",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
        account_id,
    })
}

/* ****************************************
*  Process Update
* ****************************************/
async function updateData(req, res) {
    let nav = await utilities.getNav()
    let responseLogin = res.locals.loggedin
    const { account_firstname, account_lastname, account_email, account_id } = req.body
    const dataResult = await accountModel.updateAccountData(
        account_firstname,
        account_lastname,
        account_email,
        account_id
    )

    if (dataResult) {
        const data = await accountModel.getAccountByEmail(dataResult.account_email)
        console.log(dataResult)
        if (!req.cookies.jwt) {
            const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET,{expiresIn: 3600 * 1000})
            res.cookie("jwt", accessToken, {httpOnly: true, maxAge: 3600* 1000})
        }
        let account_firstname = dataResult.account_firstname
        let account_lastname = dataResult.account_lastname
        let account_email = dataResult.account_email
        let account_id = dataResult.account_id
        req.flash("notice", "Account Information successfully updated.")
        res.render("account/update", {
            errors: null,
            responseLogin,
            title: "Update Account",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            account_id,
        })
    } else {
        res.redirect("/account/")
        throw Error("There's an error updating your info.")
    }
}

/* ****************************************
*  Process Update Password
* ****************************************/
async function updatePassword(req, res) {
    let token = req.cookies.jwt
    let decoded = jwt.decode(token)
    let decode_account_email = decoded.account_email
    const account_id = decoded.account_id
    let nav = await utilities.getNav()
    let responseLogin = res.locals.loggedin
    const { new_account_password, account_email } = req.body
    let hashedPassword = await bcrypt.hashSync(new_account_password, 10)
    const dataResult = await accountModel.updateAccountPassword(account_id, hashedPassword)
    
    if (dataResult) {
        console.log(account_id)
        const accountData = await accountModel.getAccountById(account_id)
        let account_firstname = accountData.account_firstname
        let account_lastname = accountData.account_lastname
        let account_email = accountData.account_email
        req.flash("notice", "Password Successfully Updated.")
        res.render("account/update/password", {
            errors: null,
            responseLogin,
            title: "Update Password",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            account_id
        })
    } else {
        res.redirect("/account/")
        throw Error("There's an error updating your info.")
    }
}

/* ****************************************
*  Deliver Order History View
* *************************************** */
async function buildOrderHistoryView(req, res, next) {
    let token = req.cookies.jwt
    let decoded = jwt.decode(token)
    let account_id = decoded.account_id
    let account_details = await accountModel.getAccountById(account_id)
    let account_purchase = account_details.account_purchase
    let order_history = []
    let order_reference = []
    let order_delivery = []
    let order_contact = []
    let promises = account_purchase.map(id => {
        let result = ordModel.orderHistoryById(id);
        if (!result) {
            console.error(`No result for id: ${id}`);
        }
        return result;
    });

    try {
        order_history = await Promise.all(promises);
    } catch (error) {
        console.error(error);
    }
    console.log(order_history)
    order_history.forEach(item => {
        let data1 = item.ord_reference
        let data2 = item.ord_address
        let data3 = item.ord_contact
        order_reference.push(data1)
        order_delivery.push(data2)
        order_contact.push(data3)
    })


    let nav = await utilities.getNav()
    let responseLogin = res.locals.loggedin
    res.render("account/orders", {
        order_history,
        order_reference,
        order_delivery,
        order_contact,
        responseLogin,
        title: "Order History",
        nav,
        errors: null,
    })
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccount, buildUpdateView, updateData, updatePassword, buildOrderHistoryView }
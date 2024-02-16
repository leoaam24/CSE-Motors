const { query } = require('express')
const pool = require('../database')
const bcrypt = require("bcryptjs")

/* *****************************
*  Create New Order
* *************************** */
async function createOrder(account_id, vehicle_id, inv_make, inv_year, delivery_address, phone_number) {
    try {
        const sql = `INSERT INTO orders (ord_reference, ord_address, ord_contact, vehicle_id) VALUES('${inv_year}${inv_make}${account_id}${vehicle_id}', '${delivery_address}', '${phone_number}', '${vehicle_id}') RETURNING *`
        let result = await pool.query(sql)
        return result.rows[0]
    } catch (error) {
        return error.message
    }
    
}

/* *****************************
*  Create New Order
* *************************** */
async function addOrderToAccount(account_id, ord_id) {
    try {
        const sql = "UPDATE account SET account_purchase = account_purchase || ARRAY[$1] WHERE account_id = $2 RETURNING *"
        let result = await pool.query(sql, [ord_id, account_id])
        return result.rows[0]
    } catch (error) {
        return error.message
    }
    
}

/* *****************************
*  Get Purchase History by ID
* *************************** */
async function orderHistoryById(ord_id) {
    try {
        const sql = "SELECT * FROM orders WHERE ord_id = $1"
        let result = await pool.query(sql, [ord_id])
        return result.rows[0]
    } catch (error) {
        return error.message
    }
}
module.exports = { createOrder, addOrderToAccount, orderHistoryById }

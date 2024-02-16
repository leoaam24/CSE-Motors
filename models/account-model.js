const { query } = require('express')
const pool = require('../database/')
const bcrypt = require("bcryptjs")

/* *****************************
*   Register new account
* *************************** */

async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try{
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (err) {
        return err.message
    }
}

/* **********************
 *   Check for existing email return 1/0
 * ********************* */
async function checkExistingEmail(account_email){
    try {
      const sql = "SELECT * FROM account WHERE account_email = $1"
      const email = await pool.query(sql, [account_email])
      return email.rowCount
    } catch (error) {
      return error.message
    }
}

/* **********************
 *   Check for existing email value
 * ********************* */
async function checkExistingEmailValue(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rows[0]
  } catch (error) {
    return error.message
  }
} 


/* ***********************************
 *   Check if password and email match
 * ***********************************/
async function checkCredentials(account_email, account_password){
  try {
      const sql = "SELECT * FROM account WHERE account_email = $1 "
      const account = await pool.query(sql, [account_email])
      const isPasswordValid = await bcrypt.compare(account_password, account.rows[0].account_password)
      return isPasswordValid
  } catch (error) {
      return error.message
  }
}

/* ***********************************
 *  Return account data using email address
 * ***********************************/

async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account where account_email = $1',
      [account_email])
      return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* ***********************************
 *  Return account data account_id
 * ***********************************/
async function getAccountById (account_id) {
  try {
    const sql = 'SELECT * FROM public.account WHERE account_id = $1'
    let result = await pool.query(sql, [account_id])
    return result.rows[0]
  } catch (error) {
    throw new Error('Getting account by ID failed.')
  }
}

/* ***********************************
 *  Update account data using account_id
 * ***********************************/
async function updateAccountData(account_firstname, account_lastname, account_email, account_id) {
  try {
    const result = await pool.query(
      'UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING*',
      [account_firstname, account_lastname, account_email, account_id])
      return result.rows[0]
  } catch (error) {
    return error.message
  }
}

/* ***********************************
 *  Match Password With Email
 * ***********************************/
async function matchAccountPass(account_email, old_account_password) {
try {
  const sql = "SELECT account_password FROM public.account WHERE account_email = $1"
  const databasePassword = await pool.query(sql,[account_email])
  const isPasswordValid = bcrypt.compare(old_account_password, databasePassword.rows[0].account_password)
  return isPasswordValid
} catch (error) {
  return error
}
}

/* ***********************************
 *  Match Password With Email
 * ***********************************/
async function updateAccountPassword(account_id, new_account_password){
  const sql = 'UPDATE public.account SET account_password = $1 WHERE account_id = $2'
  const result = await pool.query(sql, [new_account_password, account_id]) 
  return result.rowCount
}

/* ***********************************
 *  Add Purchase to Account
 * ***********************************/
async function addPurchaseToAccount(account_id, inv_id) {
  const sql = 'UPDATE public.account SET account_purchase = array_append(account_purchase, $1) WHERE account_id = $2 RETURNING account_id'
  const result = await pool.query(sql, [inv_id, account_id])
  return result.rowCount
}

module.exports = { registerAccount, checkExistingEmail, checkCredentials, getAccountByEmail, updateAccountData, checkExistingEmailValue, matchAccountPass, updateAccountPassword, getAccountById, addPurchaseToAccount }

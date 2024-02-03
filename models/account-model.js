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
 *   Check for existing email
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

module.exports = { registerAccount, checkExistingEmail, checkCredentials }

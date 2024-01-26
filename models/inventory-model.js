const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
};

module.exports = {getClassifications, getInventoryByClassificationId, getInventoryByInventoryId};

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory
            JOIN public.classification
            ON inventory.classification_id = classification.classification_id
            WHERE inventory.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationbyid error" + error)
    }
}

/* ***************************
 *  Get all inventory item by inventory id
 * ************************** */
async function getInventoryByInventoryId(inventory_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory
            WHERE inv_id = $1`,
            [inventory_id]
        )
        return data.rows
    } catch(err){
        console.error("getinventorybyid error" + error)
    }
}


import { db_conn } from "../database.js";

export function getAllProducts() {
    return db_conn.query("SELECT * FROM products")
}

export function getProductById(id) {
    return db_conn.query("SELECT * FROM products WHERE id = ?", [id])
}

export function getProductsBySearch(search_term) {
    return db_conn.query(
        "SELECT * FROM products WHERE name LIKE ? OR description LIKE ?", 
        [`%${search_term}%`, `%${search_term}%`]
    )
}

export function createProduct(name, stock, description, last_updated_by_user_id) {
    return db_conn.query(`
        INSERT INTO products (name, stock, description, last_updated_by_user_id) 
        VALUES (?, ?, ?, ?)
    `, [name, stock, description, last_updated_by_user_id])
}

export function updateProductById(id, name, stock, description, last_updated_by_user_id) {
    return db_conn.query(`
        UPDATE products
        SET name = ?, stock = ?, description = ?, last_updated_by_user_id = ?
        WHERE id = ?
    `, [name, stock, description, last_updated_by_user_id, id])
}

export function deleteProductById(id) {
    return db_conn.query("DELETE FROM products WHERE id = ?", [id])
}
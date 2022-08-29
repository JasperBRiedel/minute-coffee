import { db_conn } from "../database.js";

export function getAllProducts() {
    return db_conn.query("SELECT * FROM products");
}

export function getAllProductsWithLastUpdatedStaff() {
    return db_conn.query(`
    SELECT * 
      FROM products 
      INNER JOIN staff 
      ON products.last_updated_by_staff_id = staff.staff_id
      `);
}

export function getProductById(product_id) {
    return db_conn.query("SELECT * FROM products WHERE product_id = ?", [
        product_id,
    ]);
}

export function getProductsBySearch(search_term) {
    return db_conn.query(
        "SELECT * FROM products WHERE name LIKE ? OR description LIKE ?",
        [`%${search_term}%`, `%${search_term}%`]
    );
}

export function createProduct(
    name,
    stock,
    price,
    description,
    last_updated_by_staff_id
) {
    return db_conn.query(
        `
        INSERT INTO products (name, stock, price, description, last_updated_by_staff_id) 
        VALUES (?, ?, ?, ?, ?)
    `,
        [name, stock, price, description, last_updated_by_staff_id]
    );
}

export function updateProductById(
    product_id,
    name,
    stock,
    price,
    description,
    last_updated_by_staff_id
) {
    return db_conn.query(
        `
        UPDATE products
        SET name = ?, stock = ?, price = ?, description = ?, last_updated_by_staff_id = ?
        WHERE product_id = ?
    `,
        [name, stock, price, description, last_updated_by_staff_id, product_id]
    );
}

export function deleteProductById(product_id) {
    return db_conn.query("DELETE FROM products WHERE product_id = ?", [
        product_id,
    ]);
}

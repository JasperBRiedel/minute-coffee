import { db_conn } from "../database.js";

export function newProduct(
    id,
    name,
    stock,
    price,
    description,
    staff_id_updated_by,
) {
    return {
        id,
        name,
        stock,
        price,
        description,
        staff_id_updated_by,
    }
}

export function getAll() {
    return db_conn.query("SELECT * FROM products")
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => newProduct(
                    result.product_id,
                    result.product_name,
                    result.product_stock,
                    result.product_price,
                    result.product_description,
                    result.last_updated_by_staff_id,
                )
            )

        })
}

export function getById(productID) {
    return db_conn.query("SELECT * FROM products WHERE product_id = ?", [
        productID,
    ]).then(([queryResult]) => {
        // check that at least 1 order was found
        if (queryResult.length > 0) {
            // get the first matching result
            const result = queryResult[0]

            // convert result into a model object
            return newProduct(
                result.product_id,
                result.product_name,
                result.product_stock,
                result.product_price,
                result.product_description,
                result.last_updated_by_staff_id,
            )
        } else {
            return Promise.reject("no matching results")
        }

    })
}

export function getBySearch(searchTerm) {
    return db_conn.query(
        "SELECT * FROM products WHERE product_name LIKE ? OR product_description LIKE ?",
        [`%${searchTerm}%`, `%${searchTerm}%`]
    ).then(([queryResult]) => {
        // convert each result into a model object
        return queryResult.map(
            result => newProduct(
                result.product_id,
                result.product_name,
                result.product_stock,
                result.product_price,
                result.product_description,
                result.last_updated_by_staff_id,
            )
        )

    })
}

export function create(product) {
    return db_conn.query(
        `
        INSERT INTO products 
        (product_name, product_stock, product_price, product_description, last_updated_by_staff_id) 
        VALUES (?, ?, ?, ?, ?)
    `,
        [product.name, product.stock, product.price, product.description, product.staff_id_updated_by]
    );
}

export function update(product) {
    return db_conn.query(
        `
        UPDATE products
        SET product_name = ?, product_stock = ?, product_price = ?, product_description = ?, last_updated_by_staff_id = ?
        WHERE product_id = ?
    `,
        [product.name, product.stock, product.price, product.description, product.staff_id_updated_by, product.id]
    );
}

export function deleteById(productID) {
    return db_conn.query("DELETE FROM products WHERE product_id = ?", [
        productID,
    ]);
}

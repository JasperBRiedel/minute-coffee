import { db_conn } from "../database.js";

export function Product(
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

export function getAllProducts() {
    return db_conn.query("SELECT * FROM products")
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => Product(
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

export function getProductById(product_id) {
    return db_conn.query("SELECT * FROM products WHERE product_id = ?", [
        product_id,
    ]).then(([queryResult]) => {
        // check that at least 1 order was found
        if (queryResult.length > 0) {
            // get the first matching result
            const result = queryResult[0]

            // convert result into a model object
            return Product(
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

export function getProductsBySearch(search_term) {
    return db_conn.query(
        "SELECT * FROM products WHERE product_name LIKE ? OR product_description LIKE ?",
        [`%${search_term}%`, `%${search_term}%`]
    ).then(([queryResult]) => {
        // convert each result into a model object
        return queryResult.map(
            result => Product(
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

export function createProduct(product) {
    return db_conn.query(
        `
        INSERT INTO products 
        (product_name, product_stock, product_price, product_description, last_updated_by_staff_id) 
        VALUES (?, ?, ?, ?, ?)
    `,
        [product.name, product.stock, product.price, product.description, product.staff_id_updated_by]
    );
}

export function updateProductById(product) {
    return db_conn.query(
        `
        UPDATE products
        SET product_name = ?, product_stock = ?, product_price = ?, product_description = ?, last_updated_by_staff_id = ?
        WHERE product_id = ?
    `,
        [product.name, product.stock, product.price, product.description, product.staff_id_updated_by, product.id]
    );
}

export function deleteProductById(product_id) {
    return db_conn.query("DELETE FROM products WHERE product_id = ?", [
        product_id,
    ]);
}

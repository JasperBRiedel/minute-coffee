import { db_conn } from "../database.js";

// Order model (object) constructor
export function newOrderProduct(
    order_id,
    order_status,
    order_datetime,
    customer_first_name,
    customer_last_name,
    customer_phone,
    customer_email,
    product_id,
    product_name,
    product_stock,
    product_price,
    product_description,
    product_updated_by_staff_id,
) {
    return {
        order_id,
        order_status,
        order_datetime,
        customer_first_name,
        customer_last_name,
        customer_phone,
        customer_email,
        product_id,
        product_name,
        product_stock,
        product_price,
        product_description,
        product_updated_by_staff_id
    }
}

export function getAllByOrderStatus(status) {
    return db_conn.query(
        `
        SELECT * FROM orders
        INNER JOIN products
        ON orders.product_id = products.product_id
        WHERE orders.order_status = ?
    `,
        [status]
    ).then(([queryResult]) => {
        // convert each result into a model object
        return queryResult.map(
            result => newOrderProduct(
                result.order_id,
                result.order_status,
                result.order_datetime,
                result.customer_first_name,
                result.customer_last_name,
                result.customer_phone,
                result.customer_email,
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

export function getAllByOrderId(orderID) {
    return db_conn.query(
        `
        SELECT *
        FROM orders
        INNER JOIN products
        ON orders.product_id = products.product_id
        WHERE orders.order_id = ?
    `,
        [orderID]
    ).then(([queryResult]) => {
        // check that at least 1 match was found
        if (queryResult.length > 0) {
            // get the first matching result
            const result = queryResult[0]

            // convert result into a model object
            return newOrderProduct(
                result.order_id,
                result.order_status,
                result.order_datetime,
                result.customer_first_name,
                result.customer_last_name,
                result.customer_phone,
                result.customer_email,
                result.product_id,
                result.product_name,
                result.product_stock,
                result.product_price,
                result.product_description,
                result.product_updated_by_staff_id
            )
        } else {
            return Promise.reject("no matching results")
        }

    })
}
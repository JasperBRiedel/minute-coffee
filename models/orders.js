import { db_conn } from "../database.js";

// Order model (object) constructor
export function newOrder(
    id,
    status,
    datetime,
    customer_first_name,
    customer_last_name,
    customer_phone,
    customer_email,
    product_id,
) {
    return {
        id,
        status,
        datetime,
        customer_first_name,
        customer_last_name,
        customer_phone,
        customer_email,
        product_id,
    }
}

export function getAll() {
    return db_conn.query("SELECT * FROM orders")
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => newOrder(
                    result.order_id,
                    result.order_status,
                    result.order_datetime,
                    result.customer_first_name,
                    result.customer_last_name,
                    result.customer_phone,
                    result.customer_email,
                    result.product_id,
                )
            )

        })
}


export function getById(orderID) {
    return db_conn.query("SELECT * FROM orders WHERE order_id = ?", [orderID])
        .then(([queryResult]) => {
            // check that at least 1 match was found
            if (queryResult.length > 0) {
                // get the first matching result
                const result = queryResult[0]

                // convert result into a model object
                return newOrder(
                    result.order_id,
                    result.order_status,
                    result.order_datetime,
                    result.customer_first_name,
                    result.customer_last_name,
                    result.customer_phone,
                    result.customer_email,
                    result.product_id,
                )
            } else {
                return Promise.reject("no matching results")
            }

        })
}


export function create(order) {
    return db_conn.query(
        `
        INSERT INTO orders (product_id, order_status, order_datetime, customer_first_name, customer_last_name, customer_phone, customer_email) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
        [
            order.product_id,
            order.status,
            order.datetime,
            order.customer_first_name,
            order.customer_last_name,
            order.customer_phone,
            order.customer_email
        ]
    );
}

export function updateStatusById(orderID, status) {
    return db_conn.query(
        `
        UPDATE orders
        SET order_status = ?
        WHERE order_id = ?
    `,
        [status, orderID]
    );
}

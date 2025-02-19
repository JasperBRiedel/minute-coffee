import { DatabaseModel } from "./DatabaseModel.mjs";
import mysql from "mysql2/promise"

// Order status enum matching database field
export const ORDER_STATUS_PENDING = "pending"
export const ORDER_STATUS_COMPLETE = "complete"
export const ORDER_STATUS_CANCELLED = "cancelled"

export class OrderModel extends DatabaseModel {

    //// Instance

    constructor(id, productId, status, created, customerFirstName, customerLastName, customerPhone, customerEmail) {
        super()
        this.id = id
        this.productId = productId
        this.status = status
        this.created = created
        this.customerFirstName = customerFirstName
        this.customerLastName = customerLastName
        this.customerPhone = customerPhone
        this.customerEmail = customerEmail
    }

    //// Static 

    static tableToModel(row) {
        return new OrderModel(
            row["id"],
            row["product_id"],
            row["status"],
            row["created"],
            row["customer_first_name"],
            row["customer_last_name"],
            row["customer_phone"],
            row["customer_email"]
        )
    }

    /**
     * 
     * @returns {Promise<Array<OrderModel>>}
     */
    static getAll() {
        return this.query("SELECT * FROM orders")
            .then(result => result.map(row => this.tableToModel(row.orders)))
    }

    /**
     * 
     * @param {number} id 
     * @returns {Promise<Array<OrderModel>>}
     */
    static getById(id) {
        return this.query("SELECT * FROM orders WHERE id = ?", [id])
            .then(result =>
                result.length > 0
                    ? this.tableToModel(result[0].orders)
                    : Promise.reject("not found")
            )
    }

    /**
     * 
     * @param {string} status 
     * @returns {Promise<mysql.OkPacket>}
     */
    static updateStatusById(id, status) {
        return this.query(`
            UPDATE orders
            SET status = ?
            WHERE id = ?
        `,
            [status, id]
        )
    }

    /**
     * 
     * @param {OrderModel} order 
     * @returns {Promise<mysql.OkPacket>}
     */
    static update(order) {
        return this.query(`
            UPDATE orders
            SET product_id = ?, status = ? created = ?, customer_first_name = ?, customer_last_name = ?, customer_phone = ?, customer_email = ?
            WHERE id = ?
        `,
            [order.productId, order.status, order.created, order.customerFirstName, order.customerLastName, order.customerPhone, order.customerEmail, order.id]
        )
    }

    /**
     * @param {OrderModel} order 
     * @returns {Promise<mysql.QueryResult>}
     */
    static create(order) {
        return this.query(`
            INSERT INTO orders 
            (product_id, status, created, customer_first_name, customer_last_name, customer_phone, customer_email)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
            [order.productId, order.status, order.created, order.customerFirstName, order.customerLastName, order.customerPhone, order.customerEmail]
        )
    }

    /**
     * @param {number} id 
     * @returns {Promise<OkPacket>}
     */
    static delete(id) {
        return this.query(
            `DELETE FROM orders WHERE id = ?`,
            [id]
        )
    }


}
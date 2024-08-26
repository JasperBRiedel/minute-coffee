import { DatabaseModel } from "./DatabaseModel.mjs";
import mysql from "mysql2/promise"
import { OrderModel } from "./OrderModel.mjs";
import { ProductModel } from "./ProductModel.mjs";

export class OrderProductModel extends DatabaseModel {

    //// Instance

    constructor(order, product) {
        super()
        this.order = order
        this.product = product
    }

    //// Static 

    static tableToModel(row) {
        return new OrderProductModel(
            OrderModel.tableToModel(row.orders),
            ProductModel.tableToModel(row.products)
        )
    }

    /**
     * 
     * @param {string} status to filter by
     * @returns {Promise<Array<OrderProductModel>>}
     */
    static getAllByStatus(status) {
        return this.query(`
            SELECT * FROM orders
            INNER JOIN products
            ON orders.product_id = products.id
            WHERE orders.status = ?
        `,
            [status]
        )
            .then(result => result.map(row => this.tableToModel(row)))
    }

    /**
     * 
     * @param {number} id 
     * @returns {Promise<OrderProductModel>}
     */
    static getById(id) {
        return this.query(`
            SELECT * FROM orders
            INNER JOIN products
            ON orders.product_id = products.id
            WHERE orders.id = ?
        `,
            [id]
        )
            .then(result =>
                result.length > 0
                    ? this.tableToModel(result[0])
                    : Promise.reject("not found")
            )
    }


}
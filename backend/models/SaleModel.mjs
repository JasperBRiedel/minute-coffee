import { DatabaseModel } from "./DatabaseModel.mjs";
import mysql from "mysql2/promise"

export class SaleModel extends DatabaseModel {

    //// Instance

    constructor(id, productId, discountPercentage, date, startTime, endTime) {
        super()
        this.id = id
        this.productId = productId
        this.discountPercentage = discountPercentage
        this.date = date
        this.startTime = startTime
        this.endTime = endTime
    }

    //// Static 

    static tableToModel(row) {
        return new SaleModel(
            Number(row["id"]),
            Number(row["product_id"]),
            Number(row["discount_percentage"]),
            row["date"],
            row["start_time"],
            row["end_time"]
        )
    }

    /**
     * 
     * @returns {Promise<Array<SaleModel>>}
     */
    static getAll() {
        return this.query("SELECT * FROM sales")
            .then(result => result.map(row => this.tableToModel(row.sales)))
    }

    /**
     * 
     * @param {number} id 
     * @returns {Promise<Array<SaleModel>>}
     */
    static getById(id) {
        return this.query("SELECT * FROM sales WHERE id = ?", [id])
            .then(result =>
                result.length > 0
                    ? this.tableToModel(result[0].sales)
                    : Promise.reject("not found")
            )
    }

    /**
     * 
     * @param {SaleModel} sale 
     * @returns {Promise<mysql.OkPacket>}
     */
    static update(sale) {
        return this.query(`
            UPDATE sales
            SET product_id = ?, discount_percentage = ?, date = ?, start_time = ?, end_time = ?
            WHERE id = ?
        `,
            [sale.productId, sale.discountPercentage, sale.date, sale.startTime, sale.endTime, sale.id]
        )
    }

    /**
     * @param {SaleModel} sale 
     * @returns {Promise<OkPacket>}
     */
    static create(sale) {
        return this.query(`
            INSERT INTO sales 
            (product_id, discount_percentage, date, start_time, end_time)
            VALUES (?, ?, ?, ?, ?)
        `,
            [sale.productId, sale.discountPercentage, sale.date, sale.startTime, sale.endTime]
        )
    }

    /**
     * @param {number} id 
     * @returns {Promise<OkPacket>}
     */
    static delete(id) {
        return this.query(
            `DELETE FROM sales WHERE id = ?`,
            [id]
        )
    }


}
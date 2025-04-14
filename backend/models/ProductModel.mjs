import { DatabaseModel } from "./DatabaseModel.mjs";
import mysql from "mysql2/promise"

export class ProductModel extends DatabaseModel {

    //// Instance

    constructor(id, name, stock, price, description, updatedByEmployeeId, deleted) {
        super()
        this.id = id
        this.name = name
        this.stock = stock
        this.price = price
        this.description = description
        this.updatedByEmployeeId = updatedByEmployeeId
        this.deleted = deleted
    }
    
    //// Static 

    static tableToModel(row) {
        return new ProductModel(
            Number(row["id"]),
            row["name"],
            Number(row["stock"]),
            Number(row["price"]),
            row["description"],
            Number(row["updated_by_employee_id"]),
            row["deleted"]
        )
    }

    /**
     * 
     * @returns {Promise<Array<ProductModel>>}
     */
    static getAll() {
        return this.query("SELECT * FROM products where deleted = 0")
            .then(result => result.map(row => this.tableToModel(row.products)))
    }

    /**
     * 
     * @returns {Promise<Array<ProductModel>>}
     */
    static getBySearch(term) {
        return this.query(`
            SELECT * FROM products 
            WHERE deleted = 0 
            AND (name LIKE ? OR description LIKE ?)
        `,
            [`%${term}%`, `%${term}%`]
        )
            .then(result => result.map(row => this.tableToModel(row.products)))
    }

    /**
     * 
     * @param {number} id 
     * @returns {Promise<ProductModel>}
     */
    static getById(id) {
        return this.query("SELECT * FROM products WHERE id = ?", [id])
            .then(result =>
                result.length > 0
                    ? this.tableToModel(result[0].products)
                    : Promise.reject("not found")
            )
    }

    /**
     * 
     * @param {ProductModel} product 
     * @returns {Promise<mysql.OkPacket>}
     */
    static update(product) {
        return this.query(`
            UPDATE products
            SET name = ?, stock = ?, price = ?, description = ?, updated_by_employee_id = ?, deleted = ?
            WHERE id = ?
        `,
            [product.name, product.stock, product.price, product.description, product.updatedByEmployeeId, product.deleted, product.id]
        )
    }
    
    /**
     * 
     * @param {number} product id 
     * @param {number} difference in stock level to apply
     * @returns {Promise<mysql.OkPacket>}
     */
    static updateStockById(id, difference) {
        return this.query(`
            UPDATE products
            SET stock = stock + ?
            WHERE id = ?
        `,
            [difference, id]
        )
    }

    /**
     * @param {ProductModel} product 
     * @returns {Promise<mysql.OkPacket>}
     */
    static create(product) {
        return this.query(`
            INSERT INTO products
            (name, stock, price, description, updated_by_employee_id, deleted)
            VALUES (?, ?, ?, ?, ?, ?)
        `,
            [product.name, product.stock, product.price, product.description, product.updatedByEmployeeId, product.deleted]
        )
    }

    /**
     * @param {number} id 
     * @returns {Promise<mysql.OkPacket>}
     */
    static delete(id) {
        return this.query(
            `DELETE FROM products WHERE id = ?`,
            [id]
        )
    }


}
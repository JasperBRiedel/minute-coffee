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

    static rowToModel(row) {
        return new ProductModel(
            row["id"],
            row["name"],
            row["stock"],
            row["price"],
            row["description"],
            row["updated_by_employee_id"],
            row["deleted"]
        )
    }

    /**
     * 
     * @returns {Promise<Array<ProductModel>>}
     */
    static getAll() {
        return this.query("SELECT * FROM products where deleted = 0")
            .then(result => result.map(row => this.rowToModel(row)))
    }

    /**
     * 
     * @returns {Promise<Array<ProductModel>>}
     */
    static getBySearch(term) {
        return this.query(`
            SELECT * FROM products 
            WHERE product_removed = 0 
            AND (product_name LIKE ? OR product_description LIKE ?
        `,
            [`%${term}%`, `%${term}%`]
        )
            .then(result => result.map(row => this.rowToModel(row)))
    }

    /**
     * 
     * @param {number} id 
     * @returns {Promise<Array<ProductModel>>}
     */
    static getById(id) {
        return this.query("SELECT * FROM products WHERE id = ?", [id])
            .then(result =>
                result.length > 0
                    ? this.rowToModel(result[0])
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
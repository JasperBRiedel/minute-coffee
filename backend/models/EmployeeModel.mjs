import { DatabaseModel } from "./DatabaseModel.mjs";
import mysql from "mysql2/promise"

export class EmployeeModel extends DatabaseModel {
    
    //// Instance

    constructor(id, firstName, lastName, role, username, password) {
        super()
        this.id = id
        this.firstName = firstName
        this.lastName = lastName
        this.role = role
        this.username = username
        this.password = password
    }

    //// Static 

    static rowToModel(row) {
        return new EmployeeModel(
            row["id"],
            row["first_name"],
            row["last_name"],
            row["role"],
            row["username"],
            row["password"]
        )
    }

    /**
     * 
     * @returns {Promise<Array<EmployeeModel>>}
     */
    static getAll() {
        return this.query("SELECT * FROM employees")
            .then(result => result.map(row => this.rowToModel(row)))
    }

    /**
     * 
     * @param {number} id 
     * @returns {Promise<Array<EmployeeModel>>}
     */
    static getById(id) {
        return this.query("SELECT * FROM employees WHERE id = ?", [id])
            .then(result => 
                result.length > 0 
                ? this.rowToModel(result[0]) 
                : Promise.reject("not found")
            )
    }

    /**
     * 
     * @param {number} id 
     * @returns {Promise<Array<EmployeeModel>>}
     */
    static getByUsername(id) {
        return this.query("SELECT * FROM employees WHERE username = ?", [username])
            .then(result => 
                result.length > 0 
                ? this.rowToModel(result[0]) 
                : Promise.reject("not found")
            )
    }

    /**
     * 
     * @param {EmployeeModel} employee 
     * @returns {Promise<Array<EmployeeModel>>}
     */
    static update(employee) {
        // TODO: Handle password hashing here?
        return this.query(`
            UPDATE employees
            SET first_name = ?, last_name = ?, role = ?, username = ?, password = ?
            WHERE id = ?
        `,
            [employee.firstName, employee.lastName, employee.role, employee.username, employee.password, employee.id]
        )
    }

    /**
     * @param {EmployeeModel} employee 
     * @returns {Promise<mysql.OkPacket>}
     */
    static create(employee) {
        // TODO: Handle password hashing here?
        return this.query(`
            INSERT INTO employees 
            (first_name, last_name, role, username, password)
            VALUES (?, ?, ?, ?, ?)
        `,
            [employee.firstName, employee.lastName, employee.role, employee.username, employee.password]
        )
    }

    /**
     * @param {number} id 
     * @returns {Promise<mysql.OkPacket>}
     */
    static delete(id) {
        return this.query(
            `DELETE FROM employees WHERE id = ?`,
            [id]
        )
    }
    
}
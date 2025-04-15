import { DatabaseModel } from "./DatabaseModel.mjs";
import mysql from "mysql2/promise"

export const EMPLOYEE_ROLE_ADMIN = "admin"
export const EMPLOYEE_ROLE_STOCK = "stock"
export const EMPLOYEE_ROLE_SALES = "sales"

export class EmployeeModel extends DatabaseModel {

    //// Instance

    constructor(id, firstName, lastName, role, username, password, authenticationKey = null) {
        super()
        this.id = id
        this.firstName = firstName
        this.lastName = lastName
        this.role = role
        this.username = username
        this.password = password
        this.authenticationKey = authenticationKey
    }

    //// Static 

    static tableToModel(row) {
        return new EmployeeModel(
            row["id"],
            row["first_name"],
            row["last_name"],
            row["role"],
            row["username"],
            row["password"],
            row["authentication_key"]
        )
    }

    /**
     * 
     * @returns {Promise<Array<EmployeeModel>>}
     */
    static getAll() {
        return this.query("SELECT * FROM employees WHERE deleted = 0")
            .then(result => result.map(row => this.tableToModel(row.employees)))
    }

    /**
     * 
     * @param {number} id 
     * @returns {Promise<EmployeeModel>}
     */
    static getById(id) {
        return this.query("SELECT * FROM employees WHERE id = ?", [id])
            .then(result =>
                result.length > 0
                    ? this.tableToModel(result[0].employees)
                    : Promise.reject("not found")
            )
    }

    /**
     * 
     * @param {number} id 
     * @returns {Promise<EmployeeModel>}
     */
    static getByUsername(username) {
        return this.query("SELECT * FROM employees WHERE username = ? AND deleted = 0", [username])
            .then(result =>
                result.length > 0
                    ? this.tableToModel(result[0].employees)
                    : Promise.reject("not found")
            )
    }

    /**
     * 
     * @param {number} id 
     * @returns {Promise<EmployeeModel>}
     */
    static getByAuthenticationKey(authenticationKey) {
        return this.query("SELECT * FROM employees WHERE authentication_key = ? AND deleted = 0", [authenticationKey])
            .then(result =>
                result.length > 0
                    ? this.tableToModel(result[0].employees)
                    : Promise.reject("not found")
            )
    }

    /**
     * 
     * @param {EmployeeModel} employee 
     * @returns {Promise<mysql.ResultSetHeader>}
     */
    static update(employee) {
        return this.query(`
            UPDATE employees
            SET first_name = ?, last_name = ?, role = ?, username = ?, password = ?, authentication_key = ?
            WHERE id = ?
        `,
            [employee.firstName, employee.lastName, employee.role, employee.username, employee.password, employee.authenticationKey, employee.id]
        )
    }

    /**
     * @param {EmployeeModel} employee 
     * @returns {Promise<mysql.OkPacket>}
     */
    static create(employee) {
        return this.query(`
            INSERT INTO employees 
            (first_name, last_name, role, username, password, authentication_key)
            VALUES (?, ?, ?, ?, ?)
        `,
            [employee.firstName, employee.lastName, employee.role, employee.username, employee.password, employee.authenticationKey]
        )
    }

    /**
     * @param {number} id 
     * @returns {Promise<mysql.OkPacket>}
     */
    static delete(id) {
        return this.query(
            `UPDATE employees SET deleted = 1 WHERE id = ?`,
            [id]
        )
    }

}
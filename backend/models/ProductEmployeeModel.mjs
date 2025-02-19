import { DatabaseModel } from "./DatabaseModel.mjs";
import { EmployeeModel } from "./EmployeeModel.mjs";
import { ProductModel } from "./ProductModel.mjs";

export class ProductEmployeeModel extends DatabaseModel {

    //// Instance

    constructor(product, employee) {
        super()
        this.product = product
        this.employee = employee
    }

    //// Static 

    static tableToModel(row) {
        return new ProductEmployeeModel(
            ProductModel.tableToModel(row.products),
            EmployeeModel.tableToModel(row.employees)
        )
    }

    /**
     * 
     * @returns {Promise<Array<ProductEmployeeModel>>}
     */
    static getAll() {
        return this.query(`
        SELECT * FROM products INNER JOIN employees 
        ON products.updated_by_employee_id = employees.id
        WHERE products.deleted = 0
        `, [])
            .then(result => result.map(row => this.tableToModel(row)))
    }
}
import { DatabaseModel } from "./DatabaseModel.mjs";
import { ProductModel } from "./ProductModel.mjs";
import { SaleModel } from "./SaleModel.mjs";

export class SaleProductModel extends DatabaseModel {

    //// Instance

    constructor(sale, product) {
        super()
        this.sale = sale
        this.product = product
    }

    //// Static 

    static tableToModel(row) {
        return new SaleProductModel(
            SaleModel.tableToModel(row.sales),
            ProductModel.tableToModel(row.products)
        )
    }

    /**
     * 
     * @param {Date} start 
     * @param {Date} end 
     * @returns {Promise<Array<SaleProductModel>>}
     */
    static getByStartAndEndDate(start, end) {
        return this.query(`
        SELECT * FROM sales INNER JOIN products 
        ON sales.product_id = products.id 
        WHERE sales.date BETWEEN ? AND ? 
        AND deleted = 0
        `, [this.toMySqlDate(start), this.toMySqlDate(end)])
            .then(result => result.map(row => this.tableToModel(row)))
    }
}
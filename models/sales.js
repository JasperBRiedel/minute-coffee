import { db_conn } from "../database.js";

export function newSale(
    id,
    product_id,
    percentage_off,
    date,
) {
    return {
        sale_id,
        product_id,
        percentage_off,
        sale_date
    }
}

export function getAll() {
    return db_conn.query(`SELECT * FROM sales`)
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => newSale(
                    result.sale_id,
                    result.product_id,
                    result.sale_percentage_off,
                    result.sale_date
                )
            )
        });
}


export function create(sale) {
    return db_conn.query(
        `
        INSERT INTO sales (product_id, percentage_off, sale_date)
        VALUES (?, ?, ?, ?)
        `,
        [
            sale.product_id,
            sale.sale_percentage_off,
            sale.sale_date
        ]
    )
}

export function deleteById(saleId) {
    return db_conn.query("DELETE FROM sales WHERE sale_id = ?", [saleId])
}

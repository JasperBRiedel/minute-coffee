import { convertToMySQLDate, db_conn } from "../database.js";

export function newSaleProduct(
    sale_id,
    product_id,
    product_name,
    product_description,
    product_stock,
    product_price,
    sale_percentage_off,
    sale_price,
    sale_start_time,
    sale_end_time,
    sale_date,
) {
    return {
        sale_id,
        product_id,
        product_name,
        product_description,
        product_stock,
        product_price,
        sale_percentage_off,
        sale_price,
        sale_start_time,
        sale_end_time,
        sale_date,
    }
}

export function getByDateRange(startDate, endDate) {
    return db_conn.query(
        `
        SELECT 
            sales.sale_id,
            products.product_id,
            product_name, 
            product_description, 
            product_stock,
            product_price,
            sale_percentage_off, 
            (product_price * (1 - sale_percentage_off)) as sale_price, 
            sale_date,
            sale_start_time, 
            sale_end_time 
        FROM sales 
        INNER JOIN products 
        ON sales.product_id = products.product_id 
        WHERE sale_date BETWEEN ? AND ? 
        AND product_removed = 0
        `,
        [convertToMySQLDate(startDate), convertToMySQLDate(endDate)]
    ).then(([queryResult]) => {
        // convert each result into a model object
        return queryResult.map(
            result => newSaleProduct(
                result.sale_id,
                result.product_id,
                result.product_name,
                result.product_description,
                result.product_stock,
                result.product_price,
                result.sale_percentage_off,
                result.sale_price,
                result.sale_start_time,
                result.sale_end_time,
                result.sale_date
            )
        )
    });

}
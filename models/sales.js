import { db_conn } from "../database.js";

export function newSale(
    sale_id,
    product_id,
    percentage_off,
    sale_date,
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
                    result.percentage_off,
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
            sale.percentage_off,
            sale.sale_date
        ]
    )
}

export function deleteById(saleId) {
    return db_conn.query("DELETE FROM sales WHERE sale_id = ?", [saleId])
}

export function getAllSalesThisWeek() {
    return db_conn.query(
        `
        SELECT 
            product_name, 
            product_description, 
            product_stock,
            product_price,
            percentage_off, 
            (product_price * (1 - percentage_off)) as sale_price, 
            (DAYOFWEEK(sale_date) - 1) as sale_day, 
            start_time, 
            end_time 
        FROM sales 
        INNER JOIN products 
        ON sales.product_id = products.product_id 
        WHERE sale_date BETWEEN NOW() AND (NOW() + INTERVAL 7 DAY) 
        AND product_removed = 0
        `,
        // DAYOFWEEK returns the day of the date as an integer
        // (Sunday returns 0, ..., Saturday returns 6)
        // It seems to always be ahead by one day, hence the - 1
    
        // WHERE sale_date BETWEEN NOW() and (NOW() + INTERVAL 7 DAY)
        // returns only the rows where sale_date is between now and 
        // 7 days away.
    )
}
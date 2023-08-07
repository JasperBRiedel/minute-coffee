import { db_conn } from "../database.js";

export function newProductStaff(
    product_id,
    product_name,
    product_stock,
    product_price,
    product_description,
    staff_id_updated_by,
    staff_id,
    staff_first_name,
    staff_last_name,
    staff_access_role,
    staff_username,
    staff_password,
) {
    return {
        product_id,
        product_name,
        product_stock,
        product_price,
        product_description,
        staff_id_updated_by,
        staff_id,
        staff_first_name,
        staff_last_name,
        staff_access_role,
        staff_username,
        staff_password,
    }
}

export function getAll() {
    return db_conn.query(`
        SELECT * FROM products INNER JOIN staff 
        ON products.last_updated_by_staff_id = staff.staff_id
      `)
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => newProductStaff(
                    result.product_id,
                    result.product_name,
                    result.product_stock,
                    result.product_price,
                    result.product_description,
                    result.last_updated_by_staff_id,
                    result.staff_id,
                    result.staff_first_name,
                    result.staff_last_name,
                    result.staff_access_role,
                    result.staff_username,
                    result.staff_password,
                )
            )

        })
}

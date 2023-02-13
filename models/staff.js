import { db_conn } from "../database.js";

export function Staff(
    id,
    first_name,
    last_name,
    access_role,
    username,
    password,
) {
    return {
        id,
        first_name,
        last_name,
        access_role,
        username,
        password,
    }
}


// Create
export function createStaff(staff) {
    return db_conn.query(
        `
        INSERT INTO staff 
        (staff_first_name, staff_last_name, staff_access_role, staff_username, staff_password)
        VALUES (?, ?, ?, ?, ?)
    `,
        [staff.first_name, staff.last_name, staff.access_role, staff.username, staff.password]
    );
}

// Read
export function getAllStaff() {
    return db_conn.query(`SELECT * FROM staff`)
        .then(([queryResult]) => {
            // convert each result into a model object
            return queryResult.map(
                result => Staff(
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

export function getStaffById(staffID) {
    return db_conn.query(`SELECT * FROM staff WHERE staff_id = ?`, [staffID])
        .then(([queryResult]) => {
            // check that at least 1 match was found
            if (queryResult.length > 0) {
                // get the first matching result
                const result = queryResult[0]

                // convert result into a model object
                return Staff(
                    result.staff_id,
                    result.staff_first_name,
                    result.staff_last_name,
                    result.staff_access_role,
                    result.staff_username,
                    result.staff_password,
                )
            } else {
                return Promise.reject("no matching results")
            }

        })
}

export function getStaffByUsername(username) {
    return db_conn.query(`SELECT * FROM staff WHERE staff_username = ?`, [username])
        .then(([queryResult]) => {
            // check that at least 1 match was found
            if (queryResult.length > 0) {
                // get the first matching result
                const result = queryResult[0]

                // convert result into a model object
                return Staff(
                    result.staff_id,
                    result.staff_first_name,
                    result.staff_last_name,
                    result.staff_access_role,
                    result.staff_username,
                    result.staff_password,
                )
            } else {
                return Promise.reject("no matching results")
            }

        })
}

// Update
export function updateStaffById(staff) {
    return db_conn.query(
        `
        UPDATE staff
        SET staff_first_name = ?, staff_last_name = ?, staff_access_role = ?, staff_username = ?, staff_password = ?
        WHERE staff_id = ?
    `,
        [staff.first_name, staff.last_name, staff.access_role, staff.username, staff.password, staff.id]
    );
}

// Delete
export function deleteStaffById(staffID) {
    return db_conn.query(`DELETE FROM staff WHERE staff_id = ?`, [staffID]);
}

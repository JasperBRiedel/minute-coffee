import { db_conn } from "../database.js";

// Create
export function createStaff(
    first_name,
    last_name,
    access_role,
    username,
    password
) {
    return db_conn.query(
        `
        INSERT INTO staff 
        (staff_first_name, staff_last_name, staff_access_role, staff_username, staff_password)
        VALUES (?, ?, ?, ?, ?)
    `,
        [first_name, last_name, access_role, username, password]
    );
}

// Read
export function getAllStaff() {
    return db_conn.query(`SELECT * FROM staff`);
}

export function getStaffById(staff_id) {
    return db_conn.query(`SELECT * FROM staff WHERE staff_id = ?`, [staff_id]);
}

export function getStaffByUsername(username) {
    return db_conn.query(`SELECT * FROM staff WHERE staff_username = ?`, [
        username,
    ]);
}

// Update
export function updateStaffById(
    staff_id,
    first_name,
    last_name,
    access_role,
    username,
    password
) {
    return db_conn.query(
        `
        UPDATE staff
        SET staff_first_name = ?, staff_last_name = ?, staff_access_role = ?, staff_username = ?, staff_password = ?
        WHERE staff_id = ?
    `,
        [first_name, last_name, access_role, username, password, staff_id]
    );
}

// Delete
export function deleteStaffById(staff_id) {
    return db_conn.query(`DELETE FROM staff WHERE staff_id = ?`, [staff_id]);
}

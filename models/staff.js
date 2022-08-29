import { db_conn } from "../database.js";

export function getAllStaff() {
    return db_conn.query("SELECT * FROM staff");
}

export function getStaffById(staff_id) {
    return db_conn.query("SELECT * FROM staff WHERE staff_id = ?", [staff_id]);
}

export function getStaffByUsername(username) {
    return db_conn.query("SELECT * FROM staff WHERE username = ?", [username]);
}

export function createStaff(
    first_name,
    last_name,
    access_role,
    username,
    password
) {
    return db_conn.query(
        `
        INSERT INTO staff (first_name, last_name, access_role, username, password) 
        VALUES (?, ?, ?, ?, ?)
    `,
        [first_name, last_name, access_role, username, password]
    );
}

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
        SET first_name = ?, last_name = ?, access_role = ?, username = ?, password = ?
        WHERE staff_id = ?
    `,
        [first_name, last_name, access_role, username, password, staff_id]
    );
}

export function deleteStaffById(staff_id) {
    return db_conn.query("DELETE FROM staff WHERE staff_id = ?", [staff_id]);
}

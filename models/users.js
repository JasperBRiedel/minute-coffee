import { db_conn } from "../database.js";

export function getAllUsers() {
    return db_conn.query("SELECT * FROM users")
}

export function getUserById(id) {
    return db_conn.query("SELECT * FROM users WHERE id = ?", [id])
}

export function getUserByUsername(username) {
    return db_conn.query("SELECT * FROM users WHERE username = ?", [username])
}

export function createUser(first_name, last_name, access_role, username, password) {
    return db_conn.query(`
        INSERT INTO users (first_name, last_name, access_role, username, password) 
        VALUES (?, ?, ?, ?, ?)
    `, [first_name, last_name, access_role, username, password])
}

export function updateUserById(id, first_name, last_name, access_role, username, password) {
    return db_conn.query(`
        UPDATE users
        SET first_name = ?, last_name = ?, access_role = ?, username = ?, password = ?
        WHERE id = ?
    `, [first_name, last_name, access_role, username, password, id])
}

export function deleteUserById(id) {
    return db_conn.query("DELETE FROM users WHERE id = ?", [id])
}
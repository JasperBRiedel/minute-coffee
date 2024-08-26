import mysql from "mysql2/promise"

export class DatabaseModel {
    static connection;

    static {
        this.connection = mysql.createPool({
            host: "localhost",
            user: "root",
            password: "root",
            database: "minute-coffee-2025",
            nestTables: true,
        })
    }

    /**
     * 
     * @param {string} sql query 
     * @param {any | Array<string>} values 
     * @returns {mysql.OkPacket | mysql.RowDataPacket } query result
     */
    static query(sql, values) {
        return this.connection.query(sql, values).then(([result]) => result)
    }

    static toMySqlDate(date) {
        const year = date.toLocaleString('default', { year: 'numeric' });
        const month = date.toLocaleString('default', {
            month: '2-digit',
        });
        const day = date.toLocaleString('default', { day: '2-digit' });

        return [year, month, day].join('-');
    }
}
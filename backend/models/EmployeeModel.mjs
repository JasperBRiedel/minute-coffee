import { DatabaseModel } from "./DatabaseModel.mjs";

class Employee {
    firstName;
    lastName;
    role;
    username;
    password;

    constructor(firstName, lastName, role, username, password) {
        this.firstName = firstName
        this.lastName = lastName
        this.role = role
        this.username = username
        this.password = password
    }
}

class EmployeeModel extends DatabaseModel {
    static rowToEmployee(row) {
        return new Employee(
            row["first_name"],
            row["last_name"],
            row["role"],
            row["username"],
            row["password"]
        )
    }

    static getAll() {
        return this.query("SELECT * FROM employees")
            .then(result => result.map(row => this.rowToEmployee(row)))
    }
}

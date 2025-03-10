import express from "express"
import bcrypt from "bcryptjs"
import { EmployeeModel } from "../models/EmployeeModel.mjs"
import { AuthenticationController } from "./AuthenticationController.mjs"

export class EmployeeController {
    static routes = express.Router()

    static {
        this.routes.get(
            "/",
            AuthenticationController.restrict(["admin"]),
            this.viewEmployeeManagement
        )

        this.routes.get(
            "/:id",
            AuthenticationController.restrict(["admin"]),
            this.viewEmployeeManagement
        )

        this.routes.post(
            "/",
            AuthenticationController.restrict(["admin"]),
            this.handleEmployeeManagement
        )

        this.routes.post(
            "/:id",
            AuthenticationController.restrict(["admin"]),
            this.handleEmployeeManagement
        )
    }

    /**
     * 
     * @type {express.RequestHandler}
     */
    static viewEmployeeManagement(req, res) {
        const selectedEmployeeId = req.params.id

        EmployeeModel.getAll()
            .then(employees => {

                const selectedEmployee = employees.find(
                    e => e.id == selectedEmployeeId
                ) ?? new EmployeeModel(null, "", "", "", "", "")

                res.render("employee_management.ejs", {
                    employees,
                    selectedEmployee,
                    role: "admin",
                })
            })
            .catch(error => {
                console.log(error)
            })
    }

    /**
     * 
     * @type {express.RequestHandler}
     */
    static handleEmployeeManagement(req, res) {
        const selectedEmployeeId = req.params.id
        const formData = req.body
        const action = formData.action

        // TODO: Validate form data and url parameter (id)

        const employee = new EmployeeModel(
            selectedEmployeeId,
            formData["firstName"],
            formData["lastName"],
            formData["role"],
            formData["username"],
            formData["password"]
        )

        // We need to hash the password if it is not hashed
        if (!employee.password.startsWith("$2a")) {
            employee.password = bcrypt.hashSync(employee.password)
        }

        if (action == "create") {
            EmployeeModel.create(employee)
                .then(result => {
                    res.redirect("/employees")
                })
                .catch(error => {
                    res.render("status.ejs", {
                        status: "Database Error",
                        message: "The employee could not be created.",
                    });
                    console.error(error)
                })
        } else if (action == "update") {
            EmployeeModel.update(employee)
                .then(result => {
                    if (result.affectedRows > 0) {
                        res.redirect("/employees")
                    } else {
                        res.render("status.ejs", {
                            status: "Employee Update Failed",
                            message: "The employee could not be found.",
                        });
                    }
                })
                .catch(error => {
                    res.render("status.ejs", {
                        status: "Database Error",
                        message: "The employee could not be updated.",
                    });
                    console.error(error)
                })
        } else if (action == "delete") {
            EmployeeModel.delete(employee.id)
                .then(result => {
                    if (result.affectedRows > 0) {
                        res.redirect("/employees")
                    } else {
                        res.render("status.ejs", {
                            status: "Employee Deletion Failed",
                            message: "The employee could not be found.",
                        });
                    }
                })
                .catch(error => {
                    res.render("status.ejs", {
                        status: "Database Error",
                        message: "The employee could not be deleted.",
                    });
                    console.error(error)
                })
        } else {
            res.render("status.ejs", {
                status: "Invalid Action",
                message: "The form doesn't support this action.",
            });
        }
    }
}
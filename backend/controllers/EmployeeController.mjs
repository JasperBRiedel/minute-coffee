import express from "express";
import { EmployeeModel } from "../models/EmployeeModel.mjs";

export class EmployeeController {
    static routes = express.Router()

    static {
        this.routes.get("/", this.viewEmployeeManagement)
        this.routes.get("/:id", this.viewEmployeeManagement)

        this.routes.post("/", this.handleEmployeeManagement)
        this.routes.post("/:id", this.handleEmployeeManagement)
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

        if (action == "create") {
            EmployeeModel.create(employee)
                .then(result => {
                    res.redirect("/employee")
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
                        res.redirect("/employee")
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
                        res.redirect("/employee")
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
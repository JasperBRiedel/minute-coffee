import express from "express"
import session from "express-session"
import { EMPLOYEE_ROLE_ADMIN, EMPLOYEE_ROLE_SALES, EMPLOYEE_ROLE_STOCK, EmployeeModel } from "../models/EmployeeModel.mjs"
import bcrypt from "bcryptjs"

export class AuthenticationController {
    static middleware = express.Router()
    static routes = express.Router()

    static {
        this.middleware.use(session({
            secret: "9c55abf5-111d-4235-b8d8-07c3463999e7",
            resave: false,
            saveUninitialized: false,
            cookie: { secure: "auto" }
        }))
        this.middleware.use(this.#session_authentication)
        this.middleware.use(this.#api_key_authentication)

        this.routes.get("/", this.viewAuthenticate)
        this.routes.post("/", this.handleAuthenticate)

        this.routes.delete("/", this.handleDeauthenticate)
        this.routes.get("/logout", this.handleDeauthenticate)
    }

    /**
     * Automatically stores the respective EmployeeModel into req.authenticatedUsed
     * if there is an active session containing an userId
     * @type {express.RequestHandler}
     */
    static async #session_authentication(req, res, next) {
        if (req.session.userId && !req.authenticatedUser) {
            try {
                req.authenticatedUser = await EmployeeModel.getById(req.session.userId)
            } catch (error) {
                console.error("Failed to authenticate user session - " + error)
            }
        }
        next()
    }

    /**
     * @type {express.RequestHandler}
     */
    static #api_key_authentication(req, res, next) {
        // TODO: Implement API key based authentication.
        next()
    }

    /**
     * @type {express.RequestHandler}
     */
    static viewAuthenticate(req, res) {
        res.render("login.ejs")
    }

    /**
     * @type {express.RequestHandler}
     */
    static async handleAuthenticate(req, res) {
        const contentType = req.get("Content-Type")

        const username = req.body["username"]
        const password = req.body["password"]

        if (contentType == "application/x-www-form-urlencoded") {
            try {
                const employee = await EmployeeModel.getByUsername(username)
                const isCorrectPassword = await bcrypt.compare(password, employee.password)

                if (isCorrectPassword) {
                    // Store the authenticated user's ID into the session
                    req.session.userId = employee.id
                    
                    // Redirect based on role
                    if (employee.role == EMPLOYEE_ROLE_ADMIN) {
                        res.redirect("/products/edit")
                    } else if (employee.role == EMPLOYEE_ROLE_SALES) {
                        res.redirect("/orders/view")
                    } else if (employee.role == EMPLOYEE_ROLE_STOCK) {
                        res.redirect("/products/edit")
                    }
                } else {
                    res.status(400).render("status.ejs", {
                        status: "Authentication Failed.",
                        message: "Invalid credentials."
                    })
                }
            } catch (error) {
                if (error == "not found") {
                    res.status(400).render("status.ejs", {
                        status: "Authentication Failed.",
                        message: "Invalid credentials."
                    })
                } else {
                    console.error(error)
                    res.status(500).render("status.ejs", {
                        status: "Authentication Failed.",
                        message: "Server error."
                    })
                }
            }
        } else if (contentType == "application/json") {
            // TODO: Add validation here
            // TODO: Implement API key based authentication.
            res.status(501).render("status.ejs", {
                status: "JSON Authentication Format Error.",
                message: "JSON format not yet implemented."
            })
        } else {
            res.status(501).render("status.ejs", {
                status: "Unsupported Authentication Format.",
                message: "Credentials must be sent as url encoded form data or JSON."
            })
        }
    }

    /**
     * @type {express.RequestHandler}
     */
    static handleDeauthenticate(req, res) {
        if (req.authenticatedUser) {
            if (req.session.userId) {
                req.session.destroy()
                res.status(200).render("status.ejs", {
                    status: "Logged out successfully.",
                    message: "You have been logged out."
                })
            }
            // TODO: Handle clearing API key from database
        } else {
            res.status(401).render("status.ejs", {
                status: "Unauthenticated.",
                message: "Please login to access the requested resource."
            })
        }
    }

    /**
     * 
     * @param {Array<"admin" | "stock" | "sales">} allowedRoles 
     * @returns {express.RequestHandler}
     */
    static restrict(allowedRoles) {
        return function (req, res, next) {
            if (req.authenticatedUser) {
                if (allowedRoles.includes(req.authenticatedUser.role)) {
                    next()
                } else {
                    res.status(403).render("status.ejs", {
                        status: "Access Forbidden.",
                        message: "Role does not have access to the requested resource."
                    })
                }
            } else {
                res.status(401).render("status.ejs", {
                    status: "Unauthenticated.",
                    message: "Please login to access the requested resource."
                })
            }
        }
    }
}

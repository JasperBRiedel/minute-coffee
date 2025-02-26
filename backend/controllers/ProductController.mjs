import express from "express"
import { ProductModel } from "../models/ProductModel.mjs"
import { SaleProductModel } from "../models/SaleProductModel.mjs"
import { ProductEmployeeModel } from "../models/ProductEmployeeModel.mjs"
import { AuthenticationController } from "./AuthenticationController.mjs"

export class ProductController {
    static routes = express.Router()

    static {
        this.routes.get("/", this.viewProductList)
        this.routes.get("/sales", this.viewProductSales)

        this.routes.get(
            "/edit",
            AuthenticationController.restrict(["admin", "stock"]),
            this.viewProductManagement
        )
        this.routes.get(
            "/edit/:id",
            AuthenticationController.restrict(["admin", "stock"]),
            this.viewProductManagement
        )
        this.routes.post(
            "/edit",
            AuthenticationController.restrict(["admin", "stock"]),
            this.handleProductManagement
        )
        this.routes.post(
            "/edit/:id",
            AuthenticationController.restrict(["admin", "stock"]),
            this.handleProductManagement
        )

        // The most general routes must go last, otherwise they will capture
        // /edit and /sales, etc.
        this.routes.get("/:id", this.viewProductDetails)
    }


    /**
     * 
     * @type {express.RequestHandler}
     */
    static viewProductList(req, res) {
        if (req.query.search_term) {
            ProductModel.getBySearch(req.query.search_term)
                .then(products => {
                    res.render("product_list.ejs", { products });
                })
        } else {
            ProductModel.getAll()
                .then(products => {
                    res.render("product_list.ejs", { products });
                })
        }
    }

    /**
     * 
     * @type {express.RequestHandler}
     */
    static viewProductSales(req, res) {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const today = new Date()

        // Calculate the date of the Monday of the current week
        const mondayOfThisWeek = new Date()
        mondayOfThisWeek.setDate(today.getDate() - (today.getDay() - 1))

        // Calculate the date of the Sunday of the current week
        const sundayOfThisWeek = new Date(mondayOfThisWeek)
        sundayOfThisWeek.setDate(sundayOfThisWeek.getDate() + 6)

        // Build an object with days as keys and lists of sale products as values
        const salesByDay = {
            "Monday": [],
            "Tuesday": [],
            "Wednesday": [],
            "Thursday": [],
            "Friday": [],
            "Saturday": [],
            "Sunday": [],
        }

        // Create a currency formatting so we can convert numbers like 10 into $10.00
        const currencyFormatter = new Intl.NumberFormat('en-au', {
            style: "currency",
            currency: "AUD"
        })

        // Query the database for the sale products between the start and end of the week
        SaleProductModel.getByStartAndEndDate(mondayOfThisWeek, sundayOfThisWeek)
            .then(productsOnSaleThisWeek => {

                // Add each of the sale products to it's respective day
                for (const saleProduct of productsOnSaleThisWeek) {
                    const saleDayName = daysOfWeek[saleProduct.sale.date.getDay()]
                    salesByDay[saleDayName].push(saleProduct)
                }

                // Render the sales page
                res.render("sales_list.ejs", { salesByDay, currencyFormatter })
            })
    }

    /**
     * 
     * @type {express.RequestHandler}
     */
    static viewProductDetails(req, res) {
        ProductModel.getById(req.params.id)
            .then(product => {
                res.render("product_details.ejs", { product });
            }).catch(error => {
                res.render("status.ejs", {
                    status: "Product not found",
                    message: error
                });
            })
    }

    /**
     * 
     * @type {express.RequestHandler}
     */
    static viewProductManagement(req, res) {
        const selectedProductId = req.params.id

        ProductEmployeeModel.getAll()
            .then(productsWithUpdatedByEmployees => {

                const selectedProduct = productsWithUpdatedByEmployees.find(
                    e => e.product.id == selectedProductId
                )?.product ?? new ProductModel(null, "", 0, 0, "", null, false)

                res.render("product_management.ejs", {
                    productsWithUpdatedByEmployees: productsWithUpdatedByEmployees,
                    selectedProduct,
                    role: req.authenticatedUser.role,
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
    static handleProductManagement(req, res) {
        const updatedByEmployeeId = req.authenticatedUser.id
        const selectedProductId = req.params.id
        const formData = req.body
        const action = formData.action

        // TODO: Validate form data and url parameter (id)

        const product = new ProductModel(
            selectedProductId,
            formData["name"],
            formData["stock"],
            formData["price"],
            formData["description"],
            updatedByEmployeeId,
            false,
        )

        if (action == "create") {
            ProductModel.create(product)
                .then(result => {
                    res.redirect("/products/edit")
                })
                .catch(error => {
                    res.render("status.ejs", {
                        status: "Database Error",
                        message: "The product could not be created.",
                    });
                    console.error(error)
                })
        } else if (action == "update") {
            ProductModel.update(product)
                .then(result => {
                    if (result.affectedRows > 0) {
                        res.redirect("/products/edit")
                    } else {
                        res.render("status.ejs", {
                            status: "Product Update Failed",
                            message: "The product could not be found.",
                        });
                    }
                })
                .catch(error => {
                    res.render("status.ejs", {
                        status: "Database Error",
                        message: "The product could not be updated.",
                    });
                    console.error(error)
                })
        } else if (action == "delete") {
            ProductModel.delete(product.id)
                .then(result => {
                    if (result.affectedRows > 0) {
                        res.redirect("/products/edit")
                    } else {
                        res.render("status.ejs", {
                            status: "Product Deletion Failed",
                            message: "The product could not be found.",
                        });
                    }
                })
                .catch(error => {
                    res.render("status.ejs", {
                        status: "Database Error",
                        message: "The product could not be deleted.",
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
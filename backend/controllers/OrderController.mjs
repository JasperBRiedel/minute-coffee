import express from "express"
import { ORDER_STATUS_CANCELLED, ORDER_STATUS_COMPLETE, ORDER_STATUS_PENDING, OrderModel } from "../models/OrderModel.mjs"
import { ProductModel } from "../models/ProductModel.mjs";
import { OrderProductModel } from "../models/OrderProductModel.mjs";
import validator from "validator"
import { AuthenticationController } from "./AuthenticationController.mjs";

export class OrderController {
    static routes = express.Router()

    static {
        this.routes.post("/", this.createOrder)

        this.routes.get(
            "/view",
            AuthenticationController.restrict(["admin", "sales"]),
            this.viewOrderManagement
        )

        this.routes.post(
            "/update", 
            AuthenticationController.restrict(["admin", "sales"]), 
            this.handleOrderManagement
        )

        this.routes.get("/:orderId", this.viewOrderConfirmation)
    }

    /**
     * 
     * @type {express.RequestHandler}
     */
    static createOrder(req, res) {
        let formData = req.body;

        if (!/^[0-9]+$/.test(formData["productId"])) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided.",
                message: "Please select a valid product."
            })
            return;
        }

        if (!/^[a-z-A-Z\-\'\ ]{2,}$/.test(formData["customerFirstName"])) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided.",
                message: "Please enter a valid first name, containing only a-z, -, ', and whitespace."
            })
            return;
        }

        if (!/^[a-z-A-Z\-\'\ ]{1,}$/.test(formData["customerLastName"])) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided.",
                message: "Please enter a valid last name, containing only a-z, -, ', and whitespace."
            })
            return;
        }

        if (!validator.isMobilePhone(formData["customerPhone"])) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided.",
                message: "Please enter a valid mobile number."
            })
            return;
        }

        if (!validator.isEmail(formData["customerEmail"])) {
            res.status(400).render("status.ejs", {
                status: "Invalid input provided.",
                message: "Please enter a valid email address."
            })
            return;
        }

        const order = new OrderModel(
            null,
            validator.escape(formData["productId"]),
            ORDER_STATUS_PENDING,
            new Date(),
            validator.escape(formData["customerFirstName"]),
            validator.escape(formData["customerLastName"]),
            validator.escape(formData["customerPhone"]),
            validator.escape(formData["customerEmail"]),
        )

        // Check and update stock levels
        ProductModel.getById(order.productId)
            .then(product => {
                if (product.stock > 0) {
                    ProductModel.updateStockById(order.productId, -1)
                        .then(() => {
                            OrderModel.create(order)
                                .then(result => {
                                    res.redirect("/orders/" + result.insertId)
                                })
                                .catch(() => {
                                    res.status(500).render("status.ejs", {
                                        status: "Failed to create order",
                                        message: "Order creation failed, please contact staff."
                                    })
                                })
                        })
                        .catch(() => {
                            res.status(500).render("status.ejs", {
                                status: "Failed to update stock",
                                message: "Order creation failed due to stock update issue, please contact staff."
                            })
                        })
                } else {
                    res.status(400).render("status.ejs", {
                        status: "Product out of stock",
                        message: "That product is out of stock at the moment.",
                    });
                }
            })
            .catch(() => {
                res.status(500).render("status.ejs", {
                    status: "Failed to check product stock",
                    message: "Order creation failed due to stock issue, please contact staff."
                })
            })

    }

    /**
     * 
     * @type {express.RequestHandler}
     */
    static viewOrderConfirmation(req, res) {
        const orderId = req.params.orderId

        // TODO: Validation

        OrderProductModel.getById(orderId)
            .then(orderProduct => {
                res.render("order_confirmation.ejs", {
                    orderProduct
                })
            })
            .catch(reason => {
                if (reason == "not found") {
                    res.status(404).render("status.ejs", {
                        status: "Order not found",
                        message: "The order you requested could not be found, please contact staff."
                    })
                } else {
                    res.status(500).render("status.ejs", {
                        status: "Error loading order",
                        message: "There was an error loading your order, please contact staff."
                    })
                }
            })
    }

    /**
     * 
     * @type {express.RequestHandler}
     */
    static viewOrderManagement(req, res) {
        // Determine the order status to filter by
        let orderStatus = req.query.status;
        if (!orderStatus) {
            orderStatus = "pending";
        }

        OrderProductModel.getAllByStatus(orderStatus)
            .then(ordersProducts => {
                res.render("order_management.ejs", {
                    ordersProducts,
                    orderStatus,
                    role: req.authenticatedUser.role,
                });
            });
    }

    /**
     * 
     * @type {express.RequestHandler}
     */
    static handleOrderManagement(req, res) {
        const orderId = req.body.orderId
        const status = req.body.status

        if (![ORDER_STATUS_PENDING, ORDER_STATUS_CANCELLED, ORDER_STATUS_COMPLETE].includes(status)) {
            res.status(400).render("status.ejs", {
                status: "Invalid order status.",
                message: "The selected order status is invalid."
            })
            return
        }

        OrderModel.updateStatusById(orderId, status)
            .then(result => {
                if (result.affectedRows > 0) {
                    res.redirect("/orders/view");
                } else {
                    res.status(404).render("status.ejs", {
                        status: "Order not found",
                        message: "The order you attempted to update could not be found."
                    })
                }
            })
            .catch(error => {
                console.error(error)
                res.status(500).render("status.ejs", {
                    status: "Error updating order status",
                    message: "There was an error when updating the order status in the database."
                })
            })
    }

}
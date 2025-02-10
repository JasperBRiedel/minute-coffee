import express from "express"
import { ORDER_STATUS_PENDING, OrderModel } from "../models/OrderModel.mjs"
import { ProductModel } from "../models/ProductModel.mjs";
import { OrderProductModel } from "../models/OrderProductModel.mjs";
import validator from "validator"

export class OrderController {
    static routes = express.Router()

    static {
        this.routes.post("/", this.createOrder)
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
                                    res.redirect("/orders/"+result.insertId)
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
    
}
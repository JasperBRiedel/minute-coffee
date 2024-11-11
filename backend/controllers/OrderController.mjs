import express from "express"
import { ORDER_STATUS_PENDING, OrderModel } from "../models/OrderModel.mjs"
import { ProductModel } from "../models/ProductModel.mjs";
import { OrderProductModel } from "../models/OrderProductModel.mjs";

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

        // TODO: Validation and sanitisation

        const order = new OrderModel(
            null,
            formData["productId"],
            ORDER_STATUS_PENDING,
            new Date(),
            formData["customerFirstName"],
            formData["customerLastName"],
            formData["customerPhone"],
            formData["customerEmail"],
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
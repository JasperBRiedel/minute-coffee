import express from "express";
import validator from "validator";
import access_control from "../access_control.js";
import {
    createOrder,
    Order,
    updateOrderStatusById,
} from "../models/orders.js";
import {
    getAllOrdersByStatusWithProduct,
    getOrderWithProductById
} from "../models/orders-products.js";

const orderController = express.Router();

orderController.post("/create_order", (request, response) => {
    if (request.body) {
        let order_details = request.body;

        // Validation
        if (!/[0-9]{1,}/.test(order_details.product_id)) {
            response.render("status.ejs", {
                status: "Invalid product ID",
                message: "Please pick another product.",
            });
            return;
        }

        if (!/[a-zA-Z-]{2,}/.test(order_details.customer_first_name)) {
            response.render("status.ejs", {
                status: "Invalid first name",
                message: "First name must be letters",
            });
            return;
        }

        if (!/[a-zA-Z-]{2,}/.test(order_details.customer_last_name)) {
            response.render("status.ejs", {
                status: "Invalid last name",
                message: "Last name must be letters",
            });
            return;
        }

        if (
            !/(^\({0,1}((0|\+61)(2|4|3|7|8)){0,1}\){0,1}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{1}(\ |-){0,1}[0-9]{3}$)/.test(
                order_details.customer_phone
            )
        ) {
            response.render("status.ejs", {
                status: "Invalid phone number",
                message: "Please enter a valid australian phone number",
            });
            return;
        }

        if (!/^\S{1,}@\S{1,}[.]\S{1,}$/.test(order_details.customer_email)) {
            response.render("status.ejs", {
                status: "Invalid email address",
                message: "Please enter a valid email address",
            });
            return;
        }

        const newOrder = Order(
            // New model doesn't have an ID yet
            null,
            // All new orders are pending by default
            "pending",
            // Gets the current date and time in MySQL friendly format
            (new Date().toISOString().slice(0, 19).replace('T', ' ')),
            validator.escape(order_details.customer_first_name),
            validator.escape(order_details.customer_last_name),
            validator.escape(order_details.customer_phone),
            validator.escape(order_details.customer_email),
            validator.escape(order_details.product_id),
        )

        // Call model function
        createOrder(newOrder).then(([result]) => {
            response.redirect("/order_confirmation?id=" + result.insertId);
        });
    }
});

orderController.get("/order_confirmation", (request, response) => {
    if (!/[0-9]{1,}/.test(request.query.id)) {
        response.render("status.ejs", {
            status: "Invalid order ID",
            message: "Please contact support.",
        });
        return;
    }

    if (request.query.id) {
        getOrderWithProductById(request.query.id).then(
            orderProduct => {
                response.render("order_confirmation.ejs", {
                    orderProduct,
                });
            }
        ).catch(error => {
            response.render("status.ejs", {
                status: "Failed to get order status",
                message: error,
            });
        })
    }
});

orderController.get(
    "/order_admin",
    access_control(["admin", "sales"]),
    (request, response) => {
        let orderStatus = request.query.status;
        if (!orderStatus) {
            orderStatus = "pending";
        }

        getAllOrdersByStatusWithProduct(orderStatus).then(ordersProducts => {
            response.render("order_admin.ejs", {
                ordersProducts,
                orderStatus,
                accessRole: request.session.user.access_role,
            });
        });
    }
);

orderController.post(
    "/order_admin",
    access_control(["admin", "sales"]),
    (request, response) => {
        const edit_details = request.body;
        updateOrderStatusById(edit_details.order_id, edit_details.status).then(
            ([result]) => {
                if (result.affectedRows > 0) {
                    response.redirect("/order_admin");
                }
            }
        );
    }
);

export default orderController;

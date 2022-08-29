import express, { query } from "express";
import {
    createOrder,
    getAllOrdersByStatusWithProduct,
    getOrderWithProductById,
    updateOrderStatusById,
} from "../models/orders.js";
import access_control from "../access_control.js";

const orderController = express.Router();

orderController.post("/create_order", (request, response) => {
    if (request.body) {
        let order_details = request.body;
        createOrder(
            order_details.product_id,
            order_details.customer_first_name,
            order_details.customer_last_name,
            order_details.customer_phone,
            order_details.customer_email
        ).then(([result]) => {
            response.redirect("/order_confirmation?id=" + result.insertId);
        });
    }
});

orderController.get("/order_confirmation", (request, response) => {
    if (request.query.id) {
        getOrderWithProductById(request.query.id).then(
            ([orders_with_products]) => {
                if (orders_with_products.length > 0) {
                    let order_with_product = orders_with_products[0];
                    response.render("order_confirmation.ejs", {
                        order_with_product: order_with_product,
                    });
                }
            }
        );
    }
});

orderController.get(
    "/order_admin",
    access_control(["admin", "sales"]),
    (request, response) => {
        let order_status = request.query.status;
        if (!order_status) {
            order_status = "pending";
        }

        getAllOrdersByStatusWithProduct(order_status).then(([orders]) => {
            response.render("order_admin.ejs", {
                orders: orders,
                order_status: order_status,
                access_role: request.session.user.access_role,
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

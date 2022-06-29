import express, { query } from "express";
import {
  createOrder,
  getOrderById,
  getOrderWithProductById,
} from "../models/orders.js";

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
    getOrderWithProductById(request.query.id).then(([orders_with_products]) => {
      if (orders_with_products.length > 0) {
        let order_with_product = orders_with_products[0];
        response.render("order_confirmation.ejs", {
          order_with_product: order_with_product,
        });
      }
    });
  }
});

export default orderController;

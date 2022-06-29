import { db_conn } from "../database.js";

export function getAllOrders() {
  return db_conn.query("SELECT * FROM orders");
}

export function getAllOrdersByStatus(status) {
  return db_conn.query("SELECT * FROM orders WHERE status = ?", [status]);
}

export function getOrderById(order_id) {
  return db_conn.query("SELECT * FROM orders WHERE order_id = ?", [order_id]);
}

export function getOrderWithProductById(order_id) {
  return db_conn.query(
    `
        SELECT *
        FROM orders
        INNER JOIN products
        ON orders.product_id = products.product_id
        WHERE orders.order_id = ?
    `,
    [order_id]
  );
}

export function createOrder(
  product_id,
  customer_first_name,
  customer_last_name,
  customer_phone,
  customer_email
) {
  return db_conn.query(
    `
        INSERT INTO orders (product_id, status, customer_first_name, customer_last_name, customer_phone, customer_email, order_datetime) 
        VALUES (?, 'pending', ?, ?, ?, ?, NOW())
    `,
    [
      product_id,
      customer_first_name,
      customer_last_name,
      customer_phone,
      customer_email,
    ]
  );
}

export function updateOrderStatusById(order_id, status) {
  return db_conn.query(
    `
        UPDATE orders
        SET status = ?
        WHERE order_id = ?
    `,
    [status, order_id]
  );
}

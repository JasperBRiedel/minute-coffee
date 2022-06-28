import express from "express";
import { getAllProducts, getProductById, getProductsBySearch } from "../models/products.js";

const productController = express.Router()

productController.get("/product_list", (request, response) => {
    if (request.query.search_term) {
        getProductsBySearch(request.query.search_term)
            .then(([products]) => {
                response.render("product_list.ejs", {products: products})
            })
    } else {
        getAllProducts()
            .then(([products]) => {
                response.render("product_list.ejs", {products: products})
            })
    }
})

productController.get("/product_checkout", (request, response) => {
    if (request.query.id) {
        getProductById(request.query.id)
            .then(([products]) => {
                if (products.length > 0) {
                    let product = products[0]
                    response.render("product_checkout.ejs", {product: product})
                }
            })
    }
})

export default productController
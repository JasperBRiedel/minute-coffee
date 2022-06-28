import express from "express";
import { getAllProducts, getProductsBySearch } from "../models/products.js";

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

export default productController
import express from "express";
import {
    createProduct,
    deleteProductById,
    getAllProducts,
    getAllProductsWithLastUpdatedStaff,
    getProductById,
    getProductsBySearch,
    updateProductById,
} from "../models/products.js";
import access_control from "../access_control.js";

const productController = express.Router();

productController.get("/product_list", (request, response) => {
    if (request.query.search_term) {
        getProductsBySearch(request.query.search_term).then(([products]) => {
            response.render("product_list.ejs", { products: products });
        });
    } else {
        getAllProducts().then(([products]) => {
            response.render("product_list.ejs", { products: products });
        });
    }
});

productController.get("/product_checkout", (request, response) => {
    if (request.query.id) {
        getProductById(request.query.id).then(([products]) => {
            if (products.length > 0) {
                let product = products[0];
                response.render("product_checkout.ejs", { product: product });
            }
        });
    }
});

productController.get(
    "/product_admin",
    access_control(["admin", "stock"]),
    (request, response) => {
        const edit_id = request.query.edit_id;
        if (edit_id) {
            getProductById(edit_id).then(([products]) => {
                if (products.length > 0) {
                    const edit_product = products[0];

                    getAllProductsWithLastUpdatedStaff().then(([products]) => {
                        response.render("product_admin.ejs", {
                            products: products,
                            edit_product: edit_product,
                            access_role: request.session.user.access_role,
                        });
                    });
                }
            });
        } else {
            getAllProductsWithLastUpdatedStaff().then(([products]) => {
                response.render("product_admin.ejs", {
                    products: products,
                    edit_product: {
                        product_id: 0,
                        name: "",
                        stock: 0,
                        price: 0,
                        description: "",
                    },
                    access_role: request.session.user.access_role,
                });
            });
        }
    }
);

productController.post(
    "/edit_product",
    access_control(["admin", "stock"]),
    (request, response) => {
        const edit_details = request.body;

        if (edit_details.action == "create") {
            createProduct(
                edit_details.name,
                edit_details.stock,
                edit_details.price,
                edit_details.description,
                request.session.user.staff_id
            ).then(([result]) => {
                response.redirect("/product_admin");
            });
        } else if (edit_details.action == "update") {
            updateProductById(
                edit_details.product_id,
                edit_details.name,
                edit_details.stock,
                edit_details.price,
                edit_details.description,
                request.session.user.staff_id
            ).then(([result]) => {
                response.redirect("/product_admin");
            });
        } else if (edit_details.action == "delete") {
            deleteProductById(edit_details.product_id).then(([result]) => {
                response.redirect("/product_admin");
            });
        }
    }
);

export default productController;

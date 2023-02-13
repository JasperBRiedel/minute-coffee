import express from "express";
import bcrypt from "bcryptjs";
import access_control from "../access_control.js";
import {
    createStaff,
    deleteStaffById,
    getAllStaff,
    getStaffById,
    getStaffByUsername,
    Staff,
    updateStaffById,
} from "../models/staff.js";

const staffController = express.Router();

staffController.get("/staff_login", (request, response) => {
    response.render("staff_login.ejs");
});

staffController.post("/staff_login", (request, response) => {
    const login_username = request.body.username;
    const login_password = request.body.password;

    getStaffByUsername(login_username).then(staff => {

        if (bcrypt.compareSync(login_password, staff.password)) {
            request.session.user = {
                staffID: staff.id,
                accessRole: staff.access_role,
            };

            response.redirect("/order_admin");
        } else {
            response.render("status.ejs", { status: "Login Failed", message: "Invalid password" });
        }
    }).catch(error => {
        response.render("status.ejs", { status: "Staff member not found", message: error });
    })
});

staffController.get("/staff_logout", (request, response) => {
    request.session.destroy();
    response.redirect("/");
});

staffController.get(
    "/staff_admin",
    access_control(["admin"]),
    (request, response) => {
        const editID = request.query.edit_id;
        if (editID) {
            getStaffById(editID).then(editStaff => {

                getAllStaff().then(allStaff => {
                    response.render("staff_admin.ejs", {
                        allStaff,
                        editStaff,
                        accessRole: request.session.user.accessRole,
                    });
                });
            });
        } else {
            getAllStaff().then(allStaff => {
                response.render("staff_admin.ejs", {
                    allStaff,
                    editStaff: Staff(0, "", "", "", "", ""),
                    accessRole: request.session.user.accessRole,
                });
            });
        }
    }
);

staffController.post(
    "/edit_staff",
    access_control(["admin"]),
    (request, response) => {
        const formData = request.body;

        if (!/[a-zA-Z-]{2,}/.test(formData.first_name)) {
            response.render("status.ejs", {
                status: "Invalid first name",
                message: "First name must be letters",
            });
            return;
        }

        if (!/[a-zA-Z-]{2,}/.test(formData.last_name)) {
            response.render("status.ejs", {
                status: "Invalid last name",
                message: "Last name must be letters",
            });
            return;
        }

        if (!/[a-zA-Z0-9-]{6,}/.test(formData.password)) {
            response.render("status.ejs", {
                status: "Invalid password",
                message:
                    "Password must be at least 6 characters long and contain a variety of characters.",
            });
            return;
        }

        // Create a staff model object to represent the staff member submitted
        const editStaff = Staff(
            formData.staff_id,
            formData.first_name,
            formData.last_name,
            formData.access_role,
            formData.username,
            formData.password
        )

        // hash the password if it isn't already hashed
        if (!editStaff.password.startsWith("$2a")) {
            editStaff.password = bcrypt.hashSync(editStaff.password);
        }

        // Determine and run CRUD operation
        if (formData.action == "create") {
            createStaff(editStaff).then(([result]) => {
                response.redirect("/staff_admin");
            });
        } else if (formData.action == "update") {
            updateStaffById(editStaff).then(([result]) => {
                response.redirect("/staff_admin");
            });
        } else if (formData.action == "delete") {
            deleteStaffById(editStaff.id).then(([result]) => {
                response.redirect("/staff_admin");
            });
        }
    }
);

export default staffController;

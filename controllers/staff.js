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
                staff_id: staff.id,
                access_role: staff.access_role,
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
        const edit_id = request.query.edit_id;
        if (edit_id) {
            getStaffById(edit_id).then(editStaff => {

                getAllStaff().then(allStaff => {
                    response.render("staff_admin.ejs", {
                        allStaff,
                        editStaff,
                        accessRole: request.session.user.access_role,
                    });
                });
            });
        } else {
            getAllStaff().then(allStaff => {
                response.render("staff_admin.ejs", {
                    allStaff,
                    editStaff: Staff(0, "", "", "", "", ""),
                    accessRole: request.session.user.access_role,
                });
            });
        }
    }
);

staffController.post(
    "/edit_staff",
    access_control(["admin"]),
    (request, response) => {
        const edit_details = request.body;

        if (!/[a-zA-Z-]{2,}/.test(edit_details.first_name)) {
            response.render("status.ejs", {
                status: "Invalid first name",
                message: "First name must be letters",
            });
            return;
        }

        if (!/[a-zA-Z-]{2,}/.test(edit_details.last_name)) {
            response.render("status.ejs", {
                status: "Invalid last name",
                message: "Last name must be letters",
            });
            return;
        }

        if (!/[a-zA-Z0-9-]{6,}/.test(edit_details.password)) {
            response.render("status.ejs", {
                status: "Invalid password",
                message:
                    "Password must be at least 6 characters long and contain a variety of characters.",
            });
            return;
        }

        // Create a staff model object to represent the staff member submitted
        const editStaff = Staff(
            edit_details.staff_id,
            edit_details.first_name,
            edit_details.last_name,
            edit_details.access_role,
            edit_details.username,
            edit_details.password
        )

        // hash the password if it isn't already hashed
        if (!editStaff.password.startsWith("$2a")) {
            editStaff.password = bcrypt.hashSync(editStaff.password);
        }

        // Determine and run CRUD operation
        if (edit_details.action == "create") {
            createStaff(editStaff).then(([result]) => {
                response.redirect("/staff_admin");
            });
        } else if (edit_details.action == "update") {
            if (!edit_details.password.startsWith("$2a")) {
                edit_details.password = bcrypt.hashSync(edit_details.password);
            }
            updateStaffById(editStaff).then(([result]) => {
                response.redirect("/staff_admin");
            });
        } else if (edit_details.action == "delete") {
            deleteStaffById(editStaff.id).then(([result]) => {
                response.redirect("/staff_admin");
            });
        }
    }
);

export default staffController;

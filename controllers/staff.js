import express from "express";
import bcrypt from "bcryptjs";
import {
    createStaff,
    deleteStaffById,
    getAllStaff,
    getStaffById,
    getStaffByUsername,
    updateStaffById,
} from "../models/staff.js";
import access_control from "../access_control.js";

const staffController = express.Router();

staffController.get("/staff_login", (request, response) => {
    response.render("staff_login.ejs");
});

staffController.post("/staff_login", (request, response) => {
    const login_username = request.body.username;
    const login_password = request.body.password;
    getStaffByUsername(login_username).then(([staffs]) => {
        if (staffs.length > 0) {
            let staff = staffs[0];

            if (bcrypt.compareSync(login_password, staff.password)) {
                request.session.user = {
                    staff_id: staff.staff_id,
                    access_role: staff.access_role,
                };

                response.redirect("/order_admin");
            } else {
                response.render("status.ejs", { status: "Invalid password" });
            }
        } else {
            response.render("status.ejs", { status: "staff not found" });
        }
    });
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
            getStaffById(edit_id).then(([staffs]) => {
                if (staffs.length > 0) {
                    const staff = staffs[0];

                    getAllStaff().then(([staffs]) => {
                        response.render("staff_admin.ejs", {
                            staffs: staffs,
                            edit_staff: staff,
                            access_role: request.session.user.access_role,
                        });
                    });
                }
            });
        } else {
            getAllStaff().then(([staffs]) => {
                response.render("staff_admin.ejs", {
                    staffs: staffs,
                    edit_staff: {
                        staff_id: 0,
                        first_name: "",
                        last_name: "",
                        access_role: "",
                        staffname: "",
                        password: "",
                    },
                    access_role: request.session.user.access_role,
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

        if (edit_details.action == "create") {
            createStaff(
                edit_details.first_name,
                edit_details.last_name,
                edit_details.access_role,
                edit_details.username,
                bcrypt.hashSync(edit_details.password)
            ).then(([result]) => {
                response.redirect("/staff_admin");
            });
        } else if (edit_details.action == "update") {
            if (!edit_details.password.startsWith("$2a")) {
                edit_details.password = bcrypt.hashSync(edit_details.password);
            }
            updateStaffById(
                edit_details.staff_id,
                edit_details.first_name,
                edit_details.last_name,
                edit_details.access_role,
                edit_details.username,
                edit_details.password
            ).then(([result]) => {
                response.redirect("/staff_admin");
            });
        } else if (edit_details.action == "delete") {
            deleteStaffById(edit_details.staff_id).then(([result]) => {
                response.redirect("/staff_admin");
            });
        }
    }
);

export default staffController;

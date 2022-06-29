import express from "express";
import bcrypt from "bcryptjs";
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  getUsersByUsername,
  updateUserById,
} from "../models/users.js";
import access_control from "../access_control.js";

const userController = express.Router();

userController.get("/user_login", (request, response) => {
  response.render("user_login.ejs");
});

userController.post("/user_login", (request, response) => {
  const login_username = request.body.username;
  const login_password = request.body.password;
  getUsersByUsername(login_username).then(([users]) => {
    if (users.length > 0) {
      let user = users[0];

      if (bcrypt.compareSync(login_password, user.password)) {
        request.session.user = {
          user_id: user.user_id,
          access_role: user.access_role,
        };

        response.redirect("/order_admin");
      } else {
        response.render("status.ejs", { status: "Invalid password" });
      }
    } else {
      response.render("status.ejs", { status: "User not found" });
    }
  });
});

userController.get("/user_logout", (request, response) => {
  request.session.destroy();
  response.redirect("/");
});

userController.get(
  "/user_admin",
  access_control(["admin"]),
  (request, response) => {
    const edit_id = request.query.edit_id;
    if (edit_id) {
      getUserById(edit_id).then(([users]) => {
        if (users.length > 0) {
          const user = users[0];

          getAllUsers().then(([users]) => {
            response.render("user_admin.ejs", {
              users: users,
              edit_user: user,
              access_role: request.session.user.access_role,
            });
          });
        }
      });
    } else {
      getAllUsers().then(([users]) => {
        response.render("user_admin.ejs", {
          users: users,
          edit_user: {
            user_id: 0,
            first_name: "",
            last_name: "",
            access_role: "",
            username: "",
            password: "",
          },
          access_role: request.session.user.access_role,
        });
      });
    }
  }
);

userController.post(
  "/edit_user",
  access_control(["admin"]),
  (request, response) => {
    const edit_details = request.body;

    if (edit_details.action == "create") {
      createUser(
        edit_details.first_name,
        edit_details.last_name,
        edit_details.access_role,
        edit_details.username,
        bcrypt.hashSync(edit_details.password)
      ).then(([result]) => {
        response.redirect("/user_admin");
      });
    } else if (edit_details.action == "update") {
      if (!edit_details.password.startsWith("$2a")) {
        edit_details.password = bcrypt.hashSync(edit_details.password);
      }
      updateUserById(
        edit_details.user_id,
        edit_details.first_name,
        edit_details.last_name,
        edit_details.access_role,
        edit_details.username,
        edit_details.password
      ).then(([result]) => {
        response.redirect("/user_admin");
      });
    } else if (edit_details.action == "delete") {
      deleteUserById(edit_details.user_id).then(([result]) => {
        response.redirect("/user_admin");
      });
    }
  }
);

export default userController;

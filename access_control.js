export default function access_control(allowedRoles) {
  return function (request, response, next) {
    if (request.session.user != null) {
      if (
        allowedRoles.some(
          (allowedRole) => allowedRole === request.session.user.accessRole
        )
      ) {
        next();
      } else {
        response.render("status.ejs", {
          status: "Access Denied",
          message: "Invalid access role",
        });
      }
    } else {
      response.render("status.ejs", {
        status: "Access Denied",
        message: "Not logged in",
      });
    }
  };
}

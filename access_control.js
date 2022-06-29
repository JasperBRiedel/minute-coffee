export default function access_control(allowed_roles) {
  return function (request, response, next) {
    if (request.session.user != null) {
      if (
        allowed_roles.some(
          (allowed_role) => allowed_role === request.session.user.access_role
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

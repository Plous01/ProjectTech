exports.login = (request, response) => {
    response.render("login", { errors: {}, person: {}});
}
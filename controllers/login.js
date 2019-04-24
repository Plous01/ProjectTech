module.exports = (request, response) => {
    response.render("login", { errors: {}, person: {}});
}
module.exports = (request, response) => {
    request.session.destroy();
    response.redirect("/");
}
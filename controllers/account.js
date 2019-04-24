module.exports = (request, response) => {
    // Check if user is logged in
    if (!request.session.personId) {
        response.redirect("/");
        return;
    }
    let personId = request.session.personId;
    response.redirect("/person/" + personId);
}
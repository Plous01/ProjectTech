exports.register = (request, response) => {
    response.render("register", {
        person: {
            gender: "F",
            sports: {}
        },
        errors: []
    });
}
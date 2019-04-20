const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const {
    check,
    validationResult
} = require('express-validator/check');

// Intialize connection to MongoDB database
let db = null;

const dbUri = process.env.DB_URI;
const dbName = process.env.DB_NAME;
const client = new MongoClient(dbUri, {
    useNewUrlParser: true
});

client.connect(error => {
    if (error) {
        console.log(error);
        throw error;
    }
    db = client.db(dbName);
});

exports.checkLogin = (request, response) => {
    let loginEmail = request.body.email;
    let loginPassword = request.body.password;

    let loginPerson = {
        email: loginEmail,
        password: loginPassword
    }

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        //console.log(errors.mapped());
        response.render("login", {
            person: loginPerson,
            errors: errors.mapped()
        });
        return;
    }    

    db.collection("persons").findOne(loginPerson, (error, person) => {
        if (error || person == null) {
            response.render("login", {
                person: loginPerson,
                errors: { loginError : "Login mislukt! Probeer het nog een keer"}
            });
        } else {
            request.session.personId = person._id;
            request.session.person = person.sports;
            response.redirect("/persons");
        }
    });
}
//Require packages
const express = require("express"); //source https://expressjs.com
const pug = require("pug"); //source https://pugjs.org/api/getting-started.html
const bodyparser = require("body-parser"); // source https://www.npmjs.com/package/body-parser
const MongoClient = require("mongodb").MongoClient; // source https://www.mongodb.com
const ObjectId = require("mongodb").ObjectID;
const dotenv = require("dotenv");
const session = require("express-session"); //source https://www.npmjs.com/package/express-session
const {
    check,
    validationResult
} = require('express-validator/check');

// Create express application
const app = express();

// Read the properties from the .env file
dotenv.config();

// Add body parser (used when a form is POST-ed)
app.use(bodyparser.urlencoded({
    extended: true
}));

// Add static content directory (static HTML, client side JavaScript, images and CSS)
app.use(express.static("public"));
// Initialize pug templating engine
app.set("view engine", "pug");
// Tell express to use sessions
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
}));

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

// List of available sports
let sports = ["fitness", "gymnastiek", "hardlopen", "atletiek",
    "hockey", "honkbal", "paardensport", "tennis", "schaatsen",
    "voetbal", "volleybal", "waterpolo", "zwemmen"
];

app.get("/person/:id", (request, response) => {
    // Check if user is logged in
    if (!request.session.personId) {
        response.redirect("/");
        return;
    }

    let personId = request.params.id;
    let objectId = new ObjectId(personId);
    db.collection("persons").findOne({
        "_id": objectId
    }, (error, person) => {
        if (error || person == null) {
            response.status(404).send("Not found");
        } else {
            response.render("person", person);
        }
    });
})

app.get("/account", (request, response) => {
    // Check if user is logged in
    if (!request.session.personId) {
        response.redirect("/");
        return;
    }
    let personId = request.session.personId;
    response.redirect("/person/" + personId);
})

app.get("/persons", (request, response) => {
    // Check if user is logged in
    if (!request.session.personId) {
        response.redirect("/");
        return;
    }

    let selectedSports = [];
    for (let sport of sports) {
        if (request.query[sport] === "on") {
            selectedSports.push(sport);
        }
    }

    let filter = null;
    if (selectedSports.length > 0) {
        filter = {
            sports: {
                $all: selectedSports
            }
        };
    }

    db.collection("persons").find(filter).toArray((error, persons) => {
        response.render("persons", {
            persons: persons,
            request: request
        });
    });
})

app.get("/register", (request, response) => {
    response.render("register", {
        person: {
            gender: "F",
            sports: {}
        },
        errors: []
    });
})

app.post("/register", [
    check("firstname").isLength({ min: 1 }).withMessage("Oh nee, het is wel handig als je een voornaam invoert"),
    check("lastname").isLength({ min: 1 }).withMessage("Oeps! Je bent je achternaam vergeten"),
    check("age").isInt({
        gt: 17 //greater than
    }).withMessage("Vul alsjeblieft je leeftijd is, de minimumleeftijd is 17 jaar"),
    check("email").isEmail().withMessage("Dit is helaas geen geldige e-mail"),
    check("description").not().isEmpty().withMessage("Probeer toch even een korte beschrijving van jezelf te geven, wees creatief"),
    check("password").isLength({
        min: 5
    }).withMessage("Je wachtwoord moet minimaal 5 karakters zijn"),
    check("passwordcheck","Wachtwoorden moeten gelijk zijn")
        .custom((value, { req }) => value == req.body.password)
], (request, response) => {    
    let firstname = request.body.firstname;
    let lastname = request.body.lastname;
    let age = request.body.age;
    let gender = request.body.gender;
    let password = request.body.password;
    let passwordcheck = request.body.passwordcheck;
    let email = request.body.email;
    let description = request.body.description;

    let selectedSports = []; // for database
    let submittedSports = {}; // for register form (to remember which checkboxes are checked)
    for (let sport of sports) {
        if (request.body[sport] === "on") {
            selectedSports.push(sport);
            submittedSports[sport] = "on";
        } else {
            submittedSports[sport] = "off";
        }
    }

    let person = {
        firstname: firstname,
        lastname: lastname,
        age: age,
        gender: gender,
        email: email,
        password: password,
        passwordcheck: passwordcheck,
        description: description,
        sports: submittedSports
    };

    const errors = validationResult(request).mapped();
    if (selectedSports.length == 0) {
        errors["sports"] = { msg: "Vul een of meerdere sporten in"};
    }

    if (Object.keys(errors).length>0) {
        response.render("register", {
            person: person,
            errors: errors
        });
        return;
    }

    // Make sure the right properties are send to the database
    person.sports = selectedSports;
    delete person.passwordcheck;

    db.collection("persons").insertOne(person, (error, person) => {
        response.redirect("/");
    })

})

app.get("/login", (request, response) => {
    response.render("login", { errors: {}, person: {}});
})

app.post("/login", [
    check("email").isEmail().withMessage("Dit is helaas geen geldige e-mail"),
    check("password").isLength({
        min: 5
    }).withMessage("Je wachtwoord moet minimaal 5 karakters zijn")
],(request, response) => {
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
            response.redirect("/persons");
        }
    });
})

app.get("/logout", (request, response) => {
    request.session.destroy();
    response.redirect("/");
})

// Start the server!
const port = process.env.SERVER_PORT || 3000
app.listen(port, () => {
    console.log("Server is running on port", port)
});
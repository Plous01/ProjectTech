//Require packages
const express = require("express"); //source https://expressjs.com
const pug = require("pug"); //source https://pugjs.org/api/getting-started.html
const bodyparser = require("body-parser"); // source https://www.npmjs.com/package/body-parser
const MongoClient = require("mongodb").MongoClient; // source https://www.mongodb.com
const ObjectId = require("mongodb").ObjectID;
const dotenv = require("dotenv");
const session = require("express-session"); //source https://www.npmjs.com/package/express-session
const multer = require('multer')

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

//Upload a photo
let upload = multer({
    dest: 'public/uploads/'
  })

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

console.log(sports);

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

app.post("/register", upload.single('profilePic'), (request, response) => {
    console.log("Register new person...");

    let firstname = request.body.firstname;
    let lastname = request.body.lastname;
    let age = request.body.age;
    let gender = request.body.gender;
    let password = request.body.password;
    let email = request.body.email;
    let description = request.body.description;
    let profilePic = request.body.profilePic;

    let selectedSports = [];
    for (let sport of sports) {
        if (request.body[sport] === "on") {
            selectedSports.push(sport);
        }
    }

    db.collection("persons").insertOne({
        firstname: firstname,
        lastname: lastname,
        age: age,
        gender: gender,
        email: email,
        password: password,
        description: description,
        sports: selectedSports,
        profilePic: request.file ? request.file.filename : null
    }, (error, person) => {
        response.redirect("/");
    })
})

app.post("/login", (request, response) => {
    console.log("Person login...");
    let loginEmail = request.body.email;
    let loginPassword = request.body.password;

    db.collection("persons").findOne({
        email: loginEmail,
        password: loginPassword
    }, (error, person) => {
        if (error || person == null) {
            response.redirect("/login.html");
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
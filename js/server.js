//Require packages
const express = require("express");
const pug = require("pug");
const bodyparser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const dotenv = require("dotenv");
const session = require("express-session");

const app = express();

// Read the properties from the .env file
dotenv.config();

// Initialize Express

// Add body parser (used when a form is POST-ed)
app.use(bodyparser.urlencoded({extended: true}));
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
const client = new MongoClient(dbUri, { useNewUrlParser: true });
client.connect(err => {
    if (err) throw err;
    db = client.db(dbName);
});

// List of available sports
let sports = ["fitness", "gymnastiek", "hardlopen", "atletiek", 
    "hockey", "honkbal", "paardensport", "tennis", "schaatsen", 
    "voetbal", "volleybal", "waterpolo", "zwemmen"];

app.get("/person/:id", (request,response) => {
    if (!request.session.personId) {
        response.redirect("/");
        return;
    }

    let personId = request.params.id;
    let objectId = new ObjectId(personId);
    db.collection("persons").findOne( {"_id": objectId},(err, data) => {
        if (err) {
            response.status(404).send("Not found");
        } else {
            response.render("person", data);
        }
    } );
})

app.get("/account", (request,response) => {
    if (!request.session.personId) {
        response.redirect("/");
        return;
    }
    let personId = request.session.personId;
    console.log(personId);
    response.redirect("/person/" + personId);
})

app.get("/persons", (request,response) => {
    if (!request.session.personId) {
        response.redirect("/");
        return;
    }

    let selectedSports = [];
    for(let sport of sports){
        if(request.query[sport]==="on"){
            selectedSports.push(sport);
        }
    }

    let filter = null;
    if (selectedSports.length>0) {
        filter = { sports: { $all: selectedSports }};
    }
    
    db.collection("persons").find(filter).limit(9).toArray((err, data) => {
        response.render("persons", { persons: data, request: request });
    });
})

app.post("/register", (request,response) => {
    console.log("Register new person...");
    console.log(request.body);
    let firstname = request.body.firstname;
    let lastname = request.body.lastname;
    let age = request.body.age;
    let gender = request.body.gender;
    let password = request.body.password;
    let email = request.body.email;
    let description = request.body.description;
     
    let selectedSports = [];
    for(let sport of sports){
        if(request.body[sport]==="on"){
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
        sports: selectedSports
    },(err, data) => {
        response.redirect("/persons");
    })

})

app.post("/login", (request,response) => {
    console.log("Person login...");
    let loginEmail = request.body.email;
    let loginPassword = request.body.password;

    db.collection("persons").findOne({email: loginEmail, password: loginPassword}, (error, person) => {
        console.log(person);
        if (error || person==null) {
            response.redirect("/login.html");
        } else {
            console.log(person);
            request.session.personId = person._id;
            response.redirect("/persons");
        }
    });
})

app.get("/logout",(request,response) => {
    request.session.destroy();
    response.redirect("/");
})

// Start the server!
const port = process.env.SERVER_PORT || 3000
app.listen(port, () => {
    console.log("Server is running on port", port)
});
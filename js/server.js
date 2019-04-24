//Require packages
const express = require("express"); //source https://expressjs.com
const pug = require("pug"); //source https://pugjs.org/api/getting-started.html
const bodyparser = require("body-parser"); // source https://www.npmjs.com/package/body-parser
const MongoClient = require("mongodb").MongoClient; // source https://www.mongodb.com
const ObjectId = require("mongodb").ObjectID;
const dotenv = require("dotenv");
const multer = require('multer');
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

const person = require('../controllers/person.js');
const editPerson = require('../controllers/editperson.js');
const account = require('../controllers/account.js')
const persons = require('../controllers/persons.js');
const createPerson = require('../controllers/createperson.js');
const register = require('../controllers/register.js');
const update = require('../controllers/update.js');
const login = require('../controllers/login.js');
const checkLogin = require('../controllers/checklogin.js');
const logout = require('../controllers/logout.js');

app.get("/person/:id", person);
app.get("/person/edit/:id", editPerson)
app.get("/account", account)
app.get("/persons", persons);
app.get("/register", register);
app.post("/register", upload.single('profilePic'), [
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
], createPerson)
app.post("/update", update);
app.get("/login", login);
app.post("/login", [
    check("email").isEmail().withMessage("Dit is helaas geen geldige e-mail"),
    check("password").isLength({
        min: 5
    }).withMessage("Je wachtwoord moet minimaal 5 karakters zijn")
], checkLogin)
app.get("/logout", logout);

// Start the server!
const port = process.env.SERVER_PORT || 3000
app.listen(port, () => {
    console.log("Server is running on port", port)
});
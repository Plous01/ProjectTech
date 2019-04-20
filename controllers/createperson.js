const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const multer = require('multer');
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

//Upload a photo
let upload = multer({
    dest: 'public/uploads/'
  })

let sports = ["fitness", "gymnastiek", "hardlopen", "atletiek",
    "hockey", "honkbal", "paardensport", "tennis", "schaatsen",
    "voetbal", "volleybal", "waterpolo", "zwemmen"
];


exports.createPerson = (request, response) => {    
    let firstname = request.body.firstname;
    let lastname = request.body.lastname;
    let age = request.body.age;
    let gender = request.body.gender;
    let password = request.body.password;
    let passwordcheck = request.body.passwordcheck;
    let email = request.body.email;
    let description = request.body.description;
    let profilePic = request.body.profilePic;

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
        sports: submittedSports,
        profilePic: request.file ? request.file.filename : null
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

}
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const multer = require('multer');

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

// List of available sports
let sports = ["fitness", "gymnastiek", "hardlopen", "atletiek",
    "hockey", "honkbal", "paardensport", "tennis", "schaatsen",
    "voetbal", "volleybal", "waterpolo", "zwemmen"
];


module.exports = (request, response, next) => {
    let personId = request.session.personId;
    let firstname = request.body.firstname;
    let lastname = request.body.lastname;
    let age = request.body.age;
    let gender = request.body.gender;
    let password = request.body.password;
    let email = request.body.email;
    let description = request.body.description;
    let selectedSports = request.session.sports;
 
     let newSports = [];
 
    for (let sport of sports) {
        if (request.body[sport] === "on") {
            newSports.push(sport);
        }
    }
 
 
    let updatedSports = [].concat(newSports,selectedSports);
    console.log(updatedSports);
 
    db.collection("persons").updateOne({"_id": ObjectId(personId)},{
        $set: {
            firstname: firstname,
            lastname: lastname,
            age: age,
            gender: gender,
            email: email,
            description: description,
            password: password,
            sports: updatedSports
        }
    }, {
        upsert: true
    },
     (error, person) => {
         response.redirect("/person/" + personId);
    })
 
 }
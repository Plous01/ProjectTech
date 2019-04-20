const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

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

exports.person = (request, response) => {
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
}
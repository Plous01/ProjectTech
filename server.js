//Require packages
const express = require('express');
const app = express();
const pug = require('pug');
const port = 3000;
const bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({extended: true}));

const persondb = require('./person');

//Add static content directory
app.use(express.static('public'));

//Initialize pug templating engine
app.set('view engine', 'pug');

//Routes
app.get('/', (req, res) => {
    res.render('index!')
})

app.get('/about', (req,res) => {
    let p = person.getPerson(0);
    res.render('about', p);
})

app.get('/person/:id', (req,res) => {
    let personId = req.params.id;
    let p = persondb.getPerson(personId);

    if (p===null) {
        res.status(404).send('Not found');
    } else {
        res.render('person', p);
    }
})

app.get('/persons', (req,res) => {
    let p = persondb.getPersons();
    res.render('persons', { persons: p });
})

app.post('/person', (req,res) => {

})

let sports = ['fitness', 'gymnastiek', 'hardlopen', 'atletiek', 'hockey', 'honkbal', 'paardensport', 'tennis', 'schaatsen', 'voetbal', 'volleybal', 'waterpolo', 'zwemmen'];

app.post('/person/register', (req,res) => {
    console.log("Register new person...");
    console.log(req.body);
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let age = req.body.age;
    let gender = req.body.gender;
     
    let person = new persondb.Person(firstname, lastname);
    person.setGender(gender);
    person.setAge(age);

    for(let sport of sports){
        if(req.body[sport]==='on'){
            console.log('adding sport', sport);
            person.addSport(sport);
        }
    }




    persondb.addPerson(person);

    res.writeHead(302, { 'Location' : '/persons' });
    res.end();
})


app.get('/test', (req,res)=>{
    res.status(404).send('Not found');
})

app.listen(port);
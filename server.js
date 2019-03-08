//Require packages
const express = require('express');
const app = express();
const pug = require('pug');
const port = 3000;

//Add static content directory
app.use(express.static('public'));

//Initialize pug templating engine
app.set('view engine', 'pug');

//Routes
app.get('/', (req, res) => {
    res.render('index!')
})

app.get('/about', (req,res) => {
    res.render('about');
})

app.get('/login', (req,res) => {
    res.send('login');
})

app.get('/test', (req,res)=>{
    res.status(404).send('Not found');
})

app.listen(port);
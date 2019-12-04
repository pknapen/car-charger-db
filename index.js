const express = require('express');
const app = express();
const port = 4000;
const bodyParser = require('body-parser');
var cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const passport = require('passport');
var Strategy = require('passport-http').BasicStrategy;
var multer = require('multer');

var pizza_storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './../pizza-app/public/images/pizzas/');
     },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});

var drink_storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './../pizza-app/public/images/drinks/');
     },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});

var upload_pizza = multer({ storage: pizza_storage })
var upload_drink = multer({ storage: drink_storage })

const saltRounds = 4;

app.use(bodyParser.json());
app.use(cors())

//Pizzas
app.get('/pizzas', (req, res) => { 
    db.query('SELECT *, FORMAT(sprice, 2) AS sprice, FORMAT(mprice, 2) AS mprice, FORMAT(lprice, 2) AS lprice FROM pizza').then(results => {
        res.json(results)
    })   
});

app.get('/pizzas/:id', (req, res) => { 
          db.query('SELECT * FROM pizza WHERE id = ?', [req.params.id]).then(results => {
            res.json(results);
          })
        });

app.post('/pizzas', upload_pizza.single('image'), (req, res) => {
    db.query('INSERT INTO pizza (name, ingredients, image, sprice, mprice, lprice) VALUES (?,?,?,?,?,?)', [req.body.name, req.body.ingredients, req.file.originalname, req.body.sprice, req.body.mprice, req.body.lprice])
    .then(results => {
        console.log(results);
        res.sendStatus(201);
    }) 
});

app.delete('/deletepizza/:id', (req, res) => {
  db.query('DELETE FROM pizza WHERE id = ?', [req.params.id]).then(results => {
    res.json(results);
  })
});

//Drinks
app.get('/drinks', (req, res) => { 
    db.query('SELECT *, FORMAT(price, 2) AS price FROM drinks').then(results => {
        res.json(results)
    })   
});

app.get('/drinks/:id', (req, res) => { 
          db.query('SELECT * FROM drinks WHERE id = ?', [req.params.id]).then(results => {
            res.json(results);
          })
        });

app.post('/drinks', upload_drink.single('image'), (req, res) => {
    db.query('INSERT INTO drinks (name, image, price) VALUES (?,?,?)', [req.body.name, req.file.originalname, req.body.price])
    .then(results => {
        console.log(results);
        res.sendStatus(201);
    }) 
});

app.delete('/deletedrink/:id', (req, res) => {
  db.query('DELETE FROM drinks WHERE id = ?', [req.params.id]).then(results => {
    res.json(results);
  })
});


//initialize database
Promise.all(
  [
    db.query(`CREATE TABLE IF NOT EXISTS pizza(
          id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(45) NOT NULL,
          ingredients VARCHAR(45) NOT NULL,
          image VARCHAR(255) NOT NULL,
          sprice FLOAT NOT NULL,
          mprice FLOAT NOT NULL,
          lprice FLOAT NOT NULL
      )`),
      db.query(`CREATE TABLE IF NOT EXISTS drinks(
          id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(45) NOT NULL,
          image VARCHAR(255) NOT NULL,
          price FLOAT NOT NULL
      )`)
  ]
).then(() => {
    app.listen(port, () => {
        console.log(`Listening on http://localhost:${port}\n`);
    });
});
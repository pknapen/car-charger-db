const express = require('express');
const app = express();
const port = 4000;
const bodyParser = require('body-parser');
var cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const passport = require('passport');
var Strategy = require('passport-http').BasicStrategy;

const saltRounds = 4;

app.use(bodyParser.json());
app.use(cors())

passport.use(new Strategy((username, password, callback) => {
  db.query('SELECT id, username, password FROM users WHERE username = ?', [username]).then(dbResults => {

    if(dbResults.length == 0)
    {
      return callback(null, false);
    }

    bcrypt.compare(password, dbResults[0].password).then(bcryptResult => {
      if(bcryptResult == true)
      {
        callback(null, dbResults[0]);
      }
      else
      {
        return callback(null, false);
      }
    })

  }).catch(dbError => callback(err))
}));


//users
app.get('/noauth', (req, res) => res.send('Hello World!'));

app.get('/auth', passport.authenticate('basic', { session: false }),
        (req, res) => res.send('This should be the part where the payment starts...'));

app.get('/users', (req, res) => {
  db.query('SELECT id, username FROM users').then(results => {
    res.json(results);
  })
})

app.get('/users/:id', passport.authenticate('basic', { session: false }), (req, res) => { 
          db.query('SELECT id, username FROM users WHERE id = ?', [req.params.id]).then(results => {
            res.json(results);
          })
        });

app.post('/users', (req, res) => {
  let username = req.body.username.trim();
  let password = req.body.password.trim();

  if((typeof username === "string") && (username.length > 3) &&
     (typeof password === "string") && (password.length > 3))
  {
    bcrypt.hash(password, saltRounds).then(hash =>
      db.query('INSERT INTO users (username, password) VALUES (?,?)', [username, hash])
    )
    .then(dbResults => {
        console.log(dbResults);
        res.sendStatus(201);
    })
    .catch(error => res.sendStatus(500));
  }
  else {
    console.log("incorrect username or password, both must be strings and username more than 4 long and password more than 6 characters long");
    res.sendStatus(400);
  }
})


//Chargers
app.get('/chargers', (req, res) => { 
    db.query('SELECT * FROM chargers').then(results => {
        res.json(results)
    })   
});

app.get('/chargers/:id', (req, res) => { 
          db.query('SELECT * FROM chargers WHERE id = ?', [req.params.id]).then(results => {
            res.json(results);
          })
        });

app.post('/chargers', (req, res) => {
    db.query('INSERT INTO chargers (name, code, location, longitude, latitude, type, price, status) VALUES (?,?,?,?,?,?,?,?)', [req.body.name, req.body.code, req.body.location, req.body.longitude, req.body.latitude, req.body.type, req.body.price, req.body.status])
    .then(results => {
        console.log(results);
        res.sendStatus(201);
    }) 
});




//initialize database
Promise.all(
  [
      db.query(`CREATE TABLE IF NOT EXISTS users(
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(256),
          password VARCHAR(256)
      )`),
      db.query(`CREATE TABLE IF NOT EXISTS chargers(
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(256),
          code VARCHAR(256),
          location VARCHAR(256),
          longitude VARCHAR(256),
          latitude VARCHAR(256),
          type VARCHAR(256),
          price VARCHAR(256),
          status VARCHAR(256)
      )`)
  ]
).then(() => {
    app.listen(port, () => {
        console.log(`Listening on http://localhost:${port}\n`);
    });
});
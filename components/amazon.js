const express = require('express');
const db = require('../db');
const router = express.Router();

//  Return all product information 
router.get('/', (req, res) => { 
    db.query('SELECT * FROM chargingPoint').then(results => {
        res.json(results)
    })
    .catch(() => {
        res.sendStatus(500);
    })    
});

//  Return information of a single product 
router.get('/:id', (req, res) => {
    db.query('SELECT * FROM chargingPoint where id = ?', [req.params.id])
    .then(results => {
        res.json(results);
    })
    .catch(error => { 
        console.error(error);
        res.sendStatus(500);
    });
})

router.post('/', (req, res) => {

    db.query('INSERT INTO chargingPoint (code, name, longitude, latitude, chargerType, status) VALUES (?,?,?,?,?,?)', [req.body.code, req.body.name, req.body.longitude, req.body.latitude, req.body.chargerType, req.body.status])
    .then(results => {
        console.log(results);
        res.sendStatus(201);
    })
    .catch(error => {
        console.error(error);
        res.sendStatus(500);
    });
    
});

router.delete('/:id', (req, res) => {
    db.query('DELETE FROM chargingPoint where id = ?', [req.params.id])
    .then(results => {
        res.sendStatus(200);
    })
    .catch(error => {
        console.error(error);
        res.sendStatus(500);
    });
})

module.exports = router;
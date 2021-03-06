const express = require('express');
const {Propery, validateProperty} = require('../models/property');
const router = express.Router();
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');

router.post('/', verifyToken, async (req, res) => {
    
    jwt.verify(req.token, config.get('jwtPrivateKey'), async (error) => {

        if (error) {
            res.sendStatus(403);
        }
        else{
            const { error } = validateProperty(req.body);
            if (error) return res.status(404).send(error.details[0].message);

            let property = Propery({
                agent: req.body.agent,
                name: req.body.name,
                location: req.body.location,
                imageUrl: req.body.imageUrl,
                price: req.body.price
            });

            try{
                await property.save();
                res.send(property);
            }
            catch {res.sendStatus(403);}
        } 
    });


});

router.get('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Property with the given ID does not exist');
    const property = await Propery.findById(req.params.id);
    if (!property) return res.status(404).send("Property with the given ID does not exist");

    /* if (property.views === 0) change the views back to 4 in an hour and then return sendStatus(403);
    else {
        property.views = property.view--;
        res.send(property);
    }
    */
    res.send(property);
});

router.get('/', async (req, res) => {
    const properties = await Propery
        .find()
        .sort('name');

    res.send(properties);
});

router.put('/:id', verifyToken, async (req, res) => {

    jwt.verify(req.token, config.get('jwtPrivateKey'), async (error) => {
        if (error) return sendStatus(403);
        else{
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Property with the given ID does not exist');

            const property = await Propery.findById(req.params.id);
            if (!property) return res.status(404).send("Property with the given ID does not exist");

            property.agent = req.body.agent;
            property.name = req.body.name,
            property.location = req.body.location,
            property.imageUrl = req.body.imageUrl,
            property.price = req.body.price

            await property.save();
            res.send(property);
        }
    });

})

router.delete('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Property with the given ID does not exist');
    const property = await Propery.findByIdAndRemove(req.params.id);

    if (!property) return res.status(404).send('Property with the given ID does not exist.');
    else{ return res.send('Property deleted'); }  
});


module.exports = router;
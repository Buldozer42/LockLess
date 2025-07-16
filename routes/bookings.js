const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Bookings = require('../entity/booking');

// Créer une réservation
router.post('/',auth, async (req, res) => {
    const booking = await Bookings.create(req.body);
    res.status(201).json(booking);
});

// Récupérer toutes les réservations
router.get('/',auth, async (req, res) => {
    const bookings = await Bookings.find().populate('ownerId lockerId');
    res.json(bookings);
});

// Récupérer une réservation
router.get('/:id',auth, async (req, res) => {
    const booking = await Bookings.findById(req.params.id).populate('ownerId lockerId');
    res.json(booking);
});

// Modifier une réservation
router.put('/:id',auth, async (req, res) => {
    const booking = await Bookings.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(booking);
});

// Supprimer une réservation
router.delete('/:id',auth, async (req, res) => {
    await Bookings.findByIdAndDelete(req.params.id);
    res.json({ message: 'Réservation supprimée' });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Bookings = require('../entity/booking');

// Créer une réservation
const Lockers = require('../entity/locker'); // N'oublie pas d'importer

router.post('/', auth, async (req, res) => {
    try {
        const booking = await Bookings.create(req.body);

        if (booking) {
            // Mettre à jour le locker concerné
            const changeStatus = await Lockers.findByIdAndUpdate(
                booking.lockerId,
                { state: 'reserved' }
            );


            res.status(201).json({booking , changeStatus});
        }
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création de la réservation', details: error.message });
    }
});

// Récupérer toutes les réservations
router.get('/',auth, async (req, res) => {
    const bookings = await Bookings.find().populate('ownerId lockerId');
    res.json(bookings);
});
// Récupérer les réservations de l'utilisateur connecté
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.id; // ou req.user._id selon ton middleware `auth`
        const bookings = await Bookings.find({ ownerId: userId }).populate('ownerId lockerId');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
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

const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();
const Lockers = require('../entity/locker');
const Bookings = require('../entity/booking')
// Créer un locker
router.post('/', auth, async (req, res) => {
    try {
        const { number, state } = req.body;

        if (!number || !state) {
            return res.status(400).json({ error: 'Les champs number et state sont requis.' });
        }

        const existingLocker = await Lockers.findOne({ number: number });
        if (existingLocker) {
            return res.status(409).json({ error: 'Ce numéro de locker est déjà utilisé.' });
        }

        const locker = await Lockers.create(req.body);
        res.status(201).json(locker);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Récupérer tous les lockers avec mise à jour dynamique du statut
router.get('/', auth, async (req, res) => {
    try {
        const lockers = await Lockers.find();
        const now = new Date();

        await Promise.all(lockers.map(async (locker) => {
            
            // On récupère la dernière réservation de ce casier
            const latestBooking = await Bookings.findOne({ lockerId: locker._id })
                .sort({ endDate: -1 });

            // Si une réservation existe
            if (latestBooking) {
                const isFinished = latestBooking.endDate < now;

                // Si la réservation est finie ET que le casier n'est pas dispo
                if (isFinished && locker.state !== 'available') {
                    locker.state = 'available';
                    await locker.save();
                }

            } else {
                // Aucun booking : on s'assure que le casier est dispo
                if (locker.state !== 'available') {
                    locker.state = 'available';
                    await locker.save();
                }
            }
        }));

        // Retour des casiers mis à jour
        const updatedLockers = await Lockers.find();
        res.json(updatedLockers);
    } catch (error) {
        console.error('Erreur lors de la récupération des lockers :', error);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
});


// Récupérer un locker
router.get('/:id',auth, async (req, res) => {
    const locker = await Lockers.findById(req.params.id);
    res.json(locker);
});

// Modifier un locker
router.put('/:id',auth, async (req, res) => {
    const locker = await Lockers.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(locker);
});

// Supprimer un locker
router.delete('/:id',auth, async (req, res) => {
    await Lockers.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lockers supprimé' });
});

module.exports = router;

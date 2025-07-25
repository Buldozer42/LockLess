const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();
const Lockers = require('../entity/locker');
const Bookings = require('../entity/booking')

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

router.get('/', auth, async (req, res) => {
    try {
        const lockers = await Lockers.find();
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        await Promise.all(lockers.map(async (locker) => {
            
            const latestBooking = await Bookings.findOne({ lockerId: locker._id })
                .sort({ endDate: -1 });

            if (latestBooking) {
                const isFinished = latestBooking.endDate <= now;

                if (isFinished && locker.state !== 'available') {
                    locker.state = 'available';
                    await locker.save();
                }

            } else {
                if (locker.state !== 'available') {
                    locker.state = 'available';
                    await locker.save();
                }
            }
        }));

        const updatedLockers = await Lockers.find();
        res.json(updatedLockers);
    } catch (error) {
        console.error('Erreur lors de la récupération des lockers :', error);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
});

router.get('/:id',auth, async (req, res) => {
    const locker = await Lockers.findById(req.params.id);
    res.json(locker);
});

router.put('/:id',auth, async (req, res) => {
    const locker = await Lockers.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(locker);
});

router.delete('/:id',auth, async (req, res) => {
    await Lockers.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lockers supprimé' });
});

module.exports = router;

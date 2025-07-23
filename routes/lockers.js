const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();
const Lockers = require('../entity/locker');

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


// Récupérer tous les lockers
router.get('/',auth, async (req, res) => {
    const lockers = await Lockers.find();
    res.json(lockers);
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

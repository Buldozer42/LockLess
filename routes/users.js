const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();
const userService = require('../service/userService');

router.get('/getUsers',auth, async (req, res) => {
    const users = await userService.getUsers();
    res.json(users);
});

router.get('/:id',auth, async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
});

router.put('/update/:id', auth, async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required: firstName, lastName, email, password' });
    }

    try {
        const user = await userService.updateUser(
            req.params.id,
            firstName,
            lastName,
            email,
            password
        );
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error updating user: ' + error.message });
    }
});

router.delete('/:id', async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
});

module.exports = router;

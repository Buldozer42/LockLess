const jwt = require('jsonwebtoken');
const LoginService = require("../service/loginService");

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Accès refusé. Aucun token.' });

    try {
        req.user = LoginService.tokenVerify(token);
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token invalide.' });
    }
};

module.exports = auth;

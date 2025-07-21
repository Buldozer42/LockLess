const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserService = require('./userService');

/**
 * Service pour gérer l'authentification et l'autorisation des utilisateurs.
 * @class
 */
class LoginService {
    /**
     * Authentifie l'utilisateur en vérifiant son email et son mot de passe.
     * @param res - l'objet 'response' pour définir le cookie de session.
     * @param email - L'email de l'utilisateur.
     * @param password - Le mot de passe de l'utilisateur.
     * @returns {Promise<{token: string, user: User}>} Un objet contenant le token JWT et l'utilisateur authentifié.
     * @throws {Error} Si l'email ou le mot de passe est incorrect.
     * @throws {Error} Si l'utilisateur n'existe pas.
     */

    static async login(res, email, password) {
        const user = await UserService.getUserByEmail(email);
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }
        
        const isPasswordCorrect = await this.comparePassword(password, user.password);
        if (!isPasswordCorrect) {
            throw new Error('Mot de passe incorrect');
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'prod',
            sameSite: 'Strict',
            maxAge: 60 * 60 * 1000, // 1h
        });

        return { token, user };
    }

    /**
     * Déconnecte l'utilisateur en supprimant le cookie de session.
     * @param token - Le token JWT de l'utilisateur.
     * @returns {Promise<{message: string}>} Un message de succès.
     */
    static async logout(token) {
        return { message: 'Logged out successfully' };
    }

    /**
     * Enregistre un nouvel utilisateur dans la base de données.
     * @param res - l'objet 'response' pour définir le cookie de session.
     * @param firstName - Le prénom de l'utilisateur.
     * @param lastName - Le nom de famille de l'utilisateur.
     * @param email - L'email de l'utilisateur.
     * @param password - Le mot de passe de l'utilisateur.
     * @returns {Promise<{token: string, user: User}>} Un objet contenant le token JWT et l'utilisateur créé.
     */
    static async register(res, firstName, lastName, email, password) {
        const hashedPassword = await this.hashPassword(password);
        const user = await UserService.createUser(
            firstName.toLowerCase(),
            lastName.toUpperCase(),
            email,
            hashedPassword
        );
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'prod',
            sameSite: 'Strict',
            maxAge: 60 * 60 * 1000, // 1h
        });

        return { token, user };
    }

    /**
     * Hash un mot de passe en utilisant bcrypt.
     * @param password - Le mot de passe en clair à hacher.
     * @return {Promise<string>} Le mot de passe haché.
     */
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }
  
    /**
     * Compare un mot de passe en clair avec un mot de passe haché.
     * @param password - Le mot de passe en clair à comparer.
     * @param hash - Le mot de passe haché à comparer.
     * @return {Promise<boolean>} Vrai si le mot de passe correspond au haché, faux sinon.
     */
    static async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Vérifie un token JWT et retourne l'ID de l'utilisateur.
     * @param token - Le token JWT à vérifier.
     * @returns {string} L'ID de l'utilisateur si le token est valide.
     * @throws {Error} Si le token est invalide ou expiré.
     */
    static tokenVerify(token) {
        return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                throw new Error('Invalid token');
            }
            return decoded.id;
        });
    }

    /**
     * Vérifie un token JWT et s'assure que l'utilisateur a un rôle spécifique.
     * @param token - Le token JWT à vérifier.
     * @param role - Le rôle requis pour l'utilisateur.
     * @returns {string} L'ID de l'utilisateur si le token est valide et l'utilisateur a le rôle spécifié.
     * @throws {Error} Si le token est invalide, expiré ou si l'utilisateur n'a pas le rôle requis.
     */
    static async tokenRoleVerify(token, role) {
        const userId = this.tokenVerify(token);
        const user = await UserService.getUserById(userId);
        if (!user || !user.roles.includes(role)) {
            throw new Error('Unauthorized');
        }
        return userId;
    }
}

module.exports = LoginService;
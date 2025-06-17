const User = require('../entity/user');

/**
 * Service pour gérer les utilisateurs
 * @class
 */
class UserService {
    /**
     * Créer un nouvel utilisateur dans la base de données.
     * @param firstName - Le prénom de l'utilisateur.
     * @param lastName - Le nom de famille de l'utilisateur. 
     * @param email - L'email de l'utilisateur.
     * @param password - Le mot de passe de l'utilisateur.
     * @returns {Promise<User>} L'utilisateur créé.
     */
    static async createUser(firstName, lastName, email, password) {
      const user = new User({
        firstName: firstName.toLowerCase(),
        lastName: lastName.toUpperCase(),
        email,
        password,
      });
      return await user.save();
    }
  
    /**
     * Renvoie tous les utilisateurs de la base de données.
     * @returns {Promise<User[]>}
     */
    static async getUsers() {
      return await User.find();
    }
  
    /**
     * Récupère un utilisateur par son ID de la base de données.
     * @param id - L'ID de l'utilisateur.
     * @returns {Promise<User>}
     */
    static async getUserById(id) {
      return await User.findById(id);
    }

    /**
     * Récupère un utilisateur par son email de la base de données.
     * @param email - L'email de l'utilisateur.
     * @returns {Promise<User>}
     */
    static async getUserByEmail(email) {
      return await User.findOne({ email });
    }
  
    /**
     * Met à jour un utilisateur dans la base de données.
     * @param id - L'ID de l'utilisateur à mettre à jour.
     * @param firstName - Le prénom de l'utilisateur.
     * @param lastName - Le nom de famille de l'utilisateur.
     * @param email - L'email de l'utilisateur.
     * @param password - Le mot de passe hashé de l'utilisateur.
     * @returns {Promise<User>}
     */
    static async updateUser(id, firstName, lastName, email, password) {
      return await User.findByIdAndUpdate(
        id,
        { firstName, lastName, email, password },
        { new: true }
      );
    }
  
    /**
     * Supprime un utilisateur de la base de données.
     * @param id - L'ID de l'utilisateur à supprimer.
     * @returns {Promise<User>}
     */
    static async deleteUser(id) {
      return await User.findByIdAndDelete(id);
    }

    /**
     * Crée un token de réinitialisation de mot de passe pour un utilisateur.
     * @param email - L'email de l'utilisateur pour lequel le token est créé.
     * @returns {Promise<{user: User, resetToken: string}>} L'utilisateur et le token de réinitialisation
     */
    static async createPasswordResetToken(email) {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('Aucun utilisateur trouvé avec cet email');
      }
      
      // Génère un token aléatoire
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(20).toString('hex');
      
      // Enregistre le token et sa date d'expiration (valide pour 1 heure)
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
      await user.save();
      
      return { user, resetToken };
    }

    /**
     * Vérifie si un token de réinitialisation est valide.
     * @param token - Le token de réinitialisation à vérifier.
     * @returns {Promise<User>} L'utilisateur associé au token
     */
    static async verifyResetToken(token) {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        throw new Error('Le token de réinitialisation est invalide ou a expiré');
      }
      
      return user;
    }

    /**
     * Réinitialise le mot de passe d'un utilisateur avec un token valide.
     * @param token - Le token de réinitialisation.
     * @param newPassword - Le nouveau mot de passe de l'utilisateur.
     * @returns {Promise<User>} L'utilisateur mis à jour
     */
    static async resetPassword(token, newPassword) {
      const user = await this.verifyResetToken(token);
      
      // Hash le nouveau mot de passe
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Met à jour le mot de passe et supprime le token de réinitialisation
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return user;
    }
}
  
module.exports = UserService;
const User = require('../entity/user');

/**
 * Service class for managing user data.
 * @class
 */
class UserService {
    /**
     * Creates and saves a new user to the database.
     * @param firstName
     * @param lastName.
     * @param email
     * @param password
     * @returns {Promise<User>} The created user object.
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
     * Gets all users from the database.
     * @returns {Promise<User[]>} An array of user objects.
     */
    static async getUsers() {
      return await User.find();
    }
  
    /**
     * Gets a user by ID from the database.
     * @param id
     * @returns {Promise<User>} The user object.
     */
    static async getUserById(id) {
      return await User.findById(id);
    }

    /**
     * Gets a user by email from the database.
     * @param email
     * @returns {Promise<User>} The user object.
     */
    static async getUserByEmail(email) {
      return await User.findOne({ email });
    }
  
    /**
     * Updates a user in the database.
     * @param id
     * @param firstName
     * @param lastName
     * @param email
     * @param password
     * @returns {Promise<User>} The updated user object.
     */
    static async updateUser(id, firstName, lastName, email, password) {
      return await User.findByIdAndUpdate(
        id,
        { firstName, lastName, email, password },
        { new: true }
      );
    }
  
    /**
     * Deletes a user from the database.
     * @param id
     * @returns {Promise<User>} The deleted user object.
     */
    static async deleteUser(id) {
      return await User.findByIdAndDelete(id);
    }

    /**
     * Crée un token de réinitialisation de mot de passe pour un utilisateur.
     * @param email - L'email de l'utilisateur
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
     * @param token - Le token à vérifier
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
     * @param token - Le token de réinitialisation
     * @param newPassword - Le nouveau mot de passe
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
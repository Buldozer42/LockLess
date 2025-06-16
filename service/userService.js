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
}
  
module.exports = UserService;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserService = require('./userService');

/**
 * Service class for managing user authentication and authorization.
 * @class
 */
class LoginService {
    /**
     * Logs in a user by validating their email and password.
     * @param res - The response object to set the cookie.
     * @param email
     * @param password
     * @returns {Promise<{token: string, user: User}>} The authentication token and user object.
     */

    static async login(res, email, password) {
        const user = await UserService.getUserByEmail(email);
        const isPasswordCorrect = await this.comparePassword(password, user.password);
        if (!user || !isPasswordCorrect) {
            throw new Error('Invalid email or password');
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

    static async logout(token) {
        // Invalidate the token by removing it from the client side.
        // This is usually done by deleting the token from local storage or cookies.
        // No server-side action is needed for JWTs, as they are stateless.
        return { message: 'Logged out successfully' };
    }

    /**
     * Registers a new user by creating a new user object in the database.
     * @param res - The response object to set the cookie.
     * @param firstName
     * @param lastName
     * @param email
     * @param password
     * @returns {Promise<User>} The created user object.
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
     * Hashes a password using bcrypt.
     * @param password
     * @return {Promise<string>} The hashed password.
     */
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }
  
    /**
     * Compares a password with a hashed password.
     * @param password  - The password to compare.
     * @param hash - The hashed password to compare against.
     * @return {Promise<boolean>} True if the password matches the hash, false otherwise.
     */
    static async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Verifies a JWT token and returns the user ID.
     * @param token
     * @returns {string} The user ID.
     * @throws {Error} If the token is invalid.
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
     * Verifies a JWT token and checks if the user has a specific role.
     * @param token
     * @param role
     * @returns {string} The user ID if the token is valid and the user has the specified role.
     * @throws {Error} If the token is invalid or the user does not have the specified role.
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
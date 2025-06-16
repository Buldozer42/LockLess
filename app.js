const express = require('express');
const app = express();
const { connectDB } = require('./service/db');
const LoginService = require('./service/loginService');
const UserService = require('./service/userService');
const MailService = require('./service/mailService');

// Middleware for parsing JSON and URL-encoded data
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

connectDB().then(async () => {});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Exemple of authenticate route
app.get('/account', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const userId = LoginService.tokenVerify(token);
    res.send('Authenticated user ID: ' + userId);
  } catch (error) {
    res.status(500).json({ error: 'Error getting account : ' + error.message });
  }
});

// Exemple of authenticate route with roles restriction
app.get('/admin', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const userId = LoginService.tokenRoleVerify(token, 'admin');
    res.send('Authenticated admin user ID: ' + userId);
  } catch (error) {
    res.status(500).json({ error: 'Error getting admin account : ' + error.message });
  }
});

// Post route for login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (! email || ! password){
    res.status(500).json({ error: 'All field are required : email, password'});
  } else {
    try {
      const {token, user} = await LoginService.login(
        res,
        email,
        password
      );
      res.status(201).json({ token, user });
    } catch (error) {
      res.status(500).json({ error: 'Error login : ' + error.message });
    }
  }

});

// Post route for register
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (! firstName || ! lastName || ! email || ! password) {
    res.status(500).json({ error: 'All field are required : firstName, lastName, email, password' });
  } else {
    try {
      const {token, user} = await LoginService.register(
        res,
        firstName,
        lastName,
        email,
        password
      );
      res.status(201).json({ token, user });
    } catch (error) {
      res.status(500).json({ error: 'Error creating user : ' + error.message });
    }
  }

});

// Route pour demander une réinitialisation de mot de passe
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'L\'adresse email est requise' });
  }
  
  try {
    // Vérifier si l'utilisateur existe et créer un token de réinitialisation
    const { user, resetToken } = await UserService.createPasswordResetToken(email);
    
    // URL de base pour la réinitialisation (à ajuster selon votre frontend)
    const resetUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Envoyer l'email avec le lien de réinitialisation
    await MailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      resetToken,
      resetUrl
    );
    
    res.status(200).json({ 
      message: 'Un email de réinitialisation a été envoyé à votre adresse email' 
    });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation :', error);
    // Ne pas révéler si l'email existe ou pas pour des raisons de sécurité
    res.status(200).json({ 
      message: 'Si cette adresse email est associée à un compte, un email de réinitialisation a été envoyé' 
    });
  }
});

// Route pour vérifier la validité d'un token de réinitialisation
app.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  
  try {
    // Vérifie si le token est valide et non expiré
    await UserService.verifyResetToken(token);
    res.status(200).json({ 
      message: 'Token valide', 
      valid: true 
    });
  } catch (error) {
    res.status(400).json({ 
      error: 'Token invalide ou expiré', 
      valid: false 
    });
  }
});

// Route pour réinitialiser le mot de passe avec un token valide
app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Le nouveau mot de passe est requis' });
  }
  
  try {
    // Réinitialiser le mot de passe
    const user = await UserService.resetPassword(token, password);
    
    // Envoyer un email de confirmation
    await MailService.sendPasswordResetConfirmationEmail(
      user.email,
      user.firstName
    );
    
    res.status(200).json({ 
      message: 'Votre mot de passe a été réinitialisé avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe :', error);
    res.status(400).json({ 
      error: error.message 
    });
  }
});

// Route pour que l'utilisateur puisse modifier son mot de passe lorsqu'il est connecté
app.post('/change-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ 
      error: 'L\'ancien mot de passe et le nouveau mot de passe sont requis' 
    });
  }
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Authentification requise' 
    });
  }
  
  try {
    // Vérifier le token et récupérer l'ID utilisateur
    const userId = LoginService.tokenVerify(token);
    const user = await UserService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }
    
    // Vérifier l'ancien mot de passe
    const isPasswordCorrect = await LoginService.comparePassword(oldPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ 
        error: 'L\'ancien mot de passe est incorrect' 
      });
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await LoginService.hashPassword(newPassword);
    
    // Mettre à jour le mot de passe
    user.password = hashedPassword;
    await user.save();
    
    // Envoyer une notification de changement de mot de passe
    await MailService.sendNotification(
      user.email,
      'Mot de passe modifié',
      'Votre mot de passe a été modifié avec succès. Si vous n\'êtes pas à l\'origine de cette action, veuillez nous contacter immédiatement.'
    );
    
    res.status(200).json({ 
      message: 'Votre mot de passe a été modifié avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe :', error);
    res.status(500).json({ 
      error: 'Erreur lors du changement de mot de passe : ' + error.message 
    });
  }
});

// Launch the server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

/**
 * Configuration du transporteur pour l'envoi d'emails
 * Utilise les variables d'environnement pour les informations sensibles
 */
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: process.env.MAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASSWORD || ''
  }
});

/**
 * Service de gestion des emails
 */
const MailService = {
  /**
   * Envoie un email
   * @param {string} to - Adresse email du destinataire
   * @param {string} subject - Sujet de l'email
   * @param {string} text - Contenu texte de l'email
   * @param {string} html - Contenu HTML de l'email (optionnel)
   * @returns {Promise} - Promise contenant le résultat de l'envoi
   */
  sendEmail: async (to, subject, text, html) => {
    const mailOptions = {
      from: process.env.MAIL_FROM || '"LockLess App" <noreply@lockless.com>',
      to,
      subject,
      text,
      html: html || text
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email envoyé: %s', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Envoie un email de bienvenue à un nouvel utilisateur
   * @param {string} email - Adresse email de l'utilisateur
   * @param {string} username - Nom d'utilisateur
   * @returns {Promise} - Promise contenant le résultat de l'envoi
   */
  sendWelcomeEmail: async (email, username) => {
    const subject = 'Bienvenue sur LockLess !';
    const text = `Bonjour ${username},\n\nNous vous souhaitons la bienvenue sur LockLess. Votre compte a été créé avec succès.\n\nCordialement,\nL'équipe LockLess`;
    const html = `
      <h1>Bienvenue sur LockLess !</h1>
      <p>Bonjour ${username},</p>
      <p>Nous vous souhaitons la bienvenue sur LockLess. Votre compte a été créé avec succès.</p>
      <p>Cordialement,<br>L'équipe LockLess</p>
    `;

    return MailService.sendEmail(email, subject, text, html);
  },

  /**
   * Envoie une notification
   * @param {string} email - Adresse email du destinataire
   * @param {string} title - Titre de la notification
   * @param {string} message - Message de la notification
   * @returns {Promise} - Promise contenant le résultat de l'envoi
   */  sendNotification: async (email, title, message) => {
    const subject = `LockLess - ${title}`;
    const text = `${message}\n\nCordialement,\nL'équipe LockLess`;
    const html = `
      <h1>${title}</h1>
      <p>${message}</p>
      <p>Cordialement,<br>L'équipe LockLess</p>
    `;

    return MailService.sendEmail(email, subject, text, html);
  },

  /**
   * Envoie un email de réinitialisation de mot de passe
   * @param {string} email - Adresse email de l'utilisateur
   * @param {string} username - Nom d'utilisateur
   * @param {string} resetToken - Token de réinitialisation
   * @param {string} resetUrl - URL de base pour la réinitialisation
   * @returns {Promise} - Promise contenant le résultat de l'envoi
   */
  sendPasswordResetEmail: async (email, username, resetToken, resetUrl) => {
    const resetLink = `${resetUrl}/reset-password/${resetToken}`;
    const subject = 'LockLess - Réinitialisation de mot de passe';
    const text = `Bonjour ${username},\n\n
    Vous avez demandé une réinitialisation de votre mot de passe. Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe :\n\n
    ${resetLink}\n\n
    Ce lien est valide pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et votre mot de passe restera inchangé.\n\n
    Cordialement,\nL'équipe LockLess`;
    
    const html = `
      <h1>Réinitialisation de mot de passe</h1>
      <p>Bonjour ${username},</p>
      <p>Vous avez demandé une réinitialisation de votre mot de passe. Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe :</p>
      <p><a href="${resetLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a></p>
      <p>Ou copiez ce lien dans votre navigateur :</p>
      <p>${resetLink}</p>
      <p>Ce lien est valide pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et votre mot de passe restera inchangé.</p>
      <p>Cordialement,<br>L'équipe LockLess</p>
    `;

    return MailService.sendEmail(email, subject, text, html);
  },

  /**
   * Envoie un email de confirmation de réinitialisation de mot de passe
   * @param {string} email - Adresse email de l'utilisateur
   * @param {string} username - Nom d'utilisateur
   * @returns {Promise} - Promise contenant le résultat de l'envoi
   */
  sendPasswordResetConfirmationEmail: async (email, username) => {
    const subject = 'LockLess - Confirmation de réinitialisation de mot de passe';
    const text = `Bonjour ${username},\n\n
    Nous confirmons que votre mot de passe a été réinitialisé avec succès. Si vous n'êtes pas à l'origine de cette action, veuillez nous contacter immédiatement.\n\n
    Cordialement,\nL'équipe LockLess`;
    
    const html = `
      <h1>Confirmation de réinitialisation de mot de passe</h1>
      <p>Bonjour ${username},</p>
      <p>Nous confirmons que votre mot de passe a été réinitialisé avec succès. Si vous n'êtes pas à l'origine de cette action, veuillez nous contacter immédiatement.</p>
      <p>Cordialement,<br>L'équipe LockLess</p>
    `;

    return MailService.sendEmail(email, subject, text, html);
  }
};

module.exports = MailService;

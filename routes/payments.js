const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const PaymentService = require('../service/paymentService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../entity/booking');

// Créer une session de paiement pour une réservation
router.post('/create-session/:bookingId', auth, async (req, res) => {
  try {
    const session = await PaymentService.createPaymentSession(req.params.bookingId);

    res.json({ 
      sessionId: session.id, 
      url: session.url 
    });
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour gérer le succès du paiement (remplace le webhook)
router.get('/success', async (req, res) => {
  try {
    const { id: bookingId } = req.query;
    
    // Récupérer les détails de la réservation
    const booking = await Booking.findById(bookingId);
    
    if (!booking || !booking.paymentSessionId) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }
    
    // Vérifier l'état du paiement dans Stripe
    const session = await stripe.checkout.sessions.retrieve(booking.paymentSessionId);
    
    if (session.payment_status === 'paid') {
      // Mettre à jour le statut de la réservation
      await PaymentService.handlePaymentSuccess(session);
      
      // Rediriger vers la page de confirmation
      return res.redirect(`${process.env.FRONTEND_URL}/home?confirmation=true&booking_id=${bookingId}`);
    } else {
      // Le paiement n'est pas encore traité ou a échoué
      return res.redirect(`${process.env.FRONTEND_URL}/home?pending=true&booking_id=${bookingId}`);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour vérifier manuellement le statut d'un paiement
router.get('/verify/:bookingId', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking || !booking.paymentSessionId) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }
    
    // Vérifier l'état du paiement dans Stripe
    const session = await stripe.checkout.sessions.retrieve(booking.paymentSessionId);
    
    // Mettre à jour le statut du paiement si nécessaire
    if (session.payment_status === 'paid' && booking.paymentStatus !== 'paid') {
      await PaymentService.handlePaymentSuccess(session);
      return res.json({ status: 'paid', message: 'Paiement confirmé' });
    } else if (session.status === 'expired' && booking.paymentStatus === 'pending') {
      await PaymentService.handlePaymentExpired(session);
      return res.json({ status: 'expired', message: 'Session de paiement expirée' });
    }
    
    // Retourner le statut actuel
    return res.json({ status: booking.paymentStatus });
  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Annuler une réservation et son paiement si nécessaire
router.post('/cancel/:bookingId', auth, async (req, res) => {
  try {
    const result = await PaymentService.cancelBookingPayment(req.params.bookingId);
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de l\'annulation du paiement:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

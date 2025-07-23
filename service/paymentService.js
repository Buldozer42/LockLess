const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../entity/booking');
const Locker = require('../entity/locker');
const User = require('../entity/user');

class PaymentService {
  /**
   * Crée une session de paiement Stripe pour une réservation
   * @param {string} bookingId - ID de la réservation
   * @returns {Promise<Object>} - Session de paiement Stripe
   */
  static async createPaymentSession(bookingId) {
    try {
      // Récupérer les détails de la réservation avec les informations du casier et de l'utilisateur
      const booking = await Booking.findById(bookingId)
        .populate('lockerId')
        .populate('ownerId');

      if (!booking) {
        throw new Error('Réservation introuvable');
      }

      const locker = booking.lockerId;
      const user = booking.ownerId;

      // Calculer le prix total en fonction de la durée de la réservation
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const totalAmount = locker.price * durationInDays;      // Créer une session de paiement Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Réservation du casier ${locker.number}`,
                description: `Du ${startDate.toLocaleDateString()} au ${endDate.toLocaleDateString()}`,
              },
              unit_amount: Math.round(totalAmount * 100), // Stripe utilise les centimes
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        // Utiliser notre endpoint de vérification de paiement au lieu d'un webhook
        success_url: `${process.env.API_URL}/payment/success?id=${bookingId}`,
        cancel_url: `${process.env.FRONTEND_URL}/home?cancel=true&booking_id=${bookingId}`, // Modifiez cette URL selon le frontend
        customer_email: user.email,
        client_reference_id: booking._id.toString(),
        metadata: {
          bookingId: booking._id.toString(),
          lockerId: locker._id.toString(),
          userId: user._id.toString(),
        },
      });

      // Mettre à jour la réservation avec l'ID de la session de paiement
      booking.paymentSessionId = session.id;
      booking.paymentStatus = 'pending';
      await booking.save();

      return session;
    } catch (error) {
      console.error('Erreur lors de la création de la session de paiement:', error);
      throw error;
    }
  }

  /**
   * Traite un paiement réussi
   * @param {Object} session - Session Stripe
   * @returns {Promise<void>}
   */
  static async handlePaymentSuccess(session) {
    try {
      const bookingId = session.metadata.bookingId;
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        console.error(`Réservation introuvable: ${bookingId}`);
        return;
      }

      booking.paymentStatus = 'paid';
      booking.paymentId = session.payment_intent;
      booking.paymentDate = new Date();
      await booking.save();

      // Mettre à jour l'état du casier à 'reserved'
      await Locker.findByIdAndUpdate(booking.lockerId, { state: 'reserved' });

      console.log(`Paiement réussi pour la réservation ${bookingId}`);
    } catch (error) {
      console.error('Erreur lors du traitement du paiement réussi:', error);
      throw error;
    }
  }

  /**
   * Traite une session de paiement expirée
   * @param {Object} session - Session Stripe
   * @returns {Promise<void>}
   */
  static async handlePaymentExpired(session) {
    try {
      const bookingId = session.metadata.bookingId;
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        console.error(`Réservation introuvable: ${bookingId}`);
        return;
      }

      booking.paymentStatus = 'failed';
      await booking.save();

      console.log(`Session de paiement expirée pour la réservation ${bookingId}`);
    } catch (error) {
      console.error('Erreur lors du traitement de la session expirée:', error);
      throw error;
    }
  }

  /**
   * Annule une réservation et son paiement si nécessaire
   * @param {string} bookingId - ID de la réservation
   * @returns {Promise<Object>} - Résultat de l'annulation
   */
  static async cancelBookingPayment(bookingId) {
    try {
      const booking = await Booking.findById(bookingId);
      
      if (!booking) {
        throw new Error('Réservation introuvable');
      }

      // Si un paiement a été effectué, créer un remboursement
      if (booking.paymentStatus === 'paid' && booking.paymentId) {
        await stripe.refunds.create({
          payment_intent: booking.paymentId,
        });

        booking.paymentStatus = 'refunded';
        await booking.save();

        // Remettre le casier en état disponible
        await Locker.findByIdAndUpdate(booking.lockerId, { state: 'available' });
      } else if (booking.paymentStatus === 'pending' && booking.paymentSessionId) {
        // Si le paiement est en attente, annuler la session de paiement
        await stripe.checkout.sessions.expire(booking.paymentSessionId);
        
        booking.paymentStatus = 'cancelled';
        await booking.save();
      }

      return { success: true, message: 'Réservation et paiement annulés avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'annulation du paiement:', error);
      throw error;
    }
  }

  /**
   * Vérifie manuellement le statut d'une session de paiement
   * @param {string} bookingId - ID de la réservation
   * @returns {Promise<Object>} - Résultat de la vérification
   */
  static async verifyPaymentStatus(bookingId) {
    try {
      const booking = await Booking.findById(bookingId);
      
      if (!booking || !booking.paymentSessionId) {
        throw new Error('Réservation ou session de paiement introuvable');
      }
      
      // Récupérer les informations de session depuis Stripe
      const session = await stripe.checkout.sessions.retrieve(booking.paymentSessionId);
      
      // Mettre à jour le statut en fonction du statut Stripe
      if (session.payment_status === 'paid' && booking.paymentStatus !== 'paid') {
        await this.handlePaymentSuccess(session);
        return { status: 'paid', message: 'Paiement confirmé et réservation mise à jour' };
      } else if (session.status === 'expired' && booking.paymentStatus === 'pending') {
        await this.handlePaymentExpired(session);
        return { status: 'expired', message: 'Session expirée et réservation mise à jour' };
      }
      
      // Retourner le statut actuel sans modification
      return { 
        status: booking.paymentStatus, 
        stripeStatus: session.payment_status,
        sessionStatus: session.status
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      throw error;
    }
  }
}

module.exports = PaymentService;

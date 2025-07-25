const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Bookings = require("../entity/booking");
const LoginService = require('../service/loginService');
// Créer une réservation
const Lockers = require("../entity/locker"); // N'oublie pas d'importer
const User = require("../entity/user");

router.post("/", auth, async (req, res) => {
  try {
    const booking = await Bookings.create(req.body);

    if (booking) {
      // Mettre à jour le locker concerné
      const changeStatus = await Lockers.findByIdAndUpdate(booking.lockerId, {
        state: "reserved",
      });

      res.status(201).json({ booking, changeStatus });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Erreur lors de la création de la réservation",
        details: error.message,
      });
  }
});

// Récupérer toutes les réservations
router.get("/", auth, async (req, res) => {
  const bookings = await Bookings.find().populate("ownerId lockerId");
  res.json(bookings);
});
// Récupérer les réservations de l'utilisateur connecté
router.get("/me", auth, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const userId = LoginService.tokenVerify(token);
    const bookings = await Bookings.find({ ownerId: userId }).populate(
      "ownerId lockerId"
    );
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});
// Récupérer une réservation
router.get("/:id", auth, async (req, res) => {
  const booking = await Bookings.findById(req.params.id).populate(
    "ownerId lockerId"
  );
  res.json(booking);
});

// Modifier une réservation
router.put("/:id", auth, async (req, res) => {
  const booking = await Bookings.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(booking);
});

// Supprimer une réservation
// Supprimer une réservation et libérer le casier
router.delete("/:id", auth, async (req, res) => {
  const booking = await Bookings.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Réservation non trouvée" });
  }
  await Bookings.findByIdAndDelete(req.params.id);
  await Lockers.findByIdAndUpdate(booking.lockerId, {
    state: "available",
  });
  res.json({ message: "Réservation supprimée" });
});


module.exports = router;

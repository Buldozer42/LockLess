const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    ownerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lockerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Locker', required: true },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true }
});

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

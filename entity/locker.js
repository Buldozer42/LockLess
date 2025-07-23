const mongoose = require('mongoose');

const lockerSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
    size:   { type: String, required: true },
    state: {
        type: String,
        enum: ['available', 'reserved', 'unavailable'],
        required: true
    },
    price:  { type: Number, required: true }
});

module.exports = mongoose.models.Locker || mongoose.model('Locker', lockerSchema);
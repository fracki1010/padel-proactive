const express = require('express');
const router = express.Router();
const { getBookings, createBooking } = require('../controllers/booking.controller');

// GET http://localhost:3000/api/bookings -> Ver todas las reservas
router.get('/', getBookings);

// POST http://localhost:3000/api/bookings -> Crear una reserva
router.post('/', createBooking);

module.exports = router;
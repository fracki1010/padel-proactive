const Booking = require('../models/booking.model');
const TimeSlot = require('../models/timeSlot.model');
const Court = require('../models/court.model');

// 1. OBTENER RESERVAS (GET)
const getBookings = async (req, res) => {
  try {
    const { date } = req.query; // Esperamos formato YYYY-MM-DD
    let query = {};

    if (date) {
      // Convertimos string "2025-01-20" a objeto Date UTC medianoche
      const searchDate = new Date(date);
      searchDate.setUTCHours(0, 0, 0, 0); 
      query.date = searchDate;
    }

    const bookings = await Booking.find(query)
      .populate('court', 'name')     // Trae nombre de cancha
      .populate('timeSlot')          // <--- IMPORTANTE: Trae info del turno (hora inicio/fin)
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. CREAR RESERVA (POST) - Lógica Nueva
const createBooking = async (req, res) => {
  try {
    // Ahora recibimos "time" (ej: "20:00") en lugar de una fecha completa con hora
    const { courtId, date, time, clientName, clientPhone } = req.body;

    // A. Validaciones básicas
    if (!courtId || !date || !time || !clientName || !clientPhone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Faltan datos: courtId, date (YYYY-MM-DD), time (HH:mm), clientName o clientPhone' 
      });
    }

    // B. Buscar el TimeSlot (El turno fijo)
    const slot = await TimeSlot.findOne({ startTime: time });
    if (!slot) {
      return res.status(400).json({ success: false, error: 'Horario no válido o inexistente' });
    }

    // C. Preparar fecha exacta (Sin horas, solo día)
    const bookingDate = new Date(date);
    bookingDate.setUTCHours(0, 0, 0, 0);

    // D. Validar Disponibilidad (Busqueda exacta)
    // "¿Existe ya una reserva activa para esta cancha, este día y este slot?"
    const existingBooking = await Booking.findOne({
      court: courtId,
      date: bookingDate,
      timeSlot: slot._id,
      status: { $ne: 'cancelado' }
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        error: 'La cancha ya está reservada en ese turno.'
      });
    }

    // E. Crear la Reserva (Usando el precio del Slot)
    const newBooking = await Booking.create({
      court: courtId,
      date: bookingDate,
      timeSlot: slot._id, // Guardamos la referencia al turno
      clientName,
      clientPhone,
      finalPrice: slot.price, // Usamos el precio que ya está en la BD
      status: 'confirmado'
    });

    // F. Responder con datos completos (poblados)
    await newBooking.populate(['court', 'timeSlot']);

    res.status(201).json({
      success: true,
      data: {
        id: newBooking._id,
        court: newBooking.court.name,
        date: newBooking.date.toISOString().split('T')[0],
        time: `${newBooking.timeSlot.startTime} - ${newBooking.timeSlot.endTime}`,
        price: newBooking.finalPrice,
        client: newBooking.clientName
      }
    });

  } catch (error) {
    console.error(error);
    // Manejo de error por índice único duplicado (Doble seguridad)
    if (error.code === 11000) {
        return res.status(409).json({ success: false, error: 'La cancha ya está reservada.' });
    }
    res.status(500).json({ success: false, error: 'Error interno al reservar' });
  }
};

module.exports = {
  getBookings,
  createBooking
};
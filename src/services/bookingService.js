const Booking = require('../models/booking.model');
const Court = require('../models/court.model');
const TimeSlot = require('../models/timeSlot.model');

const createNewBooking = async ({ courtName, dateStr, timeStr, clientName, clientPhone }) => {
    try {
        // 1. Normalizar Fecha (Solo día, mes, año)
        // dateStr viene como "2025-01-20"
        const bookingDate = new Date(dateStr);
        bookingDate.setUTCHours(0, 0, 0, 0); // Forzar medianoche UTC para evitar problemas de zona

        // 2. Buscar el TimeSlot correspondiente (Ej: "20:00")
        const slot = await TimeSlot.findOne({ startTime: timeStr });
        if (!slot) {
            return { success: false, error: 'INVALID_TIME' }; // "Ese horario no existe"
        }

        // 3. Buscar la Cancha
        const court = await Court.findOne({ name: { $regex: courtName, $options: 'i' } });
        if (!court) return { success: false, error: 'CANCHA_NOT_FOUND' };

        // 4. VERIFICAR DISPONIBILIDAD (Query Exacta y Rápida)
        // Buscamos si existe una reserva con: Misma Cancha + Mismo Slot + Misma Fecha
        const existingBooking = await Booking.findOne({
            court: court._id,
            date: bookingDate,
            timeSlot: slot._id,
            status: { $ne: 'cancelado' }
        });

        if (existingBooking) {
            return { success: false, error: 'BUSY' };
        }

        // 5. Crear Reserva (Usando el precio del Slot)
        const newBooking = await Booking.create({
            court: court._id,
            date: bookingDate,
            timeSlot: slot._id,
            clientName,
            clientPhone,
            finalPrice: slot.price, // Hereda el precio del turno
            status: 'confirmado'
        });

        return { 
            success: true, 
            data: {
                booking: newBooking,
                courtName: court.name,
                startTime: slot.startTime,
                endTime: slot.endTime,
                price: slot.price
            }
        };

    } catch (error) {
        // Capturar error de índice único (Doble seguridad)
        if (error.code === 11000) {
            return { success: false, error: 'BUSY' };
        }
        console.error('Error bookingService:', error);
        return { success: false, error: 'INTERNAL_ERROR' };
    }
};

module.exports = { createNewBooking };
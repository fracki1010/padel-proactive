const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const bookingRoutes = require('./routes/booking.routes'); 
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/chat', chatRoutes);
app.use('/api/bookings', bookingRoutes); // <--- 2. Agregar ruta base

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.send('¡El servidor del Chatbot Groq y Reservas está funcionando! 🚀');
});

module.exports = app;
const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chatRoutes");
const bookingRoutes = require("./routes/booking.routes");
const authRoutes = require("./routes/auth.routes");
const { protect } = require("./middleware/auth.middleware");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes); // El chat puede necesitar ser público si el bot consulta algo, pero el bot usa handlers directamente.
app.use("/api/bookings", protect, bookingRoutes);
app.use("/api/config", protect, require("./routes/config.routes"));
app.use("/api/users", protect, require("./routes/user.routes"));
app.use("/api/notifications", protect, require("./routes/notification.routes"));

// Ruta básica de prueba
app.get("/", (req, res) => {
  res.send("¡El servidor del Chatbot Groq y Reservas está funcionando! 🚀");
});

module.exports = app;

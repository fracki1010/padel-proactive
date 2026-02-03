const { getChatResponse } = require('../services/groqService');
const { createNewBooking } = require('../services/bookingService');
const sessionService = require('../services/sessionService');

const handleIncomingMessage = async (chatId, userMessage) => {
    // 1. Guardar mensaje del usuario
    sessionService.addMessage(chatId, 'user', userMessage);
    const history = sessionService.getHistory(chatId);

    // 2. Consultar a la IA
    const aiResponse = await getChatResponse(history);

    // 3. Verificar si es una ORDEN (JSON) o TEXTO
    let decision;
    try {
        decision = JSON.parse(aiResponse);
    } catch (e) {
        decision = null;
    }

    // --- CASO A: IA QUIERE RESERVAR ---
    if (decision && decision.action === 'CREATE_BOOKING') {
        const cleanPhone = chatId.replace('@c.us', '');

        // Usamos el servicio de reservas DIRECTAMENTE (sin fetch)
        const result = await createNewBooking({
            courtName: decision.courtName,
            dateStr: decision.date,   // Pasamos "2025-01-20"
            timeStr: decision.time,   // Pasamos "20:00"
            clientName: decision.clientName,
            clientPhone: chatId.replace('@c.us', '')
        });

        if (result.success) {
            sessionService.clearHistory(chatId); // Éxito -> Borrar memoria
            const { courtName, price } = result.data;
            const dateStr = new Date(decision.datetime).toLocaleString('es-AR');

            return `✅ *¡Reserva Confirmada!*\n\n🎾 ${courtName}\n📅 ${dateStr}\n💰 $${price}\n👤 ${decision.clientName}`;
        } else {
            // Manejo de errores específicos
            let errorMsg = '';
            if (result.error === 'CANCHA_NOT_FOUND') errorMsg = '⚠️ No encontré esa cancha. ¿Es Cancha 1 o 2?';
            else if (result.error === 'BUSY') errorMsg = '⛔ Ese horario ya está ocupado. ¿Probamos otro?';
            else errorMsg = '❌ Hubo un error interno al reservar.';

            sessionService.addMessage(chatId, 'assistant', errorMsg);
            return errorMsg;
        }
    }

    // --- CASO B: IA RESPONDE TEXTO NORMAL ---
    sessionService.addMessage(chatId, 'assistant', aiResponse);
    return aiResponse;
};

module.exports = { handleIncomingMessage };
// src/services/groqService.js
const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Ahora recibimos 'messagesHistory' que es un array de toda la charla
const getChatResponse = async (messagesHistory) => {
  try {
    const infoPath = path.join(process.cwd(), 'business_info.txt');
    let contextoNegocio = "";
    try {
        contextoNegocio = fs.readFileSync(infoPath, 'utf8');
    } catch (err) {
        contextoNegocio = "Eres un asistente de pádel."; 
    }

    // 1. FECHA ACTUAL EXACTA (Para que sepa qué es "hoy")
    const now = new Date();
    const options = { timeZone: "America/Argentina/Buenos_Aires", hour12: false, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const fechaHumana = now.toLocaleString("es-AR", options);
    const fechaISO = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // 2. PROMPT DE INGENIERÍA (Lógica de pensamiento)
    const systemPrompt = `
    ${contextoNegocio}

    [DATOS DEL SISTEMA]
    - FECHA Y HORA ACTUAL: ${fechaHumana}.
    - FECHA FORMATO ISO HOY: ${fechaISO}.

    [TUS OBJETIVOS]
    1. Tu meta es RESERVAR una cancha. Necesitas 3 datos:
       - CANCHA (1 o 2).
       - FECHA Y HORA (Formato ISO Final).
       - NOMBRE DEL CLIENTE.

    [REGLAS DE INTERACCIÓN]
    1. MEMORIA: Analiza todo el historial de la conversación para ver qué datos ya te dio el usuario antes.
    2. FECHA "HOY": 
       - Si el usuario dice solo una hora (ej: "18:30"), ASUME que es para HOY (${fechaISO}).
       - PERO SIEMPRE PREGUNTA: "¿Es para hoy [Fecha] a las [Hora], verdad?". Confirma antes de cerrar.
    3. Si falta algún dato, PÍDELO. No intentes reservar si falta la cancha o el nombre.
    4. RECOPILACIÓN:
       - Si dice "quiero turno", pregunta "¿Para cuándo?".
       - Si dice "hoy 18hs", pregunta "¿Qué cancha? Tenemos Cancha 1 y 2. ¿Y cuál es tu nombre?".


    [SALIDA JSON REQUERIDA]
    {
      "action": "CREATE_BOOKING",
      "courtName": "Cancha 1", 
      "date": "YYYY-MM-DD",     <-- Separado
      "time": "HH:mm",          <-- Separado (Ej: "20:00")
      "clientName": "Juan"
    }

    Si te faltan datos, responde con TEXTO normal y amigable preguntando lo que falta.
    `;

    // Construimos el array de mensajes para Groq
    // Primero las instrucciones del sistema, luego el historial de chat
    const conversation = [
        { role: "system", content: systemPrompt },
        ...messagesHistory 
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: conversation,
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, // Baja temperatura para ser preciso con datos
      max_tokens: 300,
      response_format: { type: "json_object" } 
    });

    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error en Groq Service:", error);
    return "Tuve un error procesando tu solicitud.";
  }
};

module.exports = { getChatResponse };
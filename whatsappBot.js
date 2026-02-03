require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const connectDB = require('./src/config/database');
const app = require('./src/app');
const { handleIncomingMessage } = require('./src/handlers/messageHandler'); // Importamos el cerebro

const PORT = process.env.PORT || 3000;

// Inicialización
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server & Bot corriendo en http://localhost:${PORT}`);
    });
});

const isDocker = process.env.IS_DOCKER === 'true';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        // 1. ELIMINA O COMENTA ESTA LÍNEA:
        // executablePath: '/usr/bin/google-chrome-stable',
        
        // 2. MANTÉN LOS ARGUMENTOS (Son necesarios en Linux/Servidores)
        args: isDocker ? [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ] : ['--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage']
    }
});



client.on('qr', (qr) => qrcode.generate(qr, { small: true }));

client.on('ready', () => console.log('✅ Bot de WhatsApp listo!'));

// --- EVENTO DE MENSAJE ---
client.on('message', async (message) => {

    console.log(message);
    
    // Validaciones básicas
    if (message.from === 'status@broadcast' || message.from.includes('@g.us')) return;
    if (!message.body) return;

    const chatId = message.from;
    console.log(`📩 ${chatId}: ${message.body}`);
    const chat = await message.getChat();

    try {
        await chat.sendStateTyping();

        // DELEGAMOS TODO AL HANDLER
        const responseText = await handleIncomingMessage(chatId, message.body);
        
        // RESPONDEMOS
        await message.reply(responseText);

    } catch (error) {
        console.error('Error procesando mensaje:', error);
        await message.reply('Tuve un error, por favor intentá de nuevo.');
    } finally {
        await chat.clearState();
    }
});

client.initialize()
    .then(() => console.log('🚀 Proceso de inicialización enviado...'))
    .catch(err => {
        console.error('❌ ERROR CRÍTICO AL INICIAR EL BOT:', err);
    });
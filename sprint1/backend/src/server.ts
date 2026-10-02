import dotenv from 'dotenv';
import { app } from './app.js';
import { initializeDatabase } from './database/db.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;

// Ensure database tables exist
initializeDatabase();

app.listen(PORT, () => {
  console.log('=======================================================');
  console.log('⚡ Servidor Backend SERS iniciado com sucesso!');
  console.log(`🌐 URL Local: http://localhost:${PORT}`);
  console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log('=======================================================');
});

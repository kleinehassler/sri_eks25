import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;
const HOST = '0.0.0.0';

// Servir archivos estáticos
app.use(express.static(join(__dirname, 'dist')));

// Manejar todas las rutas (React Router)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`✅ Frontend corriendo en http://${HOST}:${PORT}`);
});

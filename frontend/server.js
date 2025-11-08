import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;
const HOST = '0.0.0.0';

// Verificar que la carpeta dist existe
const distPath = join(__dirname, 'dist');
if (!existsSync(distPath)) {
  console.error('❌ ERROR: La carpeta dist no existe.');
  console.error('   Asegúrate de ejecutar "npm run build" antes de iniciar el servidor.');
  console.error(`   Buscando en: ${distPath}`);
  process.exit(1);
}

console.log(`✅ Carpeta dist encontrada en: ${distPath}`);

// Servir archivos estáticos
app.use(express.static(distPath));

// Manejar todas las rutas (React Router)
app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Error: index.html no encontrado');
  }
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Frontend SRI ATS corriendo en http://${HOST}:${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${distPath}`);
});

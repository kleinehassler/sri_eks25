const bcrypt = require('bcrypt');

const password = 'Machala2025'; // Cambia por tu contraseña
bcrypt.hash(password, 10).then(hash => {
  console.log('Hash:', hash);
  process.exit(0);
});
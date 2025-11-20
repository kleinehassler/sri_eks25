// ===========================================
// Configuración PM2 para Producción
// Sistema ATS - SRI Ecuador
// ===========================================

module.exports = {
  apps: [
    {
      // Backend API
      name: 'sri-ats-backend',
      cwd: './backend',
      script: 'src/server.js',

      // Modo cluster para mejor rendimiento
      instances: 'max', // Usar todos los CPUs disponibles
      exec_mode: 'cluster',

      // Variables de entorno
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },

      // Reinicio automático
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',

      // Manejo de errores
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: '10s',

      // Logs
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true,

      // Métricas
      instance_var: 'INSTANCE_ID'
    }
  ],

  // Configuración de deploy (opcional)
  deploy: {
    production: {
      user: 'sriapp',
      host: 'tu-servidor.com',
      ref: 'origin/main',
      repo: 'git@github.com:tu-usuario/sri_eks25.git',
      path: '/home/sriapp/sri_eks25',
      'pre-deploy-local': '',
      'post-deploy': 'npm run install:all && npm run migrate && npm run build:frontend && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};

# Backend Dockerfile - Sistema ATS SRI Ecuador
FROM node:18-alpine

# Metadatos
LABEL maintainer="Sistema ATS Ecuador"
LABEL description="Backend API para Sistema ATS - SRI Ecuador"
LABEL version="1.0.0"

# Instalar dependencias de compilación necesarias para bcrypt y libxmljs2
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libxml2-dev \
    && rm -rf /var/cache/apk/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (mejor cache de Docker)
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Crear directorios necesarios para la aplicación
RUN mkdir -p \
    logs \
    uploads/xml \
    uploads/temp \
    storage/ats \
    storage/temp \
    && chown -R node:node /app

# Crear usuario no-root para seguridad
USER node

# Exponer puerto de la API
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Comando de inicio
CMD ["node", "src/server.js"]

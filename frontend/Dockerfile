# Frontend Dockerfile - Sistema ATS SRI Ecuador
# Multi-stage build para optimización

# ================================
# Stage 1: Build
# ================================
FROM node:18-alpine AS build

# Metadatos
LABEL maintainer="Sistema ATS Ecuador"
LABEL description="Frontend para Sistema ATS - SRI Ecuador"
LABEL version="1.0.0"

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm ci && npm cache clean --force

# Copiar código fuente
COPY . .

# Variables de entorno para build (pueden ser sobrescritas)
ARG VITE_API_URL=/api
ARG VITE_APP_NAME="Sistema ATS - SRI Ecuador"

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

# Construir aplicación para producción
RUN npm run build

# ================================
# Stage 2: Production (Nginx)
# ================================
FROM nginx:1.25-alpine

# Metadatos
LABEL maintainer="Sistema ATS Ecuador"
LABEL description="Frontend Nginx para Sistema ATS - SRI Ecuador"

# Eliminar configuración por defecto de nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados del stage anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Crear usuario no-root y ajustar permisos
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]

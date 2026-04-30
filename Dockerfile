# Etapa 1: Compilar la aplicación
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY next.config.ts* ./
COPY tsconfig.json* ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Compilar la aplicación
RUN npm run build

# Instalar solo dependencias de producción (para reducir tamaño)
RUN npm ci --legacy-peer-deps --omit=dev

# Etapa 2: Imagen final para producción
FROM node:20-alpine AS runner

WORKDIR /app

# Crear usuario sin privilegios
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde la etapa builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copiar tailwind.config y postcss si es necesario (para estilos)
COPY --from=builder /app/tailwind.config.ts* ./
COPY --from=builder /app/postcss.config.mjs* ./

# Cambiar propietario
RUN chown -R nextjs:nodejs /app

# Cambiar al usuario sin privilegios
USER nextjs

# Puerto que usará la aplicación
EXPOSE 3000

# Variables de entorno
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV production

# Comando para iniciar
CMD ["node", "server.js"]
# syntax=docker/dockerfile:1

# Build del frontend (React + Vite)
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Backend (Express)
FROM node:20-alpine AS backend
WORKDIR /app

# dependencias del backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copiar backend completo 
COPY backend/ ./backend/

# Copiar build del frontend dentro del backend para servirlo
COPY --from=frontend /app/frontend/dist ./backend/public/app

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

WORKDIR /app/backend
CMD ["node", "index.js"]
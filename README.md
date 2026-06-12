# Frontend Citas

Frontend del sistema de citas construido con React, TypeScript y Vite.

## Requisitos

- Node.js 22 o superior
- npm 11 o superior

## Instalacion

```bash
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y ajusta la URL del backend si hace falta:

```env
VITE_API_URL=http://localhost:3000
```

En Vercel configura la misma variable apuntando al backend de Railway:

```env
VITE_API_URL=https://agendacitas-production.up.railway.app
```

El frontend usa JWT: primero inicia sesion en `/auth/login` y luego envia
`Authorization: Bearer <token>` a los endpoints protegidos.

## Comandos

```bash
npm run dev
npm run build
npm run preview
```

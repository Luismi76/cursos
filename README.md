# InfoCurso - Sistema de Gestión de Cursos

Sistema completo de gestión de cursos con frontend Next.js y backend Spring Boot.

## 🏗️ Arquitectura

- **Frontend**: Next.js 14 (TypeScript, Tailwind CSS)
- **Backend**: Spring Boot 3.x (Java 21)
- **Database**: PostgreSQL 16
- **WebSocket**: STOMP over SockJS

## 📦 Estructura del Proyecto

```
infocurso/
├── backend/              # Spring Boot API
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── osiconnect/          # Next.js Frontend
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml   # Orquestación de servicios
└── .env.example         # Variables de entorno template
```

## 🚀 Deployment con Coolify

Ver [walkthrough.md](walkthrough.md) para instrucciones completas de deployment.

### Quick Start

1. Clonar repositorio
2. Copiar `.env.example` a `.env` y configurar
3. En Coolify: New Project → Docker Compose
4. Configurar variables de entorno
5. Deploy

## 🔧 Desarrollo Local

### Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend
```bash
cd osiconnect
npm install
npm run dev
```

### Con Docker
```bash
docker-compose up
```

## 📝 Variables de Entorno

Ver `.env.example` para la lista completa.

## 📖 Documentación

- [Deployment Guide](walkthrough.md)
- [Deployment Checklist](DEPLOYMENT.md)

## 🔐 Seguridad

- JWT para autenticación
- CORS configurado
- Variables de entorno para secrets
- SSL/TLS en producción

## 👥 Roles

- **ADMINISTRADOR**: Gestión de cursos y usuarios
- **PROFESOR**: Gestión de contenido y calificaciones
- **ALUMNO**: Acceso a materiales y entregas

## 🌟 Características

- ✅ Gestión de cursos, módulos y unidades
- ✅ Chat en tiempo real por curso
- ✅ Wiki colaborativa
- ✅ Sistema de prácticas y exámenes
- ✅ Control de asistencia
- ✅ Gestión de calificaciones
- ✅ Notificaciones en tiempo real

## 📄 Licencia

Privado

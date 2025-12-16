# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InfoCurso is a course management system with a Next.js frontend and Spring Boot backend. It supports real-time chat via WebSocket, collaborative wiki, assignments/grades, and role-based access (ADMINISTRADOR, PROFESOR, ALUMNO).

## Development Commands

### Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run                    # Run development server (port 8080)
./mvnw clean package                      # Build JAR
./mvnw test                               # Run tests
```

### Frontend (Next.js)
```bash
cd osiconnect
npm install                               # Install dependencies
npm run dev                               # Run development server with Turbopack (port 3000)
npm run build                             # Production build
npm run lint                              # Run ESLint
```

### Docker
```bash
docker-compose up                         # Run all services
docker-compose up -d                      # Run in detached mode
docker-compose build                      # Rebuild images
```

## Architecture

### Backend Structure (`backend/src/main/java/com/infocurso/backend/`)
- **controller/**: REST endpoints and WebSocket controllers (ChatController, ChatCursoController for real-time messaging)
- **service/**: Business logic layer
- **repository/**: JPA repositories for database access
- **entity/**: JPA entities (Usuario, Curso, Modulo, UnidadFormativa, Practica, etc.)
- **dto/**: Data transfer objects for API requests/responses
- **security/**: JWT authentication, CORS config, rate limiting (Bucket4j)
- **config/**: WebSocket config, Jackson config, static resources
- **exception/**: Global exception handling

### Frontend Structure (`osiconnect/src/`)
- **app/**: Next.js App Router pages (admin, alumno, profesor, curso, wiki, etc.)
- **components/**: React components organized by domain (alumnos, cursos, practicas, layout, ui)
- **services/**: API client services using Axios
- **lib/**: Utilities, auth helpers, types
- **hooks/**: Custom React hooks
- **schemas/**: Zod validation schemas

### Key Technologies
- **Backend**: Spring Boot 3.4, Spring Security, Spring WebSocket, JPA/Hibernate, Flyway migrations, JWT (jjwt), Bucket4j rate limiting
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI, TanStack Query, Zustand, Editor.js, FullCalendar, STOMP/SockJS

### Database
- PostgreSQL 16 with Flyway migrations in `backend/src/main/resources/db/migration/`

### Real-time Communication
- WebSocket with STOMP protocol over SockJS
- Chat per course via `/topic/chat/{cursoId}`
- Backend: WebSocketConfig.java, ChatCursoController.java
- Frontend: @stomp/stompjs + sockjs-client

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `DB_PASSWORD`: PostgreSQL password
- `JWT_SECRET`: JWT signing key (256+ bits)
- `FRONTEND_URL`: For CORS (default: http://localhost:3000)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8080/api)

## Ports
- Frontend: 3000 (dev), 3001 (Docker)
- Backend: 8080 (dev), 8081 (Docker)
- PostgreSQL: 5432

## Authentication Flow
- JWT token stored in cookie named "token"
- Frontend middleware (`middleware.ts`) protects routes: /alumno/*, /profesor/*, /admin/*
- Backend SecurityConfig.java + JwtAuthenticationFilter.java validates tokens

## API Structure
Backend REST API prefixed with `/api`:
- `/api/auth/*` - Authentication
- `/api/cursos/*` - Course management
- `/api/practicas/*` - Assignments
- `/api/chat/*` - Chat messages (REST fallback)
- `/actuator/health` - Health check endpoint

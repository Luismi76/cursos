# InfoCurso - Deployment Checklist

## Pre-Deployment
- [ ] Código commiteado y pusheado a Git
- [ ] `.env.example` creado
- [ ] `.gitignore` actualizado
- [ ] Dockerfiles creados (backend y frontend)
- [ ] `docker-compose.yml` creado
- [ ] `next.config.ts` tiene `output: 'standalone'`

## Coolify Setup
- [ ] Proyecto creado en Coolify
- [ ] Repositorio Git conectado
- [ ] Docker Compose seleccionado como tipo
- [ ] Variables de entorno configuradas
- [ ] Secrets generados (DB_PASSWORD, JWT_SECRET)

## DNS & Domains
- [ ] Dominios configurados en DNS
- [ ] Frontend domain agregado en Coolify
- [ ] Backend domain agregado en Coolify
- [ ] SSL certificates generados
- [ ] DNS propagado (verificar con nslookup)

## Deployment
- [ ] Deploy iniciado en Coolify
- [ ] Database healthy
- [ ] Backend healthy
- [ ] Frontend healthy
- [ ] Logs sin errores críticos

## Verification
- [ ] Frontend accesible vía HTTPS
- [ ] Backend API responde
- [ ] Health check OK (/actuator/health)
- [ ] Login funciona
- [ ] Chat WebSocket funciona
- [ ] CORS configurado correctamente

## Post-Deployment
- [ ] Usuario administrador creado
- [ ] Backups de DB configurados
- [ ] Monitoreo activo
- [ ] Auto-deploy configurado (opcional)
- [ ] Documentación actualizada

## Production Hardening
- [ ] Secrets rotados (no usar defaults)
- [ ] Rate limiting configurado
- [ ] Logs centralizados
- [ ] Alertas configuradas
- [ ] Plan de rollback definido

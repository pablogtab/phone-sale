# PhoneSale en Contabo

Instancia: `/opt/phone-sale`, proyecto Compose `phonesale`, dominio
`https://phonesale.mpsistemas.ar`. Comparte `axenda-network` con Nginx Proxy
Manager, como Gym. Solo el frontend pertenece a esa red; API y PostgreSQL
permanecen en una red propia, sin puertos publicados en el host.

## Configuración

Copiar `deploy/.env.example` a `.env` en el servidor y asignarle permisos 600.
Generar valores aleatorios para `DATABASE_PASSWORD` y `JWT_SECRET`. No copiar
el `.env` del desarrollo. `STORE_NAME` define el nombre inicial y luego puede
editarse en la aplicación. Las credenciales iniciales vienen de
`SEED_ADMIN_USERNAME` y `SEED_ADMIN_PASSWORD`; el seed conserva usuarios existentes.

`SEED_PROFILE=demo` carga el catálogo y las operaciones ficticias una sola vez.
La API se ejecuta en producción; únicamente el proceso separado del seed demo
usa `NODE_ENV=development`. `SEED_PROFILE=starter` carga solo la configuración y
el catálogo. No hay reset automático ni eliminación de datos en el despliegue.

## Despliegue

Las imágenes se construyen directamente en el servidor para su arquitectura.
Copiar fuentes sin `.git`, `node_modules`, archivos `.env`, uploads ni backups.
Mantener el `.env` del servidor.

```sh
cd /opt/phone-sale
bash deploy/deploy.sh TAG_DE_LA_VERSION
```

El script valida Compose, construye imágenes, respalda los datos existentes,
aplica migraciones al iniciar la API, espera healthchecks, ejecuta los seeds
idempotentes y comprueba configuración, login, catálogo, clientes y órdenes.
Solo después registra el tag en `.deployed-tag` y `.env`.

Para validar la configuración local sin secretos:

```sh
ENV_FILE=deploy/.env.example docker compose --env-file deploy/.env.example \
  -f docker-compose.prod.yml config --quiet
```

## DNS y HTTPS

Registro A `phonesale` hacia `167.86.89.240`. Proxy Host de Nginx Proxy Manager:
`phonesale.mpsistemas.ar` → `http://phonesale_frontend:80`, certificado Let's
Encrypt y Force SSL. `/api/` lo reenvía el Nginx del frontend a la API privada.

## Backups y comprobaciones

```sh
cd /opt/phone-sale
bash deploy/backup.sh
docker compose -p phonesale -f docker-compose.prod.yml exec -T api \
  node deploy-smoke.cjs https://phonesale.mpsistemas.ar
docker compose -p phonesale -f docker-compose.prod.yml ps
```

Los backups incluyen PostgreSQL en formato `pg_dump -Fc` y los uploads en
`tar.gz`, dentro de `backups/`, con permisos privados. El servidor ejecuta el
backup diario a las 06:15 (hora del servidor, Europe/Berlin) mediante `/etc/cron.d/phonesale-backup`.
Los backups no se purgan automáticamente; revisar su almacenamiento periódicamente.
No usar `down -v`. Volver a una imagen anterior no revierte migraciones ni datos;
una restauración requiere elegir el backup y verificar la compatibilidad del esquema.

## GitHub Actions, igual que Gym

El workflow `.github/workflows/verify.yml` valida tests, cobertura e integración con PostgreSQL en cada push/PR. Un push a `main` o ejecución manual sobre `main` publica `ghcr.io/pablogtab/phone-sale-api` y `ghcr.io/pablogtab/phone-sale-web` con el SHA del commit, y despliega después de pasar CI. El servidor descarga las imágenes, hace un backup antes de migrar, conserva datos y verifica la API pública.

Secrets del repositorio: `SERVER_IP` (`167.86.89.240`), `SSH_PRIVATE_KEY` (clave autorizada para `root` en Contabo), `SERVER_HOST_KEY` (entrada verificada de known_hosts). `GITHUB_TOKEN` lo provee Actions automáticamente para GHCR. No copiar contraseñas de base de datos/JWT/seed a Actions: permanecen en `/opt/phone-sale/.env`.

El deploy usa SSH en puerto 22, `/opt/phone-sale`, Compose `phonesale`, y la red `axenda-network`. `deploy.sh SHA --registry-images` requiere `IMAGE_PREFIX=ghcr.io/pablogtab/phone-sale`; el prefijo se guarda solo tras un despliegue exitoso. Sin esa opción, el script conserva la compilación local en el servidor.

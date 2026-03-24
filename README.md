# Backend - Azure Functions

Backend API construido con Azure Functions y Node.js 22.

## Estructura del Proyecto

```
back/
├── health/              # Función de health check
│   ├── function.json    # Configuración de la función
│   └── index.js         # Código de la función
├── host.json            # Configuración global de Azure Functions
├── local.settings.json  # Variables de entorno locales
└── package.json         # Dependencias del proyecto
```

## Requisitos

- Node.js 22.x o superior
- Azure Functions Core Tools v4

## Instalación

```bash
cd back
npm install
```

## Desarrollo Local

Para ejecutar las funciones localmente:

```bash
npm start
```

El servidor se iniciará en `http://localhost:7071`

## Endpoints Disponibles

### Health Check
- **URL:** `GET /api/health`
- **Descripción:** Verifica el estado del servicio
- **Respuesta:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-24T...",
  "service": "Azure Function Backend",
  "version": "1.0.0",
  "environment": "development",
  "uptime": 123.456,
  "checks": {
    "api": "ok",
    "runtime": "ok"
  }
}
```

## Despliegue en Azure

El despliegue se realiza automáticamente a través de GitHub Actions cuando se hace push a la rama principal.

El workflow `deploy-backend.yaml` se encarga de:
1. Desplegar la infraestructura (Function App, Storage, Key Vault, etc.)
2. Desplegar el código de las funciones

## Variables de Entorno

Las siguientes variables están configuradas en Azure:

- `DATABASE_CONNECTION_STRING` - Conexión a PostgreSQL
- `JWT_SECRET` - Secret para tokens JWT
- `AZURE_STORAGE_CONNECTION_STRING` - Conexión a Azure Storage
- `NODE_ENV` - Ambiente de ejecución

## Testing

Para probar el endpoint de health localmente:

```bash
curl http://localhost:7071/api/health
```

En Azure:

```bash
curl https://<your-function-app>.azurewebsites.net/api/health
```

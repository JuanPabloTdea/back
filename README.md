# Backend - FileManager API

Backend API construido con Azure Functions v4, Prisma ORM, PostgreSQL y Azure Blob Storage.

## 📋 Características

- ✅ **Autenticación JWT** - Registro, login y gestión de sesiones
- ✅ **Gestión de Archivos** - Upload, download, list y delete
- ✅ **Azure Blob Storage** - Almacenamiento escalable de archivos
- ✅ **PostgreSQL** - Base de datos relacional con Prisma ORM
- ✅ **Migraciones HTTP** - Endpoints para ejecutar migraciones sin SSH
- ✅ **Validaciones** - Joi para validación de inputs
- ✅ **Seguridad** - Bcrypt para passwords, ownership verification

## 🏗️ Arquitectura

```
back/
├── prisma/
│   └── schema.prisma              # Schema de base de datos
├── src/
│   ├── app.js                     # Entry point
│   ├── config/                    # Configuraciones
│   │   ├── database.js            # Prisma client
│   │   ├── storage.js             # Azure Blob client
│   │   └── constants.js           # Constantes (tamaño max, etc.)
│   ├── middleware/
│   │   ├── auth.js                # Verificación JWT
│   │   ├── validators.js          # Validaciones Joi
│   │   └── error-handler.js       # Manejo de errores
│   ├── utils/
│   │   ├── jwt.js                 # Generación/verificación tokens
│   │   ├── password.js            # Hash/compare passwords
│   │   └── response.js            # Respuestas estandarizadas
│   ├── services/
│   │   ├── auth.service.js        # Lógica de autenticación
│   │   ├── user.service.js        # CRUD usuarios
│   │   ├── file.service.js        # CRUD archivos
│   │   └── storage.service.js     # Operaciones Azure Blob
│   └── functions/
│       ├── health.js              # Health check
│       ├── migrations/            # Gestión de DB
│       │   ├── run.js
│       │   ├── status.js
│       │   └── create.js
│       ├── auth/                  # Autenticación
│       │   ├── register.js
│       │   ├── login.js
│       │   └── profile.js
│       └── files/                 # Gestión de archivos
│           ├── upload.js
│           ├── upload-multiple.js
│           ├── list.js
│           ├── stats.js
│           ├── get-by-id.js
│           ├── download.js
│           └── delete.js
```

## 🚀 Inicio Rápido

### Requisitos

- Node.js 20.x o superior
- Azure Functions Core Tools v4
- PostgreSQL (local o Azure)
- Azure Storage Account

### 1. Instalación

```bash
cd back
npm install
```

### 2. Configuración

Copia `.env.example` y configura las variables:

```bash
cp .env.example local.settings.json
```

Actualiza los valores en `local.settings.json`:

```json
{
  "Values": {
    "DATABASE_CONNECTION_STRING": "postgresql://user:password@localhost:5432/filemanager",
    "JWT_SECRET": "your-super-secret-jwt-key",
    "MIGRATION_SECRET": "your-migration-secret-key",
    "AZURE_STORAGE_CONNECTION_STRING": "DefaultEndpointsProtocol=https;...",
    "AZURE_STORAGE_CONTAINER_NAME": "files",
    "PRISMA_CLIENT_ENGINE_TYPE": "binary",
    "PRISMA_CLI_QUERY_ENGINE_TYPE": "binary"
  }
}
```

### 3. Migraciones de Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Crear y aplicar migraciones
npx prisma migrate dev --name init
```

### 4. Desarrollo Local

```bash
npm start
```

La API estará disponible en `http://localhost:7071`

## 📚 API Endpoints

### System

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Health check | No |

### Migraciones

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/migrations/status` | Estado de migraciones | No |
| POST | `/api/migrations/run` | Ejecutar migraciones | Secret |
| POST | `/api/migrations/create` | Crear migración (dev) | Secret |

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/profile` | Obtener perfil | JWT |

### Archivos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/files/upload` | Subir archivo | JWT |
| POST | `/api/files/upload-multiple` | Subir múltiples | JWT |
| GET | `/api/files` | Listar archivos | JWT |
| GET | `/api/files/stats` | Estadísticas | JWT |
| GET | `/api/files/:id` | Obtener archivo | JWT |
| GET | `/api/files/:id/download` | Descargar archivo | JWT |
| DELETE | `/api/files/:id` | Eliminar archivo | JWT |

## 🧪 Testing

### Health Check

```bash
curl http://localhost:7071/api/health
```

### Registro de Usuario

```bash
curl -X POST http://localhost:7071/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:7071/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Upload de Archivo

```bash
TOKEN="<tu-jwt-token>"

curl -X POST http://localhost:7071/api/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.pdf"
```

### Listar Archivos

```bash
curl http://localhost:7071/api/files \
  -H "Authorization: Bearer $TOKEN"
```

## 🚢 Despliegue a Azure

### Opción 1: Script Automático (Recomendado)

```bash
./deploy.sh
```

### Opción 2: Manual con Azure CLI

```bash
# Generar Prisma Client
npx prisma generate

# Crear paquete
zip -r deploy.zip . -x "node_modules/*" -x ".git/*"

# Desplegar
az functionapp deployment source config-zip \
  --name func-iajxc4x24u3aw \
  --resource-group <tu-resource-group> \
  --src deploy.zip
```

### Configurar Variables de Entorno en Azure

**IMPORTANTE:** Antes del primer despliegue, configura estas variables en Azure Portal:

```bash
# Via Azure CLI
az functionapp config appsettings set \
  --name func-iajxc4x24u3aw \
  --resource-group <tu-resource-group> \
  --settings \
    DATABASE_CONNECTION_STRING="postgresql://..." \
    JWT_SECRET="..." \
    MIGRATION_SECRET="..." \
    AZURE_STORAGE_CONNECTION_STRING="..." \
    AZURE_STORAGE_CONTAINER_NAME="files" \
    PRISMA_CLIENT_ENGINE_TYPE="binary" \
    PRISMA_CLI_QUERY_ENGINE_TYPE="binary" \
    NODE_ENV="production"
```

Ver detalles completos en [AZURE_SETUP.md](./AZURE_SETUP.md)

### Ejecutar Migraciones en Azure

```bash
curl -X POST https://func-iajxc4x24u3aw.azurewebsites.net/api/migrations/run \
  -H "x-migration-secret: <tu-migration-secret>"
```

## 🔒 Seguridad

- **Passwords:** Hasheados con bcrypt (10 salt rounds)
- **JWT:** Tokens con expiración de 7 días
- **File Upload:** Validación de tamaño (max 10MB) y tipos MIME
- **Ownership:** Verificación en todas las operaciones de archivos
- **Sanitización:** Nombres de archivos sanitizados automáticamente

## 📖 Documentación Adicional

- [MIGRATIONS.md](./MIGRATIONS.md) - Guía de migraciones de base de datos
- [AZURE_SETUP.md](./AZURE_SETUP.md) - Configuración detallada de Azure
- [.env.example](./.env.example) - Plantilla de variables de entorno

## 🐛 Troubleshooting

### Error: "Prisma engine not supported for 32bit Node"

✅ **Solución:** Ya está configurado el motor binario. Asegúrate de tener las variables:
```
PRISMA_CLIENT_ENGINE_TYPE=binary
PRISMA_CLI_QUERY_ENGINE_TYPE=binary
```

### Error: "Cannot find module @prisma/client"

```bash
npx prisma generate
```

### Error: "Database connection failed"

Verifica el string de conexión en `local.settings.json` o en Azure Portal.

## 📝 Licencia

MIT

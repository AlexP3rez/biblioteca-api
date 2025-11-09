# API Backend - Sistema de Gestión de Biblioteca Digital

API REST desarrollada con Node.js, Express y MySQL siguiendo arquitectura MVC.

## 📋 Descripción

Sistema de gestión de biblioteca digital que permite administrar usuarios, libros, préstamos y multas a través de una API REST con autenticación mediante tokens JWT.

## 🏗️ Arquitectura

- **Patrón:** MVC (Modelo-Vista-Controlador)
- **Backend:** Node.js + Express
- **Base de Datos:** MySQL
- **ORM:** Sequelize
- **Autenticación:** JWT (JSON Web Tokens)

## 🚀 Tecnologías Utilizadas

- Node.js v14+
- Express.js
- MySQL 8.0+
- Sequelize ORM
- JWT (jsonwebtoken)
- Bcrypt.js
- Dotenv
- CORS

## 📦 Instalación

### Prerequisitos

- Node.js instalado (v14 o superior)
- MySQL instalado y corriendo
- Git instalado

### Pasos de instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/TU_USUARIO/biblioteca-api.git
cd biblioteca-api
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:

Crear archivo `.env` en la raíz del proyecto:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=biblioteca_db
DB_USER=root
DB_PASSWORD=

JWT_SECRET=tu_clave_super_secreta
JWT_EXPIRES_IN=24h
```

4. Crear la base de datos:

Ejecutar el script SQL proporcionado en DBeaver o MySQL Workbench.

5. Iniciar el servidor:
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## 📚 Estructura del Proyecto
```
biblioteca-api/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de base de datos
│   ├── controllers/
│   │   ├── authController.js    # Controlador de autenticación
│   │   ├── usuarioController.js # Controlador de usuarios
│   │   ├── libroController.js   # Controlador de libros
│   │   └── prestamoController.js # Controlador de préstamos
│   ├── models/
│   │   ├── Usuario.js           # Modelo de Usuario
│   │   ├── Libro.js             # Modelo de Libro
│   │   ├── Prestamo.js          # Modelo de Préstamo
│   │   └── index.js             # Relaciones de modelos
│   ├── routes/
│   │   ├── authRoutes.js        # Rutas de autenticación
│   │   ├── usuarioRoutes.js     # Rutas de usuarios
│   │   ├── libroRoutes.js       # Rutas de libros
│   │   ├── prestamoRoutes.js    # Rutas de préstamos
│   │   └── index.js             # Consolidación de rutas
│   ├── middlewares/
│   │   ├── auth.js              # Middleware de autenticación
│   │   └── errorHandler.js      # Manejo de errores
│   └── utils/
│       └── jwt.js               # Utilidades JWT
├── .env                         # Variables de entorno
├── .gitignore                   # Archivos ignorados por git
├── package.json                 # Dependencias del proyecto
├── server.js                    # Punto de entrada
└── README.md                    # Este archivo
```

## 🔌 Endpoints de la API

### Autenticación
```
POST   /api/auth/registro        # Registrar nuevo usuario
POST   /api/auth/login           # Iniciar sesión
GET    /api/auth/perfil          # Obtener perfil (requiere token)
PUT    /api/auth/perfil          # Actualizar perfil (requiere token)
```

### Usuarios (Solo Administradores)
```
GET    /api/usuarios             # Listar usuarios
GET    /api/usuarios/:id         # Obtener usuario por ID
PUT    /api/usuarios/:id         # Actualizar usuario
DELETE /api/usuarios/:id         # Eliminar usuario
```

### Libros
```
GET    /api/libros               # Listar libros (público)
GET    /api/libros/:id           # Obtener libro por ID (público)
POST   /api/libros               # Crear libro (admin)
PUT    /api/libros/:id           # Actualizar libro (admin)
DELETE /api/libros/:id           # Eliminar libro (admin)
```

### Préstamos
```
GET    /api/prestamos/mis-prestamos    # Mis préstamos (requiere token)
POST   /api/prestamos                  # Crear préstamo (requiere token)
PUT    /api/prestamos/:id/renovar      # Renovar préstamo (requiere token)
GET    /api/prestamos                  # Listar todos (admin)
PUT    /api/prestamos/:id/devolver     # Devolver libro (admin)
```

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación.

### Formato del Token

Incluir en el header de las peticiones:
```
Authorization: Bearer <tu_token_jwt>
```

### Ejemplo de uso con Postman/Thunder

1. Registrar usuario o hacer login
2. Copiar el token de la respuesta
3. En las peticiones protegidas, agregar el header:
   - Key: `Authorization`
   - Value: `Bearer tu_token_aqui`

## 📝 Ejemplos de Peticiones

### Registro de Usuario
```json
POST /api/auth/registro

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "tipo_usuario": "estudiante"
}
```

### Login
```json
POST /api/auth/login

{
  "email": "juan@example.com",
  "password": "password123"
}
```

### Crear Libro (requiere token de admin)
```json
POST /api/libros

{
  "isbn": "978-3-16-148410-0",
  "titulo": "Cien años de soledad",
  "descripcion": "Obra maestra de Gabriel García Márquez",
  "año_publicacion": 1967,
  "idioma": "Español",
  "cantidad_total": 5
}
```

### Crear Préstamo (requiere token)
```json
POST /api/prestamos

{
  "libro_id": 1,
  "fecha_devolucion_esperada": "2025-11-25"
}
```

## 🗄️ Base de Datos

El sistema utiliza MySQL con 16 tablas principales:

- usuarios
- roles
- usuarios_roles
- categorias
- autores
- editoriales
- libros
- libros_autores
- prestamos
- reservas
- multas
- resenas
- notificaciones
- historial_acciones
- configuraciones
- sesiones

## 👥 Roles de Usuario

- **Estudiante:** Puede consultar libros y solicitar préstamos
- **Profesor:** Puede consultar libros y solicitar préstamos
- **Administrador:** Acceso completo al sistema

## ⚙️ Configuración para Producción

### Variables de Entorno

Actualizar `.env` para producción:
```env
NODE_ENV=production
PORT=80
DB_HOST=tu-rds-endpoint.amazonaws.com
DB_NAME=biblioteca_db
DB_USER=admin
DB_PASSWORD=password_seguro
JWT_SECRET=clave_super_secreta_produccion
```

## 🚢 Deploy en AWS

### Usando Elastic Beanstalk

1. Instalar AWS CLI y EB CLI
2. Configurar credenciales AWS
3. Inicializar aplicación:
```bash
eb init
```
4. Crear ambiente y desplegar:
```bash
eb create biblioteca-api-prod
eb deploy
```

## 📖 Documentación Adicional

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)

## 👨‍💻 Autor

**Tu Nombre**
- Universidad Mesoamericana
- Ingeniería de Sistemas
- Arquitectura de Sistemas I

## 📄 Licencia

Este proyecto es parte de un trabajo académico para la Universidad Mesoamericana.

## 🐛 Reportar Problemas

Si encuentras algún problema, por favor crea un issue en el repositorio.

---

**Fecha de entrega:** [Agregar fecha]
**Profesor:** Ing. Arturo Monterroso
```

---

### PASO 2: Crear archivo .gitignore

Ya lo tienes, pero verifica que contenga esto:

**Archivo: `.gitignore`**
```
# Dependencies
node_modules/
package-lock.json

# Environment variables
.env
.env.local
.env.production

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS Files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
coverage/
.nyc_output/

# Build
dist/
build/

# Temporary files
tmp/
temp/
*.tmp

# AWS
.elasticbeanstalk/
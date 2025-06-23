# LicenSys

LicenSys es un sistema web para la gestión remota y centralizada de los documentos necesarios para tramitar licencias de conducir en Chile. Este proyecto está orientado a apoyar la digitalización de procesos en los departamentos de licencias municipales.

## Tecnologías utilizadas

### Frontend
- HTML/CSS/JavaScript
- Vue 3
- Bootstrap
- Tabulator

### Backend
- Node.js + Express
- Prisma ORM
- MySQL / MySQL Server
- Next.js

### Entorno de desarrollo
- Sistema operativo: Linux Debian 12

---

## Instalación y ejecución del proyecto

### 1. Clonar repositorio

```bash
git clone https://github.com/daniel2025-code/licensys.git
cd licensys
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar la base de datos
Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido, adaptando los valores según tu configuración local:
```env
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/licensys"
```

### 4. Ejecutar migraciones
```bash
npx prisma migrate dev --name init
```

### 5. Agregar usuarios de prueba
```bash
npx prisma db seed
```

### 6. Iniciar el servidor en desarrollo
```bash
node src/index.js
```

## Acceso
Una vez iniciado el servidor, accede a:
```bash
http://localhost:3000
```
Desde allí puedes comenzar a utilizar el sistema de gestión de documentos.

## Licencia
Este proyecto es parte de un trabajo semestral académico. Su uso está destinado exclusivamente con fines educativos.

## Desarrollado por
Daniel Aravena


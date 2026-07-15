# 🚀 Guía para levantar Libreria Store en tu PC (con Docker)

Guía paso a paso para correr **todo el proyecto** (frontend + los microservicios + base de datos)
en tu computadora usando Docker. No necesitas instalar Java, Node ni PostgreSQL: Docker se encarga de todo.

---

## ✅ Antes de empezar

1. **Docker Desktop instalado y ABIERTO.**
   - Windows/Mac: abre **Docker Desktop** y espera a que el ícono de la ballena 🐳 (abajo a la derecha)
     deje de moverse y diga **"Running"**. Si no está corriendo, nada funcionará.
   - En Windows normalmente pide activar **WSL 2**; si te lo pide, acepta.
2. **Memoria RAM:** el proyecto levanta ~10 contenedores (8 servicios Java + base de datos).
   Necesitas **6–8 GB de RAM libres**. Cierra programas pesados (Chrome con muchas pestañas, etc.).
3. **Espacio en disco:** deja ~5 GB libres (Docker descarga imágenes la primera vez).
4. **Que estos puertos estén libres:** 3000, 8080, 8761, 8888, 5432, 8091–8095, 8501.

---

## 📦 Paso 1 — Descomprimir el proyecto

1. Descarga el archivo **`Libreria-Store.zip`**.
2. Haz clic derecho → **Extraer todo** (o usa WinRAR/7-Zip).
3. Te quedará una carpeta llamada **`Microservicios-master`**. Recuérdala, la usaremos ahora.

---

## 💻 Paso 2 — Abrir una terminal DENTRO de esa carpeta

**En Windows (lo más fácil):**
1. Abre la carpeta `Microservicios-master` en el Explorador de archivos.
2. Haz clic en la **barra de dirección** (donde dice la ruta), bórrala, escribe **`powershell`** y presiona **Enter**.
3. Se abre una ventana negra/azul ya ubicada en la carpeta. 👍

**En Mac:** abre **Terminal**, escribe `cd ` (con espacio) y **arrastra la carpeta** a la terminal, luego Enter.

> Para saber si estás en el lugar correcto, escribe `dir` (Windows) o `ls` (Mac) y Enter:
> debes ver archivos como `docker-compose.yml`, `libreria-frontend`, `microservices`.

---

## ⚙️ Paso 3 — Revisar el archivo `.env`

El proyecto ya incluye un archivo **`.env`** con la configuración lista (clave JWT, usuario de BD, etc.).
**No tienes que hacer nada.** Si por algún motivo no existe, créalo copiando el ejemplo:

- Windows (PowerShell): `Copy-Item .env.example .env`
- Mac: `cp .env.example .env`

---

## 🐳 Paso 4 — Levantar todo con un comando

En la terminal (dentro de la carpeta), escribe:

```bash
docker compose up --build -d
```

- `--build` = construye las aplicaciones.
- `-d` = las deja corriendo en segundo plano.

⏳ **La PRIMERA vez tarda bastante (5 a 15 minutos):** Docker descarga imágenes y compila los 8 servicios Java.
Es normal ver mucho texto. Ve por un café ☕. **Las siguientes veces será mucho más rápido.**

> Si el comando `docker compose` te da error, prueba con guion: `docker-compose up --build -d`

---

## ⏱️ Paso 5 — Esperar a que los servicios estén listos

Los servicios Java tardan ~1–2 minutos extra en "encender" después de construirse. Para ver el estado:

```bash
docker compose ps
```

Espera hasta que la mayoría diga **`healthy`** o **`running`** (especialmente `api-gateway` y `frontend`).

Para ver los registros en vivo (opcional, útil si algo falla):

```bash
docker compose logs -f
```
(sal con **Ctrl + C**; eso solo cierra el visor de logs, **no apaga** los contenedores).

---

## 🌐 Paso 6 — Abrir la tienda

Abre tu navegador en:

### 👉 http://localhost:3000

Deberías ver el **landing de Libreria Store** con el catálogo lleno de libros
(los libros ya vienen cargados automáticamente).

---

## 🔑 Paso 7 — Entrar como administrador

El proyecto crea usuarios de prueba automáticamente. Para entrar al **panel de administración**:

- **Correo:** `jorge.s@example.com`
- **Contraseña:** `Test@123456`

Inicia sesión y verás el enlace **"Admin"** en la barra superior (gestión de productos, inventario, pedidos y usuarios).

> ¿No aparece el admin? Asegúrate de que en `docker-compose.yml`, dentro de `user-microservice`,
> esté la línea `SPRING_PROFILES_ACTIVE=dev` (ya viene incluida). Si la agregaste después,
> reinicia ese servicio: `docker compose up -d --force-recreate user-microservice`.

---

## 🛠️ Comandos útiles

| Quiero… | Comando |
|---|---|
| Ver estado de los contenedores | `docker compose ps` |
| Ver logs de un servicio | `docker compose logs -f api-gateway` |
| **Apagar** todo (sin borrar datos) | `docker compose stop` |
| Volver a **encender** | `docker compose start` |
| Apagar y **eliminar** contenedores | `docker compose down` |
| Borrar TODO **incluyendo la base de datos** (empezar de cero) | `docker compose down -v` |
| Reconstruir tras cambios | `docker compose up --build -d` |

---

## 🆘 Si algo falla

- **"port is already allocated" / puerto ocupado:** ya tienes algo usando ese puerto (ej. otro proyecto).
  Ciérralo, o cambia el puerto en `docker-compose.yml`.
- **Un contenedor se reinicia solo / "unhealthy":** casi siempre es **falta de RAM**.
  Cierra programas o sube la memoria asignada a Docker (Docker Desktop → Settings → Resources).
- **La página carga pero sale "No se encontraron libros":** los servicios Java aún están arrancando.
  Espera 1–2 min y recarga. Verifica con `docker compose ps`.
- **Docker dice que no está corriendo:** abre **Docker Desktop** y espera a que diga "Running".
- **Empezar de cero:** `docker compose down -v` y luego `docker compose up --build -d`.

---

## 📌 Resumen ultra rápido

```bash
# 1. Abre Docker Desktop (espera a "Running")
# 2. Abre PowerShell dentro de la carpeta Microservicios-master
docker compose up --build -d      # (espera 5-15 min la 1ª vez)
docker compose ps                 # espera a que estén "healthy"
# 3. Abre http://localhost:3000
# 4. Admin:  / 
```

¡Listo! 🎉

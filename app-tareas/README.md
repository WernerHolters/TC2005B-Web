# Tablita de Tareas — **Todo en un solo archivo**
Proyecto didáctico para enseñar a leer y escribir en **una base de datos real (PostgreSQL)** desde JavaScript del lado del cliente (**Vanilla JS**) pasando por una **API en Node/Express**.  
Aquí viene **todo**: qué es, cómo levantarlo, para qué sirve cada archivo y **el código completo** listo para copiar/pegar.

---

## ¿Qué construyes?
- **Usuarios** (crear y listar)
- **Tareas** con estados: `sin_iniciar` → `en_curso` → `terminada`
- **Asignación** de tareas a usuarios
- **Búsqueda por texto** (título/descr.)
- **Paginación** (page + pageSize)
- **CRUD completo**: crear, listar (con filtros), actualizar (estado/asignado), **eliminar**

Arquitectura simple y realista:

```
[Browser: HTML + CSS + Vanilla JS]
            │
            ▼ (fetch)
[Node.js + Express API]  ←→  [PostgreSQL]
```

El **frontend** NO habla directo con la BD: usa HTTP a la API.  
La **API** consulta Postgres y responde JSON.

---

## Requisitos
- **Node.js 18+**
- **PostgreSQL** local (o Docker)
- Cualquier servidor estático para servir `public/` (p. ej. `npx http-server` o Live Server de tu editor)

---

## Cómo levantar el proyecto — paso a paso

### 1) Base de datos
**Opción A: Postgres local**  
Crea una base `appdb` (o ajusta la URL luego en `.env`).

**Opción B: Docker (recomendado si no tienes Postgres):**
```bash
cd server
docker compose up -d
```
Esto levanta Postgres 16 en `localhost:5432`, usuario `postgres`, password `postgres`, BD `appdb`.

### 2) Backend (API)
```bash
cd server
# Crea el archivo .env con tu cadena de conexión y puerto (ver más abajo)
npm i
npm run dev
```
Verifica en el navegador o con curl:
- `http://localhost:3001/health` → `{ ok: true, ... }`
- `http://localhost:3001/db/now` → `{ ok: true, now: ... }` (hora desde la BD)

> La primera vez, la API **crea tablas** y **seed de ejemplo** automáticamente.

### 3) Frontend (estático)
Sirve la carpeta `public/` como sitio estático:
```bash
# desde la raíz del repo (o dentro de public/)
npx http-server ./public -p 5500
# Abre: http://localhost:5500
```
> Si usas Live Server de VSCode, abre `public/index.html` y dale “Go Live”.

---

## ¿Para qué sirve cada archivo?
- **server/index.js**: API Express (endpoints, conexión Postgres, creación de tablas y seed, validaciones).
- **server/.env**: credenciales/puerto. (Ejemplo de contenido abajo).
- **server/package.json**: scripts (`dev`, `start`) y dependencias del backend.
- **server/docker-compose.yml** *(opcional)*: levanta Postgres 16 con Docker.
- **public/index.html**: HTML base que carga `app.js`.
- **public/app.js**: frontend Vanilla JS (UI, fetch a la API, búsqueda, filtros, paginación, CRUD).

---

## API (resumen)
- `GET /health` → ping servicio.
- `GET /db/now` → hora desde Postgres (prueba de conexión real).
- `GET /users` → lista usuarios.
- `POST /users` → crea usuario `{ name }`.
- `GET /tasks` → lista con **búsqueda** (`q`), **filtros** (`status`, `assignee_id`) y **paginación** (`page`, `pageSize`). Respuesta: `{ items, total, page, pageSize }`.
- `POST /tasks` → crea tarea `{ title, description?, status?, assignee_id? }`.
- `PATCH /tasks/:id` → actualiza parcial `{ title?, description?, status?, assignee_id? }`.
- `DELETE /tasks/:id` → elimina tarea.

Estados válidos: `sin_iniciar | en_curso | terminada`.

---

## Código completo (copia y pega tal cual)

> Crea carpetas `server/` y `public/` y pega estos archivos adentro, con **exactos nombres y rutas**.

### `server/package.json`
```json
{
  "name": "tasks-api-express",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "pg": "^8.12.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

### `server/.env`
> Ajusta a tu entorno si no usas Docker/local por defecto.
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/appdb
PORT=3001
```

### `server/docker-compose.yml` (opcional)
```yaml
services:
  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

### `server/index.js`
```js
// Tasks API: Node + Express + Postgres
// NOTE: All comments in English.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// ---- DB POOL ----
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false } // enable if your Postgres requires SSL
});

// ---- SCHEMA BOOTSTRAP (idempotent) ----
async function ensureTables() {
  const sql = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'sin_iniciar'
      CHECK (status IN ('sin_iniciar','en_curso','terminada')),
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );
  `;
  await pool.query(sql);

  // Seed users if empty
  await pool.query(`
    INSERT INTO users (name)
    SELECT x.name FROM (VALUES ('Panda'), ('Alex'), ('Paty')) AS x(name)
    WHERE NOT EXISTS (SELECT 1 FROM users);
  `);

  // Seed tasks if empty
  await pool.query(`
    INSERT INTO tasks (title, description, status, assignee_id)
    SELECT * FROM (VALUES
      ('Preparar tablero', 'Crear columnas y filtros', 'sin_iniciar', NULL),
      ('Diseño UI', 'Botones de estado y badges de usuario', 'en_curso', 1),
      ('Revisión final', 'Checklist antes de demo', 'terminada', 2)
    ) AS seed(title, description, status, assignee_id)
    WHERE NOT EXISTS (SELECT 1 FROM tasks);
  `);
}

function isValidStatus(s) {
  return ['sin_iniciar', 'en_curso', 'terminada'].includes(s);
}

// ---- HEALTH ----
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'tasks-api', time: new Date().toISOString() });
});

app.get('/db/now', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW() AS now');
    res.json({ ok: true, now: rows[0].now });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'DB error' });
  }
});

// ---- USERS ----
app.get('/users', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name FROM users ORDER BY name ASC'
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to fetch users' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ ok: false, error: 'Name is required' });
    const { rows } = await pool.query(
      'INSERT INTO users (name) VALUES ($1) RETURNING id, name',
      [name]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to create user' });
  }
});

// ---- TASKS (with text search + server-side pagination) ----
// Query params supported:
// - q: text search (ILIKE) on title/description
// - status: 'sin_iniciar' | 'en_curso' | 'terminada'
// - assignee_id: integer
// - page: 1-based number (default 1)
// - pageSize: items per page (default 10)
app.get('/tasks', async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status : '';
    const assigneeParam = req.query.assignee_id;
    const page = Math.max(parseInt(req.query.page ?? '1', 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize ?? '10', 10) || 10, 1), 100);

    // Build dynamic WHERE
    const filters = [];
    const params = [];
    let i = 1;

    if (q) {
      filters.push(`(t.title ILIKE $${i} OR t.description ILIKE $${i})`);
      params.push(`%${q}%`);
      i++;
    }
    if (status && isValidStatus(status)) {
      filters.push(`t.status = $${i}`);
      params.push(status);
      i++;
    }
    if (assigneeParam !== undefined && assigneeParam !== '') {
      const aid = Number(assigneeParam);
      if (!Number.isInteger(aid)) return res.status(400).json({ ok: false, error: 'Invalid assignee_id' });
      filters.push(`t.assignee_id = $${i}`);
      params.push(aid);
      i++;
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    // Count (for pagination)
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM tasks t ${where}`,
      params
    );
    const total = countRows[0].total;

    // Fetch page
    const offset = (page - 1) * pageSize;
    const { rows: items } = await pool.query(
      `
      SELECT t.id, t.title, t.description, t.status, t.assignee_id,
             u.name AS assignee_name, t.created_at, t.updated_at
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assignee_id
      ${where}
      ORDER BY t.created_at DESC
      LIMIT $${i} OFFSET $${i + 1}
      `,
      [...params, pageSize, offset]
    );

    res.json({ items, total, page, pageSize });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to fetch tasks' });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const title = String(req.body?.title || '').trim();
    const description = String(req.body?.description || '').trim();
    const assignee_id = req.body?.assignee_id ?? null;
    const status = req.body?.status ? String(req.body.status) : 'sin_iniciar';

    if (!title) return res.status(400).json({ ok: false, error: 'Title is required' });
    if (!isValidStatus(status)) return res.status(400).json({ ok: false, error: 'Invalid status' });

    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, status, assignee_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, status, assignee_id, created_at, updated_at`,
      [title, description, status, assignee_id]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to create task' });
  }
});

app.patch('/tasks/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: 'Invalid id' });

    const fields = [];
    const values = [];
    let i = 1;

    if (typeof req.body.title === 'string') {
      fields.push(`title = $${i++}`);
      values.push(req.body.title.trim());
    }
    if (typeof req.body.description === 'string') {
      fields.push(`description = $${i++}`);
      values.push(req.body.description.trim());
    }
    if (typeof req.body.status === 'string') {
      if (!isValidStatus(req.body.status)) return res.status(400).json({ ok: false, error: 'Invalid status' });
      fields.push(`status = $${i++}`);
      values.push(req.body.status);
    }
    if (req.body.hasOwnProperty('assignee_id')) {
      fields.push(`assignee_id = $${i++}`);
      values.push(req.body.assignee_id);
    }

    if (fields.length === 0) return res.status(400).json({ ok: false, error: 'No fields to update' });
    fields.push(`updated_at = NOW()`);

    const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
    values.push(id);

    const { rows } = await pool.query(sql, values);
    if (rows.length === 0) return res.status(404).json({ ok: false, error: 'Task not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to update task' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: 'Invalid id' });
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ ok: false, error: 'Task not found' });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to delete task' });
  }
});

// ---- STARTUP ----
const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, async () => {
  try {
    await ensureTables();
    console.log(`[api] http://localhost:${PORT}`);
  } catch (e) {
    console.error('Failed to ensure tables:', e);
    process.exit(1);
  }
});

// ---- GRACEFUL SHUTDOWN ----
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});
```

### `public/index.html`
```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tablita de Tareas — Vanilla JS + Express + Postgres</title>
  <meta name="description" content="Demo para consultar y guardar tareas con estados y asignación." />
</head>
<body>
  <noscript>Activa JavaScript para usar esta app.</noscript>
  <div id="app"></div>
  <script src="./app.js" defer></script>
</body>
</html>
```

### `public/app.js`
```js
// Tasks Frontend (Vanilla JS) — talks to Node/Express API
// All comments in English (per your rule).
(() => {
  const API_BASE = 'http://localhost:3001'; // change if your API runs elsewhere
  const STATUSES = ['sin_iniciar', 'en_curso', 'terminada'];

  // ---------- HTTP helpers ----------
  async function http(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      let msg = `${res.status} ${res.statusText}`;
      try {
        const body = await res.json();
        msg = body?.error || msg;
      } catch (_) {}
      throw new Error(msg);
    }
    const txt = await res.text();
    return txt ? JSON.parse(txt) : null;
  }
  const get = (p) => http(p);
  const post = (p, body) => http(p, { method: 'POST', body: JSON.stringify(body) });
  const patch = (p, body) => http(p, { method: 'PATCH', body: JSON.stringify(body) });
  const del = (p) => http(p, { method: 'DELETE' });

  // ---------- DOM helpers ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined) node.setAttribute(k, v);
    });
    for (const child of children) {
      if (child == null) continue;
      node.appendChild(child.nodeType ? child : document.createTextNode(String(child)));
    }
    return node;
  }

  // ---------- State ----------
  let USERS = [];
  let TASKS = [];
  let PAGE = 1;
  let PAGE_SIZE = 10;
  let TOTAL = 0;

  // ---------- UI Builders ----------
  function buildLayout(root) {
    const container = el('div', { class: 'container' },
      el('h1', {}, 'Tablita de Tareas'),
      el('div', { class: 'grid' },
        el('section', { class: 'panel' },
          el('h2', {}, 'Nueva tarea'),
          buildCreateForm()
        ),
        el('section', { class: 'panel' },
          el('h2', {}, 'Filtros'),
          buildFilters()
        )
      ),
      el('section', { class: 'panel' },
        el('h2', {}, 'Usuarios'),
        buildUserForm(),
        el('div', { id: 'users-root' })
      ),
      el('section', { class: 'panel' },
        el('h2', {}, 'Listado de tareas'),
        el('div', { id: 'tasks-root' })
      )
    );
    root.appendChild(styleTag());
    root.appendChild(container);
  }

  function styleTag() {
    return el('style', {}, `
      :root { --bg:#0b0f1a; --panel:#101425; --txt:#e8ecff; --muted:#9aa3c7; --ok:#19c37d; --warn:#f5a524; --err:#ef4444; }
      *{box-sizing:border-box} body{margin:0;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:var(--bg);color:var(--txt)}
      .container{max-width:1100px;margin:32px auto;padding:0 16px}
      h1{font-size:28px;margin:0 0 16px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
      .panel{background:var(--panel);border-radius:14px;padding:16px;box-shadow:0 8px 24px rgba(0,0,0,.25)}
      .row{display:flex;gap:8px;align-items:center;margin-bottom:8px}
      input, select, textarea, button{background:#0d1222;border:1px solid #1a2140;color:var(--txt);padding:8px 10px;border-radius:10px}
      textarea{min-height:72px;resize:vertical}
      button{cursor:pointer}
      button.primary{background:#1a2140;border-color:#293062}
      button.success{background:#163225;border-color:#225d45}
      button.warn{background:#352c10;border-color:#5f4e1a}
      button:disabled{opacity:.6;cursor:not-allowed}
      table{width:100%;border-collapse:separate;border-spacing:0 8px}
      thead th{font-weight:600;color:var(--muted);text-align:left;padding:0 8px 8px}
      tbody tr{background:#0d1222}
      tbody td{padding:12px 8px;vertical-align:top}
      .badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;border:1px solid #2a325f;color:#cbd5ff}
      .status-sin_iniciar{border-color:#4b5563;color:#d1d5db}
      .status-en_curso{border-color:#f59e0b;color:#fbbf24}
      .status-terminada{border-color:#10b981;color:#34d399}
      .actions{display:flex;gap:8px;flex-wrap:wrap}
      .muted{color:var(--muted)}
      .sr-only{position:absolute;width:1px;height:1px;margin:-1px;clip:rect(0,0,0,0);overflow:hidden}
      .chips{display:flex;gap:8px;flex-wrap:wrap}
      .chip{background:#0d1222;border:1px solid #1a2140;border-radius:999px;padding:6px 10px}
      .pagination{display:flex;gap:8px;align-items:center;justify-content:flex-end;margin-top:10px}
    `);
  }

  // ---------- Users UI ----------
  function buildUserForm() {
    const name = el('input', { type: 'text', placeholder: 'Nombre de usuario *', required: true });
    const btn = el('button', { class: 'primary', type: 'button', onClick: onCreateUser }, 'Crear usuario');

    async function onCreateUser() {
      btn.disabled = true;
      try {
        const payload = { name: name.value.trim() };
        if (!payload.name) { alert('Name is required'); return; }
        await post('/users', payload);
        name.value = '';
        await reloadUsers();
        await reloadTasks(); // refresh selects and list
      } catch (e) {
        console.error(e);
        alert(`Create user failed: ${e.message}`);
      } finally {
        btn.disabled = false;
      }
    }

    return el('form', { class: 'form', onSubmit: (e) => e.preventDefault() },
      el('div', { class: 'row' }, name, btn),
      el('p', { class: 'muted' }, 'Los usuarios aparecen en los selects de asignación.')
    );
  }

  function renderUsers(list) {
    const host = $('#users-root');
    host.innerHTML = '';
    if (!list.length) {
      host.appendChild(el('p', { class: 'muted' }, 'Sin usuarios aún.'));
      return;
    }
    const wrap = el('div', { class: 'chips' });
    list.forEach(u => wrap.appendChild(el('span', { class: 'chip' }, `${u.name} (id:${u.id})`)));
    host.appendChild(wrap);
  }

  // ---------- Tasks UI ----------
  function buildCreateForm() {
    const title = el('input', { type: 'text', placeholder: 'Título *', required: true });
    const description = el('textarea', { placeholder: 'Descripción' });
    const assignee = el('select', {});
    const status = el('select', {});
    for (const s of STATUSES) status.appendChild(el('option', { value: s }, s));
    const btn = el('button', { class: 'primary', type: 'button', onClick: onCreate }, 'Crear tarea');

    function refreshAssignees() {
      assignee.innerHTML = '';
      assignee.appendChild(el('option', { value: '' }, '— Sin asignar —'));
      USERS.forEach(u => assignee.appendChild(el('option', { value: String(u.id) }, u.name)));
    }

    async function onCreate() {
      btn.disabled = true;
      try {
        const payload = {
          title: title.value.trim(),
          description: description.value.trim(),
          status: status.value,
          assignee_id: assignee.value ? Number(assignee.value) : null,
        };
        if (!payload.title) { alert('Title is required'); return; }
        await post('/tasks', payload);
        title.value = '';
        description.value = '';
        assignee.value = '';
        status.value = STATUSES[0];
        await reloadTasks();
      } catch (e) {
        console.error(e);
        alert(`Create failed: ${e.message}`);
      } finally {
        btn.disabled = false;
      }
    }

    buildCreateForm.refreshAssignees = refreshAssignees;

    return el('form', { class: 'form', onSubmit: (e) => e.preventDefault() },
      el('div', { class: 'row' }, title),
      el('div', { class: 'row' }, description),
      el('div', { class: 'row' }, assignee, status),
      el('div', { class: 'row' }, btn)
    );
  }

  function buildFilters() {
    const fQ = el('input', { id: 'filter-q', type: 'search', placeholder: 'Buscar texto (título o descripción)' });
    const fStatus = el('select', { id: 'filter-status' },
      el('option', { value: '' }, 'Todos los estados'),
      ...STATUSES.map(s => el('option', { value: s }, s))
    );
    const fAssignee = el('select', { id: 'filter-assignee' });
    const fPageSize = el('select', { id: 'page-size' },
      el('option', { value: '5' }, '5'),
      el('option', { value: '10', selected: 'selected' }, '10'),
      el('option', { value: '20' }, '20'),
      el('option', { value: '50' }, '50')
    );

    const apply = async () => {
      PAGE = 1; // reset to first page on filter/search change
      PAGE_SIZE = parseInt(fPageSize.value, 10);
      await reloadTasks();
    };

    const fBtn = el('button', { type: 'button', onClick: apply }, 'Aplicar');

    fQ.addEventListener('keydown', (e) => { if (e.key === 'Enter') apply(); });

    function refreshAssignees() {
      fAssignee.innerHTML = '';
      fAssignee.appendChild(el('option', { value: '' }, 'Todas las personas'));
      USERS.forEach(u => fAssignee.appendChild(el('option', { value: String(u.id) }, u.name)));
    }
    buildFilters.refreshAssignees = refreshAssignees;

    return el('div', {},
      el('div', { class: 'row' }, fQ),
      el('div', { class: 'row' }, fStatus, fAssignee, fPageSize, fBtn),
      el('p', { class: 'muted' }, 'Tip: usa búsqueda + filtros; paginación abajo de la tabla.')
    );
  }

  function renderTasks(list) {
    const host = $('#tasks-root');
    host.innerHTML = '';

    const table = el('table', {},
      el('thead', {}, el('tr', {},
        el('th', {}, 'Título'),
        el('th', {}, 'Asignado'),
        el('th', {}, 'Estado'),
        el('th', {}, 'Acciones')
      )),
      el('tbody', {})
    );

    list.forEach(t => {
      const assigneeSel = el('select', {
        onChange: async (e) => {
          try {
            const value = e.target.value;
            await patch(`/tasks/${t.id}`, { assignee_id: value ? Number(value) : null });
            await reloadTasks();
          } catch (err) {
            console.error(err);
            alert(`Update failed: ${err.message}`);
          }
        }
      });
      assigneeSel.appendChild(el('option', { value: '' }, '— Sin asignar —'));
      USERS.forEach(u => assigneeSel.appendChild(el('option', { value: String(u.id) }, u.name)));
      assigneeSel.value = t.assignee_id ? String(t.assignee_id) : '';

      const statusSel = el('select', {
        onChange: async (e) => {
          try {
            const value = e.target.value;
            if (!STATUSES.includes(value)) return;
            await patch(`/tasks/${t.id}`, { status: value });
            await reloadTasks();
          } catch (err) {
            console.error(err);
            alert(`Update failed: ${err.message}`);
          }
        }
      });
      STATUSES.forEach(s => statusSel.appendChild(el('option', { value: s }, s)));
      statusSel.value = t.status;

      const nextBtn = el('button', {
        class: 'success',
        type: 'button',
        onClick: async () => {
          try {
            const next = nextStatus(t.status);
            await patch(`/tasks/${t.id}`, { status: next });
            await reloadTasks();
          } catch (err) {
            console.error(err);
            alert(`Update failed: ${err.message}`);
          }
        }
      }, 'Siguiente estado');

      const delBtn = el('button', {
        class: 'warn',
        type: 'button',
        onClick: async () => {
          try {
            if (!confirm('¿Borrar esta tarea?')) return;
            await del(`/tasks/${t.id}`);
            await reloadTasks();
          } catch (err) {
            console.error(err);
            alert(`Delete failed: ${err.message}`);
          }
        }
      }, 'Eliminar');

      const row = el('tr', {},
        el('td', {}, el('div', {}, el('div', {}, t.title), el('div', { class: 'muted' }, t.description || ''))),
        el('td', {}, assigneeSel),
        el('td', {}, el('span', { class: `badge status-${t.status}` }, t.status)),
        el('td', { class: 'actions' }, statusSel, nextBtn, delBtn)
      );

      table.querySelector('tbody').appendChild(row);
    });

    host.appendChild(table);
    host.appendChild(renderPagination());
  }

  function renderPagination() {
    const wrap = el('div', { class: 'pagination' });

    const totalPages = Math.max(1, Math.ceil(TOTAL / PAGE_SIZE));
    const start = TOTAL === 0 ? 0 : (PAGE - 1) * PAGE_SIZE + 1;
    const end = Math.min(PAGE * PAGE_SIZE, TOTAL);

    const info = el('span', {}, `Mostrando ${start}–${end} de ${TOTAL} (página ${PAGE} de ${totalPages})`);
    const prev = el('button', { type: 'button', onClick: onPrev, disabled: PAGE <= 1 }, '« Anterior');
    const next = el('button', { type: 'button', onClick: onNext, disabled: PAGE >= totalPages }, 'Siguiente »');

    async function onPrev() {
      if (PAGE <= 1) return;
      PAGE -= 1;
      await reloadTasks();
    }
    async function onNext() {
      if (PAGE >= totalPages) return;
      PAGE += 1;
      await reloadTasks();
    }

    wrap.appendChild(info);
    wrap.appendChild(prev);
    wrap.appendChild(next);
    return wrap;
  }

  function nextStatus(s) {
    const i = STATUSES.indexOf(s);
    return STATUSES[(i + 1) % STATUSES.length];
  }

  // ---------- Data loading ----------
  async function reloadUsers() {
    USERS = await get('/users');
    renderUsers(USERS);
    if (typeof buildCreateForm.refreshAssignees === 'function') buildCreateForm.refreshAssignees();
    if (typeof buildFilters.refreshAssignees === 'function') buildFilters.refreshAssignees();
  }

  async function reloadTasks() {
    const status = $('#filter-status')?.value || '';
    const assignee = $('#filter-assignee')?.value || '';
    const q = $('#filter-q')?.value?.trim() || '';

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (assignee) params.set('assignee_id', assignee);
    params.set('page', String(PAGE));
    params.set('pageSize', String(PAGE_SIZE));

    const data = await get(`/tasks?${params.toString()}`);
    const items = data.items || [];
    TOTAL = data.total ?? items.length;
    PAGE = data.page ?? PAGE;
    PAGE_SIZE = data.pageSize ?? PAGE_SIZE;

    if (items.length === 0 && TOTAL > 0 && PAGE > 1) {
      PAGE -= 1;
      return reloadTasks();
    }

    TASKS = items;
    renderTasks(TASKS);
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('app') || document.body;
    buildLayout(root);
    try {
      await get('/health');
      await reloadUsers();
      await reloadTasks();
    } catch (e) {
      console.error(e);
      alert(`API not reachable: ${e.message}. Check API_BASE or CORS.`);
    }
  });
})();
```

---

## Problemas comunes y soluciones rápidas
- **“API not reachable … Check API_BASE or CORS.”**  
  Asegúrate de que el backend está en `http://localhost:3001`. Si cambiaste el puerto, edita `API_BASE` arriba de `public/app.js`.
- **Errores con Postgres**  
  Revisa `DATABASE_URL` en `.env`. Si usas Docker, que el contenedor esté activo. Cambia puertos si hay conflictos.
- **Proveedor con SSL**  
  Activa la línea `ssl` en el `Pool()` dentro de `server/index.js`.

---

## Siguientes pasos
- Validaciones de formularios más finas.
- Historial de cambios por tarea.
- Autenticación (JWT).
- Pasar el front a **React** o **Angular** usando la misma API.
- Exportar a CSV/Excel los resultados filtrados.

Listo: **todo en un solo archivo**. Copia y pega. ¡A chambear! 🛠️

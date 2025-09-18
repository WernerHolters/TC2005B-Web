// Tasks API: Node + Express + Postgres
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
  // ssl: { rejectUnauthorized: false } // habilítalo si tu Postgres requiere SSL
});

// ---- SCHEMA BOOTSTRAP (idempotente) ----
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

  // Seed básico
  await pool.query(`
    INSERT INTO users (name)
    SELECT x.name FROM (VALUES ('Panda'), ('Alex'), ('Paty')) AS x(name)
    WHERE NOT EXISTS (SELECT 1 FROM users);
  `);

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

// ---- RUTAS ----
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

// Lista con búsqueda y paginación
app.get('/tasks', async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status : '';
    const assigneeParam = req.query.assignee_id;
    const page = Math.max(parseInt(req.query.page ?? '1', 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize ?? '10', 10) || 10, 1), 100);

    const filters = [];
    const params = [];
    let i = 1;

    if (q) { filters.push(`(t.title ILIKE $${i} OR t.description ILIKE $${i})`); params.push(`%${q}%`); i++; }
    if (status && isValidStatus(status)) { filters.push(`t.status = $${i}`); params.push(status); i++; }
    if (assigneeParam !== undefined && assigneeParam !== '') {
      const aid = Number(assigneeParam);
      if (!Number.isInteger(aid)) return res.status(400).json({ ok: false, error: 'Invalid assignee_id' });
      filters.push(`t.assignee_id = $${i}`); params.push(aid); i++;
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM tasks t ${where}`,
      params
    );
    const total = countRows[0].total;

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

    if (typeof req.body.title === 'string') { fields.push(`title = $${i++}`); values.push(req.body.title.trim()); }
    if (typeof req.body.description === 'string') { fields.push(`description = $${i++}`); values.push(req.body.description.trim()); }
    if (typeof req.body.status === 'string') {
      if (!isValidStatus(req.body.status)) return res.status(400).json({ ok: false, error: 'Invalid status' });
      fields.push(`status = $${i++}`); values.push(req.body.status);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'assignee_id')) {
      fields.push(`assignee_id = $${i++}`); values.push(req.body.assignee_id);
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

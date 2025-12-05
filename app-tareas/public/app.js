// ========================================
// App de Tareas - Vanilla JS + Express + Postgres
// ========================================

const API_BASE = 'http://localhost:3001';

// Helpers para selectores
const qs = (s, c = document) => c.querySelector(s);
const qsa = (s, c = document) => Array.from(c.querySelectorAll(s));

// Referencias a elementos del DOM
const el = {
    app: null,
    usersSel: null,
    usersForm: null,
    usersInput: null,
    taskForm: null,
    taskTitle: null,
    taskDesc: null,
    taskAssignee: null,
    taskStatus: null,
    searchInput: null,
    statusFilter: null,
    tableBody: null,
    pager: null
};

// Estado de la aplicación
let state = {
    page: 1,
    pageSize: 10,
    q: '',
    status: ''
};

// ========================================
// Funciones de API
// ========================================

async function api(path, opts = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...opts
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    // 204 sin body
    return res.status === 204 ? null : res.json();
}

async function loadUsers() {
    const users = await api('/users');
    el.usersSel.innerHTML = '<option value="">(sin asignar)</option>' +
        users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
}

async function loadTasks() {
    const params = new URLSearchParams({
        page: state.page,
        pageSize: state.pageSize
    });
    if (state.q) params.set('q', state.q);
    if (state.status) params.set('status', state.status);

    const data = await api(`/tasks?${params.toString()}`);
    renderTasks(data);
}

// ========================================
// Funciones de Renderizado
// ========================================

function renderTasks({ items, total, page, pageSize }) {
    el.tableBody.innerHTML = items.map(t => `
        <tr>
            <td>${t.id}</td>
            <td>${escapeHTML(t.title)}</td>
            <td>${escapeHTML(t.description || '')}</td>
            <td>
                <select data-id="${t.id}" class="status">
                    ${['sin_iniciar', 'en_curso', 'terminada'].map(s =>
                        `<option value="${s}" ${s === t.status ? 'selected' : ''}>${s}</option>`
                    ).join('')}
                </select>
            </td>
            <td>${t.assignee_name ? escapeHTML(t.assignee_name) : '—'}</td>
            <td>
                <button data-id="${t.id}" class="del">Eliminar</button>
            </td>
        </tr>
    `).join('');

    // Paginador
    const pages = Math.max(1, Math.ceil(total / pageSize));
    el.pager.innerHTML = `
        <button ${page <= 1 ? 'disabled' : ''} data-act="prev">« Prev</button>
        <span> ${page} / ${pages} </span>
        <button ${page >= pages ? 'disabled' : ''} data-act="next">Next »</button>
    `;
}

function escapeHTML(s) {
    return String(s).replace(/[&<>"]/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;"
    }[c]));
}

// ========================================
// Manejadores de Eventos
// ========================================

async function onCreateUser(e) {
    e.preventDefault();
    const name = el.usersInput.value.trim();
    if (!name) return alert('Nombre requerido');
    await api('/users', { method: 'POST', body: JSON.stringify({ name }) });
    el.usersInput.value = '';
    await loadUsers();
}

async function onCreateTask(e) {
    e.preventDefault();
    const title = el.taskTitle.value.trim();
    if (!title) return alert('Título requerido');

    const body = {
        title,
        description: el.taskDesc.value.trim(),
        status: el.taskStatus.value,
        assignee_id: el.taskAssignee.value ? Number(el.taskAssignee.value) : null
    };
    await api('/tasks', { method: 'POST', body: JSON.stringify(body) });
    el.taskTitle.value = '';
    el.taskDesc.value = '';
    await loadTasks();
}

async function onTableClick(e) {
    const id = e.target.dataset.id;
    if (e.target.classList.contains('del')) {
        if (confirm('¿Eliminar tarea?')) {
            await api(`/tasks/${id}`, { method: 'DELETE' });
            await loadTasks();
        }
    }
}

async function onTableChange(e) {
    if (e.target.classList.contains('status')) {
        const id = Number(e.target.dataset.id);
        const status = e.target.value;
        await api(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    }
}

function onSearch(e) {
    state.q = e.target.value.trim();
    state.page = 1;
    loadTasks();
}

function onFilterStatus(e) {
    state.status = e.target.value;
    state.page = 1;
    loadTasks();
}

function onPageClick(e) {
    const act = e.target.dataset.act;
    if (!act) return;
    state.page += (act === 'next' ? 1 : -1);
    if (state.page < 1) state.page = 1;
    loadTasks();
}

// ========================================
// Montaje de UI
// ========================================

function mountUI() {
    el.app.innerHTML = `
        <h1>Tablita de Tareas</h1>

        <section>
            <h2>Usuarios</h2>
            <form id="usersForm">
                <input id="userName" placeholder="Nombre de usuario" />
                <button>Agregar</button>
            </form>
        </section>

        <section>
            <h2>Nueva tarea</h2>
            <form id="taskForm">
                <input id="taskTitle" placeholder="Título" required />
                <input id="taskDesc" placeholder="Descripción" />
                <select id="taskStatus">
                    <option value="sin_iniciar">sin_iniciar</option>
                    <option value="en_curso">en_curso</option>
                    <option value="terminada">terminada</option>
                </select>
                <select id="taskAssignee"></select>
                <button>Crear</button>
            </form>
        </section>

        <section>
            <h2>Listado</h2>
            <div style="display:flex; gap:8px; align-items:center;">
                <input id="search" placeholder="Buscar..." />
                <select id="statusFilter">
                    <option value="">(todos)</option>
                    <option value="sin_iniciar">sin_iniciar</option>
                    <option value="en_curso">en_curso</option>
                    <option value="terminada">terminada</option>
                </select>
            </div>
            <table border="1" cellspacing="0" cellpadding="6" style="margin-top:8px; width:100%;">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Asignado a</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tbody"></tbody>
            </table>
            <div id="pager" style="margin-top:8px; display:flex; gap:8px; align-items:center;"></div>
        </section>
    `;

    // Referencias a elementos
    el.usersForm = qs('#usersForm');
    el.usersInput = qs('#userName');
    el.taskForm = qs('#taskForm');
    el.taskTitle = qs('#taskTitle');
    el.taskDesc = qs('#taskDesc');
    el.taskAssignee = qs('#taskAssignee');
    el.taskStatus = qs('#taskStatus');
    el.searchInput = qs('#search');
    el.statusFilter = qs('#statusFilter');
    el.tableBody = qs('#tbody');
    el.pager = qs('#pager');
    el.usersSel = el.taskAssignee;

    // Registrar eventos
    el.usersForm.addEventListener('submit', onCreateUser);
    el.taskForm.addEventListener('submit', onCreateTask);
    el.tableBody.addEventListener('click', onTableClick);
    el.tableBody.addEventListener('change', onTableChange);
    el.searchInput.addEventListener('input', onSearch);
    el.statusFilter.addEventListener('change', onFilterStatus);
    el.pager.addEventListener('click', onPageClick);
}

// ========================================
// Inicialización
// ========================================

async function boot() {
    el.app = document.getElementById('app');
    mountUI();
    await loadUsers();
    await loadTasks();
}

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot, { once: true })
    : boot();

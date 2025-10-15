// Tipos de plantas disponibles
const PLANTAS = {
    '🌱': '🌿',  // Hierba: plantada -> madura
    '🌷': '🌺',  // Flor: plantada -> madura
    '🌵': '🌵',  // Cactus: siempre igual
    '🍓': '🍓'   // Fresa: siempre igual
};

// Array para guardar el estado del jardín 8x8
// jardin[fila][columna] = { emoji: '🌱', estado: 'plantada' }
const jardin = [];
for (let i = 0; i < 8; i++) {
    jardin[i] = [];
    for (let j = 0; j < 8; j++) {
        jardin[i][j] = null; // null = celda vacía
    }
}

// Obtener todas las celdas del HTML
const cells = document.querySelectorAll('.cell');
const btnWater = document.getElementById('btn-water');
const btnHarvest = document.getElementById('btn-harvest');

// Elementos de contadores
const plantedCount = document.getElementById('planted-count');
const matureCount = document.getElementById('mature-count');
const harvestedCount = document.getElementById('harvested-count');

// Elementos del sidebar
const plantsList = document.getElementById('plants-list');
const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');
const stateFilter = document.getElementById('state-filter');

// Elementos del modal
const plantModal = document.getElementById('plant-modal');
const modalClose = document.getElementById('modal-close');
const btnPlant = document.getElementById('btn-plant');
const btnCancel = document.getElementById('btn-cancel');
const plantNameInput = document.getElementById('plant-name');
const plantOptions = document.querySelectorAll('input[name="plant-type"]');

// Elemento de notificaciones
const notifications = document.getElementById('notifications');

// Variables para contadores
let totalCosechadas = 0;

// Variables del modal
let celdaActual = null;

// ========================================
// FUNCIÓN: Mostrar notificaciones accesibles
// ========================================
function mostrarNotificacion(mensaje) {
    notifications.textContent = mensaje;
    notifications.classList.add('show');
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
        notifications.classList.remove('show');
    }, 3000);
}

// ========================================
// FUNCIONES DE LOCALSTORAGE
// ========================================

// Guardar estado en localStorage
function guardarJardin() {
    const estado = {
        jardin: jardin,
        totalCosechadas: totalCosechadas
    };
    localStorage.setItem('garden-grid-estado', JSON.stringify(estado));
    console.log('Jardín guardado en localStorage');
}

// Cargar estado desde localStorage
function cargarJardin() {
    const estadoGuardado = localStorage.getItem('garden-grid-estado');
    
    if (estadoGuardado) {
        try {
            const estado = JSON.parse(estadoGuardado);
            
            // Restaurar jardín
            for (let fila = 0; fila < 8; fila++) {
                for (let col = 0; col < 8; col++) {
                    jardin[fila][col] = estado.jardin[fila][col];
                    
                    // Si hay una planta, actualizar la celda visual
                    if (jardin[fila][col]) {
                        const celda = document.querySelector(`[data-row="${fila}"][data-col="${col}"]`);
                        const planta = jardin[fila][col];
                        
                        celda.textContent = planta.emoji;
                        celda.classList.add(planta.estado);
                    }
                }
            }
            
            // Restaurar contador de cosechadas
            totalCosechadas = estado.totalCosechadas || 0;
            
            console.log('Jardín cargado desde localStorage');
            return true;
        } catch (error) {
            console.error('Error al cargar jardín:', error);
            return false;
        }
    }
    return false;
}

// ========================================
// FUNCIÓN: Actualizar contadores
// ========================================
function actualizarContadores() {
    let plantadas = 0;
    let maduras = 0;
    
    // Contar plantas en el jardín
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const planta = jardin[row][col];
            if (planta) {
                if (planta.estado === 'planted') {
                    plantadas++;
                } else if (planta.estado === 'mature') {
                    maduras++;
                }
            }
        }
    }
    
    // Actualizar números en pantalla
    plantedCount.textContent = plantadas;
    matureCount.textContent = maduras;
    harvestedCount.textContent = totalCosechadas;
}

// ========================================
// FUNCIÓN: Mostrar modal para plantar
// ========================================
function mostrarModalPlantar(celda) {
    const row = celda.dataset.row;
    const col = celda.dataset.col;
    
    // Verificar si ya hay una planta
    if (jardin[row][col] !== null) {
        mostrarNotificacion('¡Ya hay una planta aquí!');
        return;
    }
    
    celdaActual = celda;
    plantModal.style.display = 'block';
    
    // Limpiar selecciones anteriores
    plantOptions.forEach(option => option.checked = false);
    plantNameInput.value = '';
    btnPlant.disabled = true;
    
    // Actualizar visual de opciones
    actualizarSeleccionPlantas();
}

// ========================================
// FUNCIÓN: Actualizar selección de plantas
// ========================================
function actualizarSeleccionPlantas() {
    const seleccionada = document.querySelector('input[name="plant-type"]:checked');
    
    // Actualizar estilos visuales
    document.querySelectorAll('.plant-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    if (seleccionada) {
        seleccionada.closest('.plant-option').classList.add('selected');
        btnPlant.disabled = false;
    } else {
        btnPlant.disabled = true;
    }
}

// ========================================
// FUNCIÓN: Plantar planta seleccionada
// ========================================
function plantarSeleccionada() {
    const tipoSeleccionado = document.querySelector('input[name="plant-type"]:checked');
    
    if (!tipoSeleccionado || !celdaActual) return;
    
    const row = celdaActual.dataset.row;
    const col = celdaActual.dataset.col;
    const plantaEmoji = tipoSeleccionado.value;
    const nombre = plantNameInput.value.trim() || 'Sin nombre';
    
    // Guardar en el jardín
    jardin[row][col] = {
        emoji: plantaEmoji,
        estado: 'planted',
        nombre: nombre
    };
    
    // Actualizar visual
    celdaActual.textContent = plantaEmoji;
    celdaActual.classList.add('planted');
    
    // Cerrar modal
    plantModal.style.display = 'none';
    
    // Actualizar contadores y lista
    actualizarContadores();
    actualizarListaPlantas();
    guardarJardin();
    
    console.log(`Plantada ${plantaEmoji} "${nombre}" en [${row}][${col}]`);
}

// ========================================
// FUNCIÓN: Cerrar modal
// ========================================
function cerrarModal() {
    plantModal.style.display = 'none';
    celdaActual = null;
}

// ========================================
// FUNCIÓN: Regar todas las plantas
// ========================================
function regarPlantas() {
    let plantasRegadas = 0;
    
    // Recorrer todo el jardín
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const planta = jardin[row][col];
            
            // Si hay una planta y está plantada (no madura)
            if (planta && planta.estado === 'planted') {
                // Cambiar a madura
                planta.estado = 'mature';
                planta.emoji = PLANTAS[planta.emoji]; // Cambiar emoji
                
                // Buscar la celda correspondiente y actualizarla
                const celda = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                celda.textContent = planta.emoji;
                celda.classList.remove('planted');
                celda.classList.add('mature');
                
                plantasRegadas++;
            }
        }
    }
    
    // Actualizar contadores y lista
    actualizarContadores();
    actualizarListaPlantas();
    guardarJardin(); // Guardar después de regar
    
    // Mostrar notificación accesible
    if (plantasRegadas > 0) {
        mostrarNotificacion(`💧 ¡${plantasRegadas} planta(s) regada(s) y maduras!`);
    } else {
        mostrarNotificacion('No hay plantas para regar');
    }
}

// ========================================
// FUNCIÓN: Cosechar plantas maduras
// ========================================
function cosecharMaduras() {
    let plantasCosechadas = 0;
    
    // Recorrer todo el jardín
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const planta = jardin[row][col];
            
            // Si hay una planta y está madura
            if (planta && planta.estado === 'mature') {
                // Limpiar el jardín
                jardin[row][col] = null;
                
                // Buscar la celda y limpiarla
                const celda = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                celda.textContent = '';
                celda.classList.remove('mature');
                
                plantasCosechadas++;
            }
        }
    }
    
    // Sumar al total de cosechadas
    totalCosechadas += plantasCosechadas;
    
    // Actualizar contadores y lista
    actualizarContadores();
    actualizarListaPlantas();
    guardarJardin(); // Guardar después de cosechar
    
    // Mostrar notificación accesible
    if (plantasCosechadas > 0) {
        mostrarNotificacion(`🌾 ¡${plantasCosechadas} planta(s) cosechada(s)!`);
    } else {
        mostrarNotificacion('No hay plantas maduras para cosechar');
    }
}

// ========================================
// FUNCIÓN: Actualizar lista de plantas en el sidebar
// ========================================
function actualizarListaPlantas() {
    const todasLasPlantas = [];
    
    // Recopilar todas las plantas del jardín
    for (let fila = 0; fila < 8; fila++) {
        for (let col = 0; col < 8; col++) {
            const planta = jardin[fila][col];
            if (planta) {
                planta.posicion = `[${fila + 1},${col + 1}]`;
                todasLasPlantas.push(planta);
            }
        }
    }
    
    console.log('Plantas encontradas:', todasLasPlantas);
    
    // Limpiar la lista actual
    plantsList.innerHTML = '';
    
    // Aplicar filtros
    const filtroTexto = searchInput.value.toLowerCase();
    const filtroTipo = typeFilter.value;
    const filtroEstado = stateFilter.value;
    
    let plantasFiltradas = todasLasPlantas.filter(planta => {
        const coincideTexto = planta.nombre.toLowerCase().includes(filtroTexto);
        const coincideTipo = filtroTipo === 'all' || filtroTipo === '' || planta.emoji === filtroTipo;
        const coincideEstado = filtroEstado === 'all' || filtroEstado === '' || planta.estado === filtroEstado;
        
        return coincideTexto && coincideTipo && coincideEstado;
    });
    
    // Mostrar plantas filtradas
    plantasFiltradas.forEach(planta => {
        const plantItem = document.createElement('div');
        plantItem.className = 'plant-item';
        
        const estadoTexto = planta.estado === 'planted' ? 'Plantada' : 'Madura';
        
        plantItem.innerHTML = `
            <span class="plant-emoji">${planta.emoji}</span>
            <div class="plant-info">
                <div class="plant-name">${planta.nombre}</div>
                <div class="plant-details">${estadoTexto} • ${planta.posicion}</div>
            </div>
        `;
        
        plantsList.appendChild(plantItem);
    });
    
    // Mostrar mensaje si no hay plantas
    if (plantasFiltradas.length === 0) {
        const mensaje = document.createElement('div');
        mensaje.className = 'no-plants-message';
        mensaje.textContent = todasLasPlantas.length === 0 ? 
            'No hay plantas en el jardín' : 
            'No se encontraron plantas con esos filtros';
        plantsList.appendChild(mensaje);
    }
}

// ========================================
// CONECTAR EVENTOS
// ========================================

// Event delegation: un solo listener en el contenedor garden
document.querySelector('.garden').addEventListener('click', function(e) {
    if (e.target.classList.contains('cell')) {
        mostrarModalPlantar(e.target);
    }
});

// Botón para regar
btnWater.addEventListener('click', regarPlantas);

// Botón para cosechar
btnHarvest.addEventListener('click', cosecharMaduras);

// Eventos del modal
modalClose.addEventListener('click', cerrarModal);
btnCancel.addEventListener('click', cerrarModal);
btnPlant.addEventListener('click', plantarSeleccionada);

// Cerrar modal al hacer click fuera
plantModal.addEventListener('click', function(e) {
    if (e.target === plantModal) {
        cerrarModal();
    }
});

// Eventos de selección de plantas
plantOptions.forEach(option => {
    option.addEventListener('change', actualizarSeleccionPlantas);
});

// Cerrar modal con Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && plantModal.style.display === 'block') {
        cerrarModal();
    }
});

// Eventos para los filtros del sidebar
searchInput.addEventListener('input', actualizarListaPlantas);
typeFilter.addEventListener('change', actualizarListaPlantas);
stateFilter.addEventListener('change', actualizarListaPlantas);

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Intentar cargar jardín guardado
    const cargado = cargarJardin();
    
    if (cargado) {
        console.log('Jardín cargado desde localStorage');
    } else {
        console.log('Empezando jardín nuevo');
    }
    
    // Actualizar contadores y lista
    actualizarContadores();
    actualizarListaPlantas();
});

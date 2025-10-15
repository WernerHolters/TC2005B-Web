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

// Variables para contadores
let totalCosechadas = 0;

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
// FUNCIÓN: Plantar en una celda
// ========================================
function plantar(celda) {
    const row = celda.dataset.row;
    const col = celda.dataset.col;
    
    // Verificar si ya hay una planta
    if (jardin[row][col] !== null) {
        alert('¡Ya hay una planta aquí!');
        return;
    }
    
    // Elegir una planta aleatoria
    const tiposDisponibles = Object.keys(PLANTAS);
    const plantaAleatoria = tiposDisponibles[Math.floor(Math.random() * tiposDisponibles.length)];
    
    // Pedir nombre (opcional)
    const nombre = prompt('¿Nombre para tu planta? (opcional):') || 'Sin nombre';

    // Guardar en el jardín
    jardin[row][col] = {
        emoji: plantaAleatoria,
        estado: 'planted',
        nombre: nombre
    };

    celda.textContent = plantaAleatoria;
    celda.classList.add('planted');
    
    // Actualizar contadores y lista
    actualizarContadores();
    actualizarListaPlantas();
    
    console.log(`Plantada ${plantaAleatoria} ${nombre} en [${row}][${col}]`);
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
    
    if (plantasRegadas > 0) {
        alert(`💧 ¡${plantasRegadas} planta(s) regada(s) y maduras!`);
    } else {
        alert('No hay plantas para regar');
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
    
    if (plantasCosechadas > 0) {
        alert(`🌾 ¡${plantasCosechadas} planta(s) cosechada(s)!`);
    } else {
        alert('No hay plantas maduras para cosechar');
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

// Click en cada celda para plantar
cells.forEach(celda => {
    celda.addEventListener('click', function() {
        plantar(this);
    });
});

// Botón para regar
btnWater.addEventListener('click', regarPlantas);

// Botón para cosechar
btnHarvest.addEventListener('click', cosecharMaduras);

// Eventos para los filtros del sidebar
searchInput.addEventListener('input', actualizarListaPlantas);
typeFilter.addEventListener('change', actualizarListaPlantas);
stateFilter.addEventListener('change', actualizarListaPlantas);

// Inicializar la aplicación
actualizarContadores();
actualizarListaPlantas();

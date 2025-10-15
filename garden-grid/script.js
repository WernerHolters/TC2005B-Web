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
                if (planta.estado === 'plantada') {
                    plantadas++;
                } else if (planta.estado === 'madura') {
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
        estado: 'plantada',
        nombre: nombre
    };
    
    // Actualizar la celda en pantalla
    celda.textContent = plantaAleatoria;
    celda.classList.add('planted');
    
    // Actualizar contadores
    actualizarContadores();
    
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
            if (planta && planta.estado === 'plantada') {
                // Cambiar a madura
                planta.estado = 'madura';
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
    
    // Actualizar contadores
    actualizarContadores();
    
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
            if (planta && planta.estado === 'madura') {
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
    
    // Actualizar contadores
    actualizarContadores();
    
    if (plantasCosechadas > 0) {
        alert(`🌾 ¡${plantasCosechadas} planta(s) cosechada(s)!`);
    } else {
        alert('No hay plantas maduras para cosechar');
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

let debounceTimer;
let fuse = null;
let fullData = [];
let filteredData = [];
let currentChannel = '';

// URL base de la API
const API_BASE_URL = 'https://levapan-production.up.railway.app/api/Levapan/pdv';

// Cargar datos de la API según el canal seleccionado
async function loadData(channel = '') {
    try {
        // Determinar qué API usar según el canal
        let apiUrl = API_BASE_URL;
        if (channel === 'Independiente') {
            apiUrl = `${API_BASE_URL}?tipo=independiente`;
        }
        // Para 'Moderno' o sin selección, usar la API por defecto
        
        console.log(`Cargando datos desde: ${apiUrl}`);
        
        // Mostrar indicador de carga
        showLoadingState(channel);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const data = await response.json();
        fullData = data.result || [];
        filteredData = fullData; // Los datos ya vienen filtrados desde el backend
        currentChannel = channel;

        console.log(`Datos cargados para ${channel || 'todos los canales'}:`, fullData.length, 'registros');
        
        // Ocultar indicador de carga
        hideLoadingState();
        
        // Inicializar búsqueda
        initializeFuse();
        
        // Limpiar resultados anteriores
        document.getElementById('results').innerHTML = '';
        
        // Mostrar mensaje informativo
        if (channel) {
            showChannelInfo(channel, fullData.length);
        }
        
    } catch (error) {
        console.error("Error al cargar los datos:", error);
        hideLoadingState();
        showError(`No se pudieron cargar los datos${channel ? ' para ' + channel : ''}. Inténtalo más tarde.`);
    }
}

// Inicializar Fuse.js para búsqueda rápida
function initializeFuse() {
    const options = {
        keys: ['SAP','CANAL','REGIÓN','CIUDAD','PDV','DIRECCIÓN','BARRIO'],
        threshold: 0.3,
    };
    fuse = new Fuse(filteredData, options);
}

// Manejo de la entrada de búsqueda con debounce
function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        performFilteredSearch();
    }, 300);
}

// Realizar búsqueda en los datos cargados
function performFilteredSearch() {
    const query = document.getElementById('searchInput').value.trim();
    
    // Si hay texto de búsqueda, aplicar búsqueda con Fuse
    if (query && filteredData.length > 0) {
        const results = fuse.search(query).map(result => result.item);
        renderResults(results);
    } else if (query === '') {
        // Limpiar resultados si no hay búsqueda
        document.getElementById('results').innerHTML = '';
        // Volver a mostrar el mensaje informativo si hay canal seleccionado
        if (currentChannel) {
            showChannelInfo(currentChannel, filteredData.length);
        }
    }
}

// Manejo del cambio en el selector de canal
async function handleChannelChange() {
    const selectedChannel = document.getElementById('channelSelector').value;
    
    // Limpiar el input de búsqueda
    document.getElementById('searchInput').value = '';
    
    // Cargar datos del canal seleccionado
    await loadData(selectedChannel);
}

// Renderizar los resultados en HTML con animaciones
function renderResults(results) {
    let output = `<h2>Resultados (${results.length} encontrados):</h2>`;

    if (results.length > 0) {
        results.forEach(result => {
            output += `
                <div class="result-item">
                    <h3>${result['PDV '] || 'N/A'}</h3>
                    <ul>
                        <li><strong>SAP:</strong> ${result.SAP || 'N/A'}
                        <i class="material-icons copy-icon" onclick="copyToClipboard('${result.SAP}')">content_copy</i>
                        </li>
                        <li><strong>Ciudad:</strong> ${result['CIUDAD '] || 'N/A'}</li>
                        <li><strong>Barrio:</strong> ${result['BARRIO '] || 'N/A'}</li>
                        <li><strong>Dirección:</strong> ${result['DIRECCIÓN'] || 'N/A'}</li>
                        <li><strong>Región:</strong> ${result['REGIÓN '] || 'N/A'}</li>
                        <li><strong>Canal:</strong> ${result['CANAL '] || 'N/A'}</li>

                    </ul>
                </div>
            `;
        });
    } else {
        output += '<p>No se encontraron resultados.</p>';
    }

    document.getElementById('results').innerHTML = output;
}

// Copiar al portapapeles
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => alert('Documento copiado al portapapeles'))
        .catch(err => console.error('Error:', err));
}

// Mostrar estado de carga
function showLoadingState(channel = '') {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando datos${channel ? ' de ' + channel : ''}...</p>
        </div>
    `;
}

// Ocultar estado de carga
function hideLoadingState() {
    // El estado se limpia cuando se muestran los resultados o errores
}

// Mostrar información del canal seleccionado
function showChannelInfo(channel, count) {
    document.getElementById('results').innerHTML = `
        <div class="info-message">
            <p>📊 Canal seleccionado: <strong>${channel}</strong></p>
            <p>Se cargaron <strong>${count}</strong> registros disponibles para búsqueda</p>
        </div>
    `;
}

// Mostrar error
function showError(message) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <p>${message}</p>
        </div>
    `;
}

// Modo Oscuro
document.getElementById("darkModeToggle").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
    
    // Cambiar el texto del botón según el modo
    const isDarkMode = document.body.classList.contains("dark-mode");
    this.innerHTML = isDarkMode ? "☀️ Modo claro" : "🌙 Modo oscuro";
});

// Event listener para el selector de canal
document.getElementById("channelSelector").addEventListener("change", handleChannelChange);

// Cargar datos al inicio
loadData();

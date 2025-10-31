let debounceTimer;
let fuse = null;
let fullData = [];
let filteredData = [];
let currentChannel = '';

// URL de la API que contiene todos los datos
const API_URL = 'https://levapan-production.up.railway.app/api/Levapan/pdv';

// Cargar todos los datos de la API una sola vez
async function loadData() {
    try {
        console.log("Cargando todos los datos desde la API...");
        
        // Mostrar indicador de carga
        showLoadingState();
        
        const response = await fetch(API_URL);
        
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const data = await response.json();
        fullData = data.result || [];

        console.log("Datos cargados correctamente:", fullData);
        
        // Ocultar indicador de carga
        hideLoadingState();
        
        // Inicializar con todos los datos
        filteredData = fullData;
        initializeFuse();
        
        // Limpiar resultados anteriores
        document.getElementById('results').innerHTML = '';
        
    } catch (error) {
        console.error("Error al cargar los datos:", error);
        hideLoadingState();
        showError("No se pudieron cargar los datos. Inténtalo más tarde.");
    }
}

// Filtrar datos por canal seleccionado
function filterDataByChannel(channel) {
    if (!channel) {
        // Sin filtro, usar todos los datos
        filteredData = fullData;
        currentChannel = '';
    } else {
        // Filtrar por canal de distribución
        filteredData = fullData.filter(item => 
            item['CANAL DISTRIBUCION'] && 
            item['CANAL DISTRIBUCION'].toString().toLowerCase().includes(channel.toLowerCase())
        );
        currentChannel = channel;
    }
    
    // Reinicializar Fuse con los datos filtrados
    initializeFuse();
    
    console.log(`Datos filtrados para ${channel || 'todos los canales'}:`, filteredData.length, 'elementos');
}

// Inicializar Fuse.js para búsqueda rápida con datos filtrados
function initializeFuse() {
    const options = {
        keys: ['SAP','NIT','CODIGO CLIENTE','GRUPO VENDEDOR','CANAL DISTRIBUCION','RAZON SOCIAL','NOMBRE','DIRECCION','BARRIO','POBLACION','SUBGRUPO'],
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

// Realizar búsqueda en los datos filtrados por canal
function performFilteredSearch() {
    const query = document.getElementById('searchInput').value.trim();
    
    // Si hay texto de búsqueda, aplicar búsqueda con Fuse
    if (query && filteredData.length > 0) {
        const results = fuse.search(query).map(result => result.item);
        renderResults(results);
    } else if (query === '') {
        // Limpiar resultados si no hay búsqueda
        document.getElementById('results').innerHTML = '';
    }
}

// Manejo del cambio en el selector de canal
function handleChannelChange() {
    const selectedChannel = document.getElementById('channelSelector').value;
    
    // Limpiar el input de búsqueda
    document.getElementById('searchInput').value = '';
    
    // Filtrar datos por canal seleccionado
    filterDataByChannel(selectedChannel);
    
    // Limpiar resultados de búsqueda
    document.getElementById('results').innerHTML = '';
    
    // Mostrar mensaje informativo sobre el filtro aplicado
    if (selectedChannel) {
        const count = filteredData.length;
        document.getElementById('results').innerHTML = `
            <div class="info-message">
                <p>📊 Filtrado por canal: <strong>${selectedChannel}</strong></p>
                <p>Se encontraron <strong>${count}</strong> registros disponibles para búsqueda</p>
            </div>
        `;
    }
}

// Renderizar los resultados en HTML con animaciones
function renderResults(results) {
    let output = `<h2>Resultados (${results.length} encontrados):</h2>`;

    if (results.length > 0) {
        results.forEach(result => {
            output += `
                <div class="result-item">
                    <h3>${result.PDV}</h3>
                    <ul>
                        <li><strong>SAP:</strong> ${result.SAP || 'N/A'}
                        <i class="material-icons copy-icon" onclick="copyToClipboard('${result.SAP}')">content_copy</i>
                        </li>
                        <li><strong>Ciudad:</strong> ${result.CIUDAD || 'N/A'}</li>
                        <li><strong>Dirección:</strong> ${result.DIRECION || 'N/A'}</li>

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
function showLoadingState() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando datos${currentChannel ? ' de ' + currentChannel : ''}...</p>
        </div>
    `;
}

// Ocultar estado de carga
function hideLoadingState() {
    // El estado se limpia cuando se muestran los resultados o errores
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

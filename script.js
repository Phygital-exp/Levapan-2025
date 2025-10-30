let debounceTimer;
let fuse = null;
let fullData = [];

const API_URL = 'https://levapan-production.up.railway.app/api/levapan/pdv';

// Cargar los datos de la API
async function loadData() {
    try {
        console.log("Intentando cargar datos desde la API...");
        const response = await fetch(API_URL);
        
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const data = await response.json();
        fullData = data.result || [];

        console.log("Datos cargados correctamente:", fullData);
        initializeFuse();
    } catch (error) {
        console.error("Error al cargar los datos:", error);
        alert("No se pudieron cargar los datos. Inténtalo más tarde.");
    }
}

// Inicializar Fuse.js para búsqueda rápida
function initializeFuse() {
    const options = {
        keys: ['SAP','PDV','CORPORATIVO','FORMATO'],
        threshold: 0.3,
    };
    fuse = new Fuse(fullData, options);
}

// Manejo de la entrada de búsqueda con debounce
function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const query = document.getElementById('searchInput').value.trim();
        if (query) {
            performSearch(query);
        } else {
            document.getElementById('results').innerHTML = '';
        }
    }, 300);
}

// Realizar búsqueda con Fuse.js
function performSearch(query) {
    const results = fuse.search(query).map(result => result.item);
    renderResults(results);
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
                        <li><strong>Dirección:</strong> ${result.DIRECCION || 'N/A'}</li>

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

// Modo Oscuro
document.getElementById("darkModeToggle").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
});

// Cargar datos al inicio
loadData();

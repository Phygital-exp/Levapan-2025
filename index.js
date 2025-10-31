const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express();

const PORT = process.env.PORT;
const AUTH_HEADERS = {
    Authorization: "Token 9b7661d9292aab2c339b95bf251063791c2a62ff",
    "Content-Type": "application/json",
};

app.use(cors());

app.get("/api/Levapan/pdv", async (req, res) => {
    try {
        // Determinar qué API usar según el parámetro 'tipo'
        const tipo = req.query.tipo;
        let apiUrl;
        
        if (tipo === 'independiente') {
            apiUrl = "https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/Levapan_PDVs_independientes";
        } else {
            // Por defecto, usar la API de modernos (o todos)
            apiUrl = "https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/Levapan_PDVs";
        }
        
        console.log(`Consultando API: ${apiUrl}`);
        
        const response = await fetch(apiUrl, { headers: AUTH_HEADERS });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Error en el proxy levapan PDV:", err);
        res.status(500).json({ error: "Error al obtener datos de levapan PDV" });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});

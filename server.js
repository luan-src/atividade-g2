const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Configuração do banco de dados
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run(`
        CREATE TABLE curriculos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            telefone TEXT,
            email TEXT NOT NULL,
            endereco_web TEXT,
            experiencia_profissional TEXT NOT NULL
        )
    `);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Endpoints
app.get('/curriculos', (req, res) => {
    db.all(`SELECT id, nome, email FROM curriculos`, [], (err, rows) => {
        if (err) return res.status(500).send('Erro ao buscar currículos.');
        res.json(rows);
    });
});

app.post('/curriculos', (req, res) => {
    const { nome, telefone, email, endereco_web, experiencia_profissional } = req.body;
    if (!nome || !email || !experiencia_profissional) {
        return res.status(400).send('Campos obrigatórios não preenchidos.');
    }
    const sql = `
        INSERT INTO curriculos (nome, telefone, email, endereco_web, experiencia_profissional)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.run(sql, [nome, telefone, email, endereco_web, experiencia_profissional], function(err) {
        if (err) return res.status(500).send('Erro ao salvar currículo.');
        res.status(201).send({ id: this.lastID });
    });
});

app.get('/curriculos/:id', (req, res) => {
    const sql = `SELECT * FROM curriculos WHERE id = ?`;
    db.get(sql, [req.params.id], (err, row) => {
        if (err) return res.status(500).send('Erro ao buscar currículo.');
        if (!row) return res.status(404).send('Currículo não encontrado.');
        res.json(row);
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

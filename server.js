require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Garante pasta data ──────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const JOGOS_FILE = path.join(DATA_DIR, 'jogos.json');
if (!fs.existsSync(JOGOS_FILE)) {
  fs.writeFileSync(JOGOS_FILE, JSON.stringify({ jogos: [] }, null, 2));
}

// ── Helpers ─────────────────────────────────────────────────────────
function lerJogos() {
  return JSON.parse(fs.readFileSync(JOGOS_FILE, 'utf8'));
}
function salvarJogos(data) {
  fs.writeFileSync(JOGOS_FILE, JSON.stringify(data, null, 2));
}

// ── Rotas de Jogos ───────────────────────────────────────────────────
app.get('/api/jogos', (req, res) => {
  res.json(lerJogos());
});

app.post('/api/jogos', (req, res) => {
  const data = lerJogos();
  const jogo = { id: Date.now().toString(), ...req.body, criadoEm: new Date().toISOString() };
  data.jogos.push(jogo);
  salvarJogos(data);
  res.json({ ok: true, jogo });
});

app.put('/api/jogos/:id', (req, res) => {
  const data = lerJogos();
  const idx = data.jogos.findIndex(j => j.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Jogo não encontrado' });
  data.jogos[idx] = { ...data.jogos[idx], ...req.body };
  salvarJogos(data);
  res.json({ ok: true, jogo: data.jogos[idx] });
});

app.delete('/api/jogos/:id', (req, res) => {
  const data = lerJogos();
  data.jogos = data.jogos.filter(j => j.id !== req.params.id);
  salvarJogos(data);
  res.json({ ok: true });
});

// ── Rota de IA (Anthropic) ───────────────────────────────────────────
app.post('/api/ia/gerar', async (req, res) => {
  const { texto, tipo } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ erro: 'Chave da API não configurada.' });
  }

  const prompts = {
    quiz: `Você é um assistente educacional. A partir do texto abaixo, gere 5 perguntas de múltipla escolha com 4 alternativas cada (A, B, C, D) e indique a correta. Retorne SOMENTE JSON no formato:
{"perguntas": [{"pergunta": "...", "alternativas": ["A) ...", "B) ...", "C) ...", "D) ..."], "correta": "A"}]}

TEXTO:
${texto}`,

    forca: `A partir do texto abaixo, extraia 8 palavras importantes (substantivos ou termos-chave) e crie uma dica para cada uma. Retorne SOMENTE JSON:
{"palavras": [{"palavra": "EXEMPLO", "dica": "Dica sobre a palavra"}]}

TEXTO:
${texto}`,

    relacionar: `A partir do texto abaixo, crie 5 pares para jogo de relacionar colunas (conceito ↔ definição). Retorne SOMENTE JSON:
{"pares": [{"esquerda": "Conceito", "direita": "Definição"}]}

TEXTO:
${texto}`,

    cacapalavras: `A partir do texto abaixo, extraia 10 palavras importantes. Retorne SOMENTE JSON:
{"palavras": ["PALAVRA1", "PALAVRA2", "PALAVRA3", "PALAVRA4", "PALAVRA5", "PALAVRA6", "PALAVRA7", "PALAVRA8", "PALAVRA9", "PALAVRA10"]}

TEXTO:
${texto}`
  };

  const prompt = prompts[tipo] || prompts.quiz;

  try {
    const fetch = require('node-fetch');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ erro: data.error.message });

    const texto_resposta = data.content[0].text;
    const jsonMatch = texto_resposta.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ erro: 'IA não retornou JSON válido.' });

    const resultado = JSON.parse(jsonMatch[0]);
    res.json({ ok: true, resultado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao chamar a IA.' });
  }
});

// ── Serve o app para qualquer rota ──────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🦸 HeroQuiz rodando em http://localhost:${PORT}`);
});

// ===================================================
//  HeroQuiz — app.js  (lógica principal)
// ===================================================

// ── Estado Global ────────────────────────────────────
const state = {
  mode: 'individual',        // 'individual' | 'equipes'
  personagem: null,
  cenario: null,
  jogoAtual: null,           // objeto do jogo carregado
  quizIdx: 0,
  quizScore: 0,
  forcaIdx: 0,
  forcaScore: 0,
  forcaErros: 0,
  forcaLetrasCertas: [],
  forcaLetrasErradas: [],
  relSelectedLeft: null,
  relSelectedRight: null,
  relScore: 0,
  relMatched: 0,
  caixaScore: 0,
  cacaScore: 0,
  cacaTimer: null,
  cacaSeconds: 0,
  cacaGrid: [],
  cacaWords: [],
  cacaFound: [],
  cacaSelecting: false,
  cacaStartCell: null,
  cacaSelectedCells: [],
  teamScores: { a: 0, b: 0 },
  teamQIdx: 0,
  editorType: 'quiz',
  iaUnlocked: false,
  iaLastResult: null,
  savedGames: []
};

// ── Init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadSavedGames();
  renderChars('todos');
  renderTeamChars();
  renderSavedGamesList();
  initEditorQuiz();
  showScreen('home');
});

// ── Screen Manager ───────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + name);
  if (el) el.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const navEl = document.getElementById('nav-' + name);
  if (navEl) navEl.classList.add('active');

  window.scrollTo(0, 0);
}

function goHome() {
  showScreen('home');
}

// ── Modo ─────────────────────────────────────────────
function startMode(mode) {
  state.mode = mode;
  if (mode === 'individual') {
    showScreen('personagens');
  } else {
    showScreen('equipes');
  }
}

// ── Personagens ──────────────────────────────────────
function renderChars(filtro) {
  const grid = document.getElementById('chars-grid');
  const lista = filtro === 'todos'
    ? PERSONAGENS
    : PERSONAGENS.filter(p => p.tipo === filtro || p.genero === filtro);

  grid.innerHTML = lista.map(p => `
    <div class="char-card ${state.personagem?.id === p.id ? 'selected' : ''}"
         onclick="selectChar('${p.id}')" id="char-${p.id}">
      <span class="char-emoji">${p.emoji}</span>
      <div class="char-name">${p.nome}</div>
      <div class="char-type">${labelTipo(p.tipo)} · ${p.genero === 'feminino' ? '♀' : '♂'}</div>
    </div>
  `).join('');
}

function labelTipo(tipo) {
  return { heroi: 'Super-Herói', villao: 'Vilão', desenho: 'Animação' }[tipo] || tipo;
}

function filterChars(filtro) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderChars(filtro);
}

function selectChar(id) {
  state.personagem = PERSONAGENS.find(p => p.id === id);
  document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
  const el = document.getElementById('char-' + id);
  if (el) el.classList.add('selected');
  document.getElementById('btn-ir-cenario').disabled = false;
  showToast('Personagem selecionado: ' + state.personagem.nome + ' ' + state.personagem.emoji);
}

// ── Cenário ──────────────────────────────────────────
function selectScenario(id, nome, emoji) {
  state.cenario = { id, nome, emoji };
  document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  document.getElementById('btn-ir-preview').disabled = false;
  showToast('Cenário: ' + nome + ' ' + emoji);
}

// ── Preview Arena ────────────────────────────────────
function showPreview() {
  if (!state.personagem || !state.cenario) return;

  const bg = document.getElementById('arena-bg');
  bg.className = 'arena-bg arena-' + state.cenario.id;

  const chars = document.getElementById('arena-chars');
  chars.innerHTML = `
    <div class="arena-char">
      <span class="arena-char-emoji">${state.personagem.emoji}</span>
      <div class="arena-char-name">${state.personagem.nome}</div>
    </div>
    <div class="arena-char" style="font-size:2rem;margin-bottom:20px;">⚡</div>
    <div class="arena-char">
      <span class="arena-char-emoji">📚</span>
      <div class="arena-char-name">Desafio</div>
    </div>
  `;

  document.getElementById('arena-title').textContent = state.cenario.nome + ' ' + state.cenario.emoji;
  document.getElementById('arena-sub').textContent = state.personagem.nome + ' está pronto para a batalha!';

  showScreen('preview');
}

// ── Iniciar Jogo ─────────────────────────────────────
function startGame(tipo) {
  // Tenta carregar jogo salvo do tipo; senão usa exemplo
  const saved = state.savedGames.find(j => j.tipo === tipo);
  const exemplo = JOGOS_EXEMPLO.find(j => j.tipo === tipo);
  state.jogoAtual = saved || exemplo;

  if (!state.jogoAtual) { showToast('Nenhum jogo disponível para este tipo!'); return; }

  if (tipo === 'quiz') initQuiz();
  else if (tipo === 'forca') initForca();
  else if (tipo === 'relacionar') initRelacionar();
  else if (tipo === 'caixa') initCaixa();
  else if (tipo === 'cacapalavras') initCacaPalavras();
}

// ════════════════════════════════════════════════════
//  QUIZ
// ════════════════════════════════════════════════════
function initQuiz() {
  state.quizIdx = 0;
  state.quizScore = 0;
  updateQuizHeader();
  renderQuestion();
  showScreen('quiz');
}

function updateQuizHeader() {
  const total = state.jogoAtual.perguntas.length;
  const pct = (state.quizIdx / total) * 100;
  document.getElementById('quiz-progress-fill').style.width = pct + '%';
  document.getElementById('quiz-progress-text').textContent = `Pergunta ${state.quizIdx + 1} de ${total}`;
  document.getElementById('quiz-score').textContent = state.quizScore;

  if (state.personagem) {
    document.getElementById('quiz-char-emoji').textContent = state.personagem.emoji;
    document.getElementById('quiz-char-name').textContent = state.personagem.nome;
  }
  if (state.cenario) {
    document.getElementById('quiz-scenario-name').textContent = state.cenario.nome + ' ' + state.cenario.emoji;
  }
}

function renderQuestion() {
  const q = state.jogoAtual.perguntas[state.quizIdx];
  document.getElementById('quiz-question-num').textContent = `Pergunta ${state.quizIdx + 1}`;
  document.getElementById('quiz-question-text').textContent = q.pergunta;

  const letters = ['A', 'B', 'C', 'D'];
  document.getElementById('quiz-options').innerHTML = q.alternativas.map((alt, i) => `
    <button class="option-btn" onclick="answerQuiz(${i})">
      <span class="option-letter">${letters[i]}</span>
      <span>${alt.replace(/^[A-D]\)\s*/,'')}</span>
    </button>
  `).join('');

  document.getElementById('quiz-feedback').style.display = 'none';
  document.getElementById('btn-next-question').style.display = 'none';
}

function answerQuiz(idx) {
  const q = state.jogoAtual.perguntas[state.quizIdx];
  const btns = document.querySelectorAll('.option-btn');
  btns.forEach(b => b.disabled = true);

  const fb = document.getElementById('quiz-feedback');
  if (idx === q.correta) {
    btns[idx].classList.add('correct');
    state.quizScore += 10;
    document.getElementById('quiz-score').textContent = state.quizScore;
    fb.textContent = '✅ Correto! +10 pontos';
    fb.className = 'feedback-msg correct';
  } else {
    btns[idx].classList.add('wrong');
    btns[q.correta].classList.add('correct');
    fb.textContent = '❌ Errado! A correta era: ' + q.alternativas[q.correta];
    fb.className = 'feedback-msg wrong';
  }
  fb.style.display = 'block';
  document.getElementById('btn-next-question').style.display = 'inline-flex';
}

function nextQuestion() {
  state.quizIdx++;
  if (state.quizIdx >= state.jogoAtual.perguntas.length) {
    showResultado(state.quizScore);
    return;
  }
  updateQuizHeader();
  renderQuestion();
}

// ════════════════════════════════════════════════════
//  FORCA
// ════════════════════════════════════════════════════
function initForca() {
  state.forcaIdx = 0;
  state.forcaScore = 0;
  loadForcaWord();
  showScreen('forca');
}

function loadForcaWord() {
  const w = state.jogoAtual.palavras[state.forcaIdx];
  if (!w) { showResultado(state.forcaScore); return; }

  state.forcaErros = 0;
  state.forcaLetrasCertas = [];
  state.forcaLetrasErradas = [];

  document.getElementById('forca-score').textContent = state.forcaScore;
  document.getElementById('forca-dica').textContent = '💡 Dica: ' + w.dica;

  renderForcaPalavra(w.palavra);
  renderForcaKeyboard();
  renderForcaHearts();
  resetForcaSVG();
}

function renderForcaPalavra(palavra) {
  const container = document.getElementById('forca-palavra');
  container.innerHTML = palavra.split('').map(l => `
    <div class="forca-letra ${state.forcaLetrasCertas.includes(l) ? 'revealed' : ''}">
      ${state.forcaLetrasCertas.includes(l) ? l : ''}
    </div>
  `).join('');
}

function renderForcaKeyboard() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  document.getElementById('forca-keyboard').innerHTML = letters.split('').map(l => `
    <button class="key-btn ${state.forcaLetrasCertas.includes(l) ? 'right-key' : ''} ${state.forcaLetrasErradas.includes(l) ? 'wrong-key' : ''}"
            onclick="guessForca('${l}')"
            ${state.forcaLetrasCertas.includes(l) || state.forcaLetrasErradas.includes(l) ? 'disabled' : ''}>
      ${l}
    </button>
  `).join('');
}

function renderForcaHearts() {
  const max = 6;
  document.getElementById('forca-hearts').innerHTML =
    Array.from({length: max}, (_, i) =>
      `<span class="heart ${i >= (max - state.forcaErros) ? 'lost' : ''}">❤️</span>`
    ).join('');
}

const FORCA_PARTS = ['forca-head','forca-body','forca-larm','forca-rarm','forca-lleg','forca-rleg'];
function resetForcaSVG() {
  FORCA_PARTS.forEach(id => { const el = document.getElementById(id); if(el) el.setAttribute('opacity','0'); });
}
function showForcaPart(idx) {
  const el = document.getElementById(FORCA_PARTS[idx]);
  if (el) el.setAttribute('opacity','1');
}

function guessForca(letra) {
  const w = state.jogoAtual.palavras[state.forcaIdx];
  const palavra = w.palavra;

  if (palavra.includes(letra)) {
    state.forcaLetrasCertas.push(letra);
    renderForcaPalavra(palavra);
    // verifica vitória
    const allRevealed = palavra.split('').every(l => state.forcaLetrasCertas.includes(l));
    if (allRevealed) {
      state.forcaScore += 20;
      showToast('🎉 Palavra descoberta! +20 pontos');
      setTimeout(() => {
        state.forcaIdx++;
        loadForcaWord();
      }, 1500);
    }
  } else {
    state.forcaLetrasErradas.push(letra);
    state.forcaErros++;
    showForcaPart(state.forcaErros - 1);
    if (state.forcaErros >= 6) {
      showToast('💀 Fim! A palavra era: ' + palavra);
      setTimeout(() => {
        state.forcaIdx++;
        loadForcaWord();
      }, 2000);
    }
  }

  renderForcaKeyboard();
  renderForcaHearts();
  document.getElementById('forca-score').textContent = state.forcaScore;
}

// ════════════════════════════════════════════════════
//  RELACIONAR
// ════════════════════════════════════════════════════
function initRelacionar() {
  state.relSelectedLeft = null;
  state.relSelectedRight = null;
  state.relScore = 0;
  state.relMatched = 0;

  const pares = [...state.jogoAtual.pares];
  const esquerda = pares.map((p, i) => ({ id: i, texto: p.esquerda }));
  const direita = shuffle([...pares.map((p, i) => ({ id: i, texto: p.direita }))]);

  document.getElementById('rel-left').innerHTML = esquerda.map(item => `
    <div class="match-item" onclick="selectRelLeft(${item.id})" id="rel-left-${item.id}">${item.texto}</div>
  `).join('');

  document.getElementById('rel-right').innerHTML = direita.map(item => `
    <div class="match-item" onclick="selectRelRight(${item.id})" id="rel-right-${item.id}">${item.texto}</div>
  `).join('');

  document.getElementById('rel-score').textContent = 0;
  showScreen('relacionar');
}

function selectRelLeft(id) {
  document.querySelectorAll('#rel-left .match-item').forEach(el => {
    if (!el.classList.contains('matched-correct')) el.classList.remove('selected');
  });
  state.relSelectedLeft = id;
  const el = document.getElementById('rel-left-' + id);
  if (el && !el.classList.contains('matched-correct')) el.classList.add('selected');
  checkRelMatch();
}

function selectRelRight(id) {
  document.querySelectorAll('#rel-right .match-item').forEach(el => {
    if (!el.classList.contains('matched-correct')) el.classList.remove('selected');
  });
  state.relSelectedRight = id;
  const el = document.getElementById('rel-right-' + id);
  if (el && !el.classList.contains('matched-correct')) el.classList.add('selected');
  checkRelMatch();
}

function checkRelMatch() {
  if (state.relSelectedLeft === null || state.relSelectedRight === null) return;

  const left = document.getElementById('rel-left-' + state.relSelectedLeft);
  const right = document.getElementById('rel-right-' + state.relSelectedRight);

  if (state.relSelectedLeft === state.relSelectedRight) {
    left.classList.remove('selected'); left.classList.add('matched-correct');
    right.classList.remove('selected'); right.classList.add('matched-correct');
    state.relScore += 10; state.relMatched++;
    document.getElementById('rel-score').textContent = state.relScore;
    showToast('✅ Par correto! +10 pontos');

    if (state.relMatched >= state.jogoAtual.pares.length) {
      setTimeout(() => showResultado(state.relScore), 1000);
    }
  } else {
    left.classList.add('matched-wrong'); right.classList.add('matched-wrong');
    setTimeout(() => {
      left.classList.remove('matched-wrong','selected');
      right.classList.remove('matched-wrong','selected');
    }, 600);
  }

  state.relSelectedLeft = null;
  state.relSelectedRight = null;
}

function verificarRelacionar() {
  showToast('Continue combinando os pares!');
}

// ════════════════════════════════════════════════════
//  ABRIR CAIXA
// ════════════════════════════════════════════════════
function initCaixa() {
  state.caixaScore = 0;
  document.getElementById('caixa-score').textContent = 0;

  const emojis = ['📦','🎁','🗃️','🧧','📫','🎀','📮','🗄️'];
  const perguntas = state.jogoAtual.perguntas;

  document.getElementById('boxes-grid').innerHTML = perguntas.map((p, i) => `
    <div class="box-item" onclick="openBox(${i})" id="box-${i}">
      ${emojis[i % emojis.length]}
      <div class="box-content">
        <div class="box-content-text">Pergunta ${i+1}</div>
      </div>
    </div>
  `).join('');

  document.getElementById('box-reveal-question').classList.remove('active');
  showScreen('caixa');
}

function openBox(idx) {
  const box = document.getElementById('box-' + idx);
  if (box.classList.contains('opened')) return;
  box.classList.add('opened');

  const q = state.jogoAtual.perguntas[idx];
  document.getElementById('box-question-text').textContent = q.pergunta;

  const letters = ['A','B','C','D'];
  document.getElementById('box-options').innerHTML = q.alternativas.map((alt, i) => `
    <button class="option-btn" onclick="answerCaixa(${idx}, ${i})">
      <span class="option-letter">${letters[i]}</span>
      <span>${alt.replace(/^[A-D]\)\s*/,'')}</span>
    </button>
  `).join('');

  document.getElementById('box-feedback').style.display = 'none';
  document.getElementById('box-reveal-question').classList.add('active');
}

function answerCaixa(boxIdx, answerIdx) {
  const q = state.jogoAtual.perguntas[boxIdx];
  const btns = document.querySelectorAll('#box-options .option-btn');
  btns.forEach(b => b.disabled = true);

  const fb = document.getElementById('box-feedback');
  if (answerIdx === q.correta) {
    btns[answerIdx].classList.add('correct');
    state.caixaScore += 10;
    document.getElementById('caixa-score').textContent = state.caixaScore;
    fb.textContent = '✅ Correto! +10 pontos';
    fb.className = 'feedback-msg correct';
  } else {
    btns[answerIdx].classList.add('wrong');
    btns[q.correta].classList.add('correct');
    fb.textContent = '❌ A correta era: ' + q.alternativas[q.correta];
    fb.className = 'feedback-msg wrong';
  }
  fb.style.display = 'block';

  const allOpened = [...document.querySelectorAll('.box-item')].every(b => b.classList.contains('opened'));
  if (allOpened) {
    setTimeout(() => showResultado(state.caixaScore), 1500);
  }
}

// ════════════════════════════════════════════════════
//  CAÇA-PALAVRAS
// ════════════════════════════════════════════════════
function initCacaPalavras() {
  state.cacaScore = 0;
  state.cacaFound = [];
  state.cacaSeconds = 0;
  state.cacaSelecting = false;
  state.cacaSelectedCells = [];
  state.cacaWords = state.jogoAtual.palavras.map(w => w.toUpperCase());

  clearInterval(state.cacaTimer);
  state.cacaTimer = setInterval(() => {
    state.cacaSeconds++;
    const m = String(Math.floor(state.cacaSeconds/60)).padStart(2,'0');
    const s = String(state.cacaSeconds%60).padStart(2,'0');
    document.getElementById('caca-timer').textContent = `${m}:${s}`;
  }, 1000);

  generateWordGrid();
  renderWordGrid();
  renderWordList();
  document.getElementById('caca-score').textContent = 0;
  showScreen('cacapalavras');
}

function generateWordGrid() {
  const size = 14;
  const grid = Array.from({length: size}, () => Array(size).fill(''));
  const words = state.cacaWords.slice(0, 8);
  const directions = [[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]];

  for (const word of words) {
    let placed = false;
    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const dir = directions[Math.floor(Math.random() * 4)]; // apenas 4 direções
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (canPlace(grid, word, row, col, dir, size)) {
        for (let i = 0; i < word.length; i++) {
          grid[row + dir[0]*i][col + dir[1]*i] = word[i];
        }
        placed = true;
      }
    }
  }

  const alpha = 'ABCDEFGHIJKLMNOPRSTUVWXYZ';
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!grid[r][c]) grid[r][c] = alpha[Math.floor(Math.random() * alpha.length)];

  state.cacaGrid = grid;
  state.cacaSize = size;
}

function canPlace(grid, word, row, col, dir, size) {
  for (let i = 0; i < word.length; i++) {
    const r = row + dir[0]*i;
    const c = col + dir[1]*i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] && grid[r][c] !== word[i]) return false;
  }
  return true;
}

function renderWordGrid() {
  const grid = document.getElementById('word-grid');
  grid.style.gridTemplateColumns = `repeat(${state.cacaSize}, 36px)`;

  grid.innerHTML = '';
  for (let r = 0; r < state.cacaSize; r++) {
    for (let c = 0; c < state.cacaSize; c++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.textContent = state.cacaGrid[r][c];
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.addEventListener('mousedown', startSelect);
      cell.addEventListener('mouseover', continueSelect);
      cell.addEventListener('mouseup', endSelect);
      cell.addEventListener('touchstart', e => { e.preventDefault(); startSelect(e.touches[0]); }, {passive:false});
      cell.addEventListener('touchmove', e => { e.preventDefault(); const t = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY); if(t && t.classList.contains('grid-cell')) continueSelect({target:t}); }, {passive:false});
      cell.addEventListener('touchend', endSelect);
      grid.appendChild(cell);
    }
  }
}

function startSelect(e) {
  state.cacaSelecting = true;
  state.cacaStartCell = e.target;
  state.cacaSelectedCells = [e.target];
  highlightSelected();
}

function continueSelect(e) {
  if (!state.cacaSelecting) return;
  const cell = e.target;
  if (!cell.classList.contains('grid-cell')) return;

  const sr = +state.cacaStartCell.dataset.r;
  const sc = +state.cacaStartCell.dataset.c;
  const er = +cell.dataset.r;
  const ec = +cell.dataset.c;

  const dr = Math.sign(er - sr);
  const dc = Math.sign(ec - sc);
  const steps = Math.max(Math.abs(er - sr), Math.abs(ec - sc));

  if ((dr === 0 || dc === 0 || Math.abs(er-sr) === Math.abs(ec-sc))) {
    state.cacaSelectedCells = [];
    for (let i = 0; i <= steps; i++) {
      const cellEl = document.querySelector(`.grid-cell[data-r="${sr + dr*i}"][data-c="${sc + dc*i}"]`);
      if (cellEl) state.cacaSelectedCells.push(cellEl);
    }
    highlightSelected();
  }
}

function endSelect() {
  if (!state.cacaSelecting) return;
  state.cacaSelecting = false;

  const word = state.cacaSelectedCells.map(c => c.textContent).join('');
  const wordRev = word.split('').reverse().join('');

  if (state.cacaWords.includes(word) && !state.cacaFound.includes(word)) {
    markFound(word);
  } else if (state.cacaWords.includes(wordRev) && !state.cacaFound.includes(wordRev)) {
    markFound(wordRev);
  } else {
    state.cacaSelectedCells.forEach(c => c.classList.remove('selecting'));
    state.cacaSelectedCells = [];
  }
}

function highlightSelected() {
  document.querySelectorAll('.grid-cell.selecting').forEach(c => c.classList.remove('selecting'));
  state.cacaSelectedCells.forEach(c => c.classList.add('selecting'));
}

function markFound(word) {
  state.cacaFound.push(word);
  state.cacaScore += 15;
  document.getElementById('caca-score').textContent = state.cacaScore;

  state.cacaSelectedCells.forEach(c => {
    c.classList.remove('selecting');
    c.classList.add('found');
  });
  state.cacaSelectedCells = [];

  // update word list
  document.querySelectorAll('.word-list-item').forEach(el => {
    if (el.dataset.word === word) el.classList.add('found');
  });

  showToast('🎉 ' + word + ' encontrada! +15 pts');

  if (state.cacaFound.length >= state.cacaWords.length) {
    clearInterval(state.cacaTimer);
    setTimeout(() => showResultado(state.cacaScore), 1000);
  }
}

function renderWordList() {
  document.getElementById('words-to-find').innerHTML =
    state.cacaWords.map(w => `
      <div class="word-list-item ${state.cacaFound.includes(w) ? 'found' : ''}" data-word="${w}">${w}</div>
    `).join('');
}

// ════════════════════════════════════════════════════
//  EQUIPES
// ════════════════════════════════════════════════════
function renderTeamChars() {
  const mini = PERSONAGENS.slice(0, 12);
  ['a','b'].forEach(team => {
    const container = document.getElementById('team-' + team + '-chars');
    if (!container) return;
    container.innerHTML = mini.map(p => `
      <div onclick="toggleTeamChar('${team}','${p.id}')"
           id="team-${team}-char-${p.id}"
           style="cursor:pointer;font-size:1.6rem;opacity:0.4;transition:all 0.2s;border-radius:8px;padding:2px;"
           title="${p.nome}">
        ${p.emoji}
      </div>
    `).join('');
  });
}

function toggleTeamChar(team, charId) {
  const el = document.getElementById(`team-${team}-char-${charId}`);
  if (!el) return;
  const active = el.style.opacity === '1';
  el.style.opacity = active ? '0.4' : '1';
  el.style.background = active ? 'transparent' : 'rgba(124,58,237,0.2)';
}

function startTeamGame(tipo) {
  const nameA = document.getElementById('team-a-name').value || 'Time A';
  const nameB = document.getElementById('team-b-name').value || 'Time B';

  state.teamScores = { a: 0, b: 0 };
  state.teamQIdx = 0;
  state.teamGame = tipo;

  document.getElementById('team-a-display').textContent = nameA;
  document.getElementById('team-b-display').textContent = nameB;
  document.getElementById('team-a-score').textContent = '0';
  document.getElementById('team-b-score').textContent = '0';

  const jogo = state.savedGames.find(j => j.tipo === tipo) || JOGOS_EXEMPLO.find(j => j.tipo === tipo);
  if (!jogo) { showToast('Nenhum jogo disponível!'); return; }
  state.jogoAtual = jogo;

  document.getElementById('equipes-setup').style.display = 'none';
  document.getElementById('equipes-scoreboard').style.display = 'block';
  renderTeamQuestion();
}

function renderTeamQuestion() {
  const perguntas = state.jogoAtual.perguntas || state.jogoAtual.palavras || [];
  if (!perguntas.length || state.teamQIdx >= perguntas.length) {
    endTeamGame(); return;
  }
  const q = perguntas[state.teamQIdx];

  if (state.teamGame === 'forca') {
    document.getElementById('team-current-question').textContent = `💡 Dica: ${q.dica} — Palavra com ${q.palavra.length} letras`;
    document.getElementById('team-options').innerHTML = `
      <div style="font-size:0.9rem;color:var(--muted);">
        O professor clica em "+10 pts" para a equipe que acertar primeiro!
      </div>`;
  } else {
    document.getElementById('team-current-question').textContent = q.pergunta;
    const letters = ['A','B','C','D'];
    document.getElementById('team-options').innerHTML = (q.alternativas || []).map((alt, i) => `
      <div style="padding:10px 14px;background:var(--card2);border-radius:10px;font-weight:700;">
        ${letters[i]}) ${alt.replace(/^[A-D]\)\s*/,'')}
      </div>
    `).join('');
  }
}

function addTeamPoint(team) {
  state.teamScores[team] += 10;
  document.getElementById(`team-${team}-score`).textContent = state.teamScores[team];
  showToast('+10 pontos para o ' + (team === 'a' ? document.getElementById('team-a-display').textContent : document.getElementById('team-b-display').textContent) + '!');
  nextTeamQuestion();
}

function nextTeamQuestion() {
  state.teamQIdx++;
  renderTeamQuestion();
}

function endTeamGame() {
  const sa = state.teamScores.a;
  const sb = state.teamScores.b;
  const winner = sa > sb ? document.getElementById('team-a-display').textContent :
                 sb > sa ? document.getElementById('team-b-display').textContent : 'Empate!';

  showToast('🏆 Fim de jogo! Vencedor: ' + winner);
  document.getElementById('equipes-setup').style.display = 'block';
  document.getElementById('equipes-scoreboard').style.display = 'none';
}

// ════════════════════════════════════════════════════
//  RESULTADO
// ════════════════════════════════════════════════════
function showResultado(score) {
  clearInterval(state.cacaTimer);
  launchConfetti();

  document.getElementById('resultado-score').textContent = score;

  const msgs = ['Incrível! Você é um verdadeiro herói! 🦸', 'Muito bem! Continue assim! ⭐', 'Bom trabalho! Pratique mais! 💪'];
  document.getElementById('resultado-msg').textContent = score >= 40 ? msgs[0] : score >= 20 ? msgs[1] : msgs[2];

  // Podium com o personagem
  const char = state.personagem;
  if (char) {
    document.getElementById('resultado-podium').innerHTML = `
      <div class="podium-place">
        <div class="podium-char">${char.emoji}</div>
        <div class="podium-name">${char.nome}</div>
        <div class="podium-score">${score} pts</div>
        <div class="podium-block first">🥇</div>
      </div>
    `;
  }

  showScreen('resultado');
}

function launchConfetti() {
  const colors = ['#7c3aed','#ec4899','#f59e0b','#10b981','#3b82f6','#f97316'];
  for (let i = 0; i < 60; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.cssText = `
        left: ${Math.random() * 100}%;
        background: ${colors[Math.floor(Math.random()*colors.length)]};
        width: ${6+Math.random()*8}px;
        height: ${12+Math.random()*12}px;
        animation-duration: ${1.5+Math.random()*2}s;
        animation-delay: ${Math.random()*0.5}s;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      `;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 3000);
    }, i * 30);
  }
}

// ════════════════════════════════════════════════════
//  EDITOR
// ════════════════════════════════════════════════════
function setEditorType(tipo) {
  state.editorType = tipo;
  ['quiz','forca','relacionar','caixa','cacapalavras'].forEach(t => {
    const btn = document.getElementById('edit-btn-'+t);
    const sec = document.getElementById('editor-'+t+'-section');
    if (btn) btn.classList.toggle('active', t === tipo);
    if (sec) sec.classList.toggle('hidden', t !== tipo);
  });
}

function initEditorQuiz() {
  if (!document.querySelector('#quiz-questions-list .question-item')) addQuizQuestion();
  if (!document.querySelector('#forca-words-list .question-item')) addForcaWord();
  if (!document.querySelector('#relacionar-pairs-list .question-item')) addRelacionarPar();
  if (!document.querySelector('#caixa-questions-list .question-item')) addCaixaQuestion();
  if (!document.querySelector('#caca-words-list .question-item')) addCacaWord();
}

function addQuizQuestion() {
  const list = document.getElementById('quiz-questions-list');
  const idx = list.children.length + 1;
  const div = document.createElement('div');
  div.className = 'question-item';
  div.innerHTML = `
    <div class="question-item-header">
      <span class="question-item-num">Pergunta ${idx}</span>
      <button class="remove-btn" onclick="this.closest('.question-item').remove()">Remover</button>
    </div>
    <div class="form-group">
      <label class="form-label">Pergunta</label>
      <input type="text" class="form-input q-pergunta" placeholder="Digite a pergunta...">
    </div>
    <div class="form-group">
      <label class="form-label">Alternativas (marque a correta)</label>
      ${['A','B','C','D'].map((l,i) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <input type="radio" name="correta-q${idx}" value="${i}" ${i===0?'checked':''}>
          <input type="text" class="form-input q-alt-${i}" placeholder="Alternativa ${l}..." style="margin-bottom:0;">
        </div>
      `).join('')}
    </div>
  `;
  list.appendChild(div);
}

function addForcaWord() {
  const list = document.getElementById('forca-words-list');
  const div = document.createElement('div');
  div.className = 'question-item';
  div.innerHTML = `
    <div class="question-item-header">
      <span class="question-item-num">Palavra ${list.children.length + 1}</span>
      <button class="remove-btn" onclick="this.closest('.question-item').remove()">Remover</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 2fr;gap:10px;">
      <div class="form-group" style="margin:0;">
        <label class="form-label">Palavra (maiúsculo)</label>
        <input type="text" class="form-input forca-palavra-input" placeholder="EX: CELULA" style="text-transform:uppercase;">
      </div>
      <div class="form-group" style="margin:0;">
        <label class="form-label">Dica</label>
        <input type="text" class="form-input forca-dica-input" placeholder="Dica para os alunos...">
      </div>
    </div>
  `;
  list.appendChild(div);
}

function addRelacionarPar() {
  const list = document.getElementById('relacionar-pairs-list');
  const div = document.createElement('div');
  div.className = 'question-item';
  div.innerHTML = `
    <div class="question-item-header">
      <span class="question-item-num">Par ${list.children.length + 1}</span>
      <button class="remove-btn" onclick="this.closest('.question-item').remove()">Remover</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div class="form-group" style="margin:0;">
        <label class="form-label">Coluna Esquerda</label>
        <input type="text" class="form-input rel-esquerda" placeholder="Conceito, termo...">
      </div>
      <div class="form-group" style="margin:0;">
        <label class="form-label">Coluna Direita</label>
        <input type="text" class="form-input rel-direita" placeholder="Definição, resposta...">
      </div>
    </div>
  `;
  list.appendChild(div);
}

function addCaixaQuestion() {
  const list = document.getElementById('caixa-questions-list');
  const idx = list.children.length + 1;
  const div = document.createElement('div');
  div.className = 'question-item';
  div.innerHTML = `
    <div class="question-item-header">
      <span class="question-item-num">📦 Caixa ${idx}</span>
      <button class="remove-btn" onclick="this.closest('.question-item').remove()">Remover</button>
    </div>
    <div class="form-group">
      <label class="form-label">Pergunta</label>
      <input type="text" class="form-input cx-pergunta" placeholder="Digite a pergunta...">
    </div>
    <div class="form-group">
      <label class="form-label">Alternativas</label>
      ${['A','B','C','D'].map((l,i) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <input type="radio" name="cx-correta-${idx}" value="${i}" ${i===0?'checked':''}>
          <input type="text" class="form-input cx-alt-${i}" placeholder="Alternativa ${l}..." style="margin-bottom:0;">
        </div>
      `).join('')}
    </div>
  `;
  list.appendChild(div);
}

function addCacaWord() {
  const list = document.getElementById('caca-words-list');
  if (list.children.length >= 10) { showToast('Máximo de 10 palavras!'); return; }
  const div = document.createElement('div');
  div.className = 'question-item';
  div.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span class="question-item-num">${list.children.length + 1}.</span>
      <input type="text" class="form-input caca-word-input" placeholder="PALAVRA (maiúsculo)" style="text-transform:uppercase;margin:0;flex:1;">
      <button class="remove-btn" onclick="this.closest('.question-item').remove()">✕</button>
    </div>
  `;
  list.appendChild(div);
}

function collectEditorData() {
  const tipo = state.editorType;
  const titulo = document.getElementById('editor-titulo').value || 'Jogo sem título';
  const materia = document.getElementById('editor-materia').value || '';

  let content = {};

  if (tipo === 'quiz' || tipo === 'caixa') {
    const items = document.querySelectorAll(`#editor-${tipo === 'caixa' ? 'caixa' : 'quiz'}-section .question-item`);
    const key = tipo === 'caixa' ? 'cx' : 'q';
    content.perguntas = [...items].map(item => {
      const pergunta = item.querySelector(`.${key}-pergunta`)?.value || '';
      const alternativas = ['A','B','C','D'].map((l,i) => item.querySelector(`.${key}-alt-${i}`)?.value || `Alternativa ${l}`);
      const radioName = tipo === 'caixa' ? item.querySelector('input[type=radio]')?.name : '';
      const radios = tipo === 'caixa'
        ? item.querySelectorAll('input[type=radio]')
        : item.querySelectorAll('input[type=radio]');
      let correta = 0;
      radios.forEach((r,i) => { if(r.checked) correta = i; });
      return { pergunta, alternativas, correta };
    });
  } else if (tipo === 'forca') {
    const items = document.querySelectorAll('#forca-words-list .question-item');
    content.palavras = [...items].map(item => ({
      palavra: (item.querySelector('.forca-palavra-input')?.value || '').toUpperCase(),
      dica: item.querySelector('.forca-dica-input')?.value || ''
    })).filter(p => p.palavra);
  } else if (tipo === 'relacionar') {
    const items = document.querySelectorAll('#relacionar-pairs-list .question-item');
    content.pares = [...items].map(item => ({
      esquerda: item.querySelector('.rel-esquerda')?.value || '',
      direita: item.querySelector('.rel-direita')?.value || ''
    })).filter(p => p.esquerda && p.direita);
  } else if (tipo === 'cacapalavras') {
    const items = document.querySelectorAll('#caca-words-list .question-item');
    content.palavras = [...items].map(item =>
      (item.querySelector('.caca-word-input')?.value || '').toUpperCase()
    ).filter(w => w);
  }

  return { tipo, titulo, materia, ...content };
}

function saveGame() {
  const jogo = collectEditorData();
  if (!jogo.titulo) { showToast('Dê um título ao jogo!'); return; }

  // Salva localmente
  const existing = state.savedGames.findIndex(j => j.titulo === jogo.titulo && j.tipo === jogo.tipo);
  if (existing >= 0) state.savedGames[existing] = { ...state.savedGames[existing], ...jogo };
  else state.savedGames.push({ id: Date.now().toString(), ...jogo });

  localStorage.setItem('heroquest_games', JSON.stringify(state.savedGames));

  // Salva no servidor também
  fetch('/api/jogos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jogo)
  }).catch(() => {});

  renderSavedGamesList();
  showToast('💾 Jogo salvo: ' + jogo.titulo);
}

function playCurrentEditor() {
  const jogo = collectEditorData();
  state.jogoAtual = jogo;
  startGame(jogo.tipo);
}

function clearEditor() {
  document.getElementById('editor-titulo').value = '';
  document.getElementById('editor-materia').value = '';
  document.getElementById('quiz-questions-list').innerHTML = '';
  document.getElementById('forca-words-list').innerHTML = '';
  document.getElementById('relacionar-pairs-list').innerHTML = '';
  document.getElementById('caixa-questions-list').innerHTML = '';
  document.getElementById('caca-words-list').innerHTML = '';
}

function loadSavedGames() {
  try {
    const stored = localStorage.getItem('heroquest_games');
    state.savedGames = stored ? JSON.parse(stored) : [];
  } catch { state.savedGames = []; }
}

function renderSavedGamesList() {
  const list = document.getElementById('saved-games-list');
  if (!list) return;
  const all = [...JOGOS_EXEMPLO, ...state.savedGames];
  list.innerHTML = all.slice(-6).map(j => `
    <div style="background:var(--card2);border-radius:8px;padding:8px 10px;font-size:0.8rem;cursor:pointer;border:1px solid rgba(124,58,237,0.15);"
         onclick="loadGameToPlay('${j.id || j.tipo}')">
      <div style="font-weight:800;">${j.titulo}</div>
      <div style="color:var(--muted);">${j.materia || j.tipo}</div>
    </div>
  `).join('');
}

function loadGameToPlay(id) {
  const jogo = [...JOGOS_EXEMPLO, ...state.savedGames].find(j => j.id === id || j.tipo === id);
  if (!jogo) return;
  state.jogoAtual = jogo;
  startGame(jogo.tipo);
}

// ════════════════════════════════════════════════════
//  ASSISTENTE DE IA
// ════════════════════════════════════════════════════
const IA_UNLOCK_CODE = 'DEMO2024';

function unlockIA() {
  const code = document.getElementById('unlock-code-input').value.trim().toUpperCase();
  if (code === IA_UNLOCK_CODE || code === 'UNLOCK') {
    state.iaUnlocked = true;
    document.getElementById('ia-gate').style.display = 'none';
    document.getElementById('ia-unlocked').style.display = 'block';
    showToast('🔓 IA Desbloqueada! Bem-vindo(a)!');
  } else {
    showToast('❌ Código inválido. Verifique o código enviado após o pagamento.');
  }
}

async function gerarComIA() {
  const texto = document.getElementById('ia-texto').value.trim();
  const tipo = document.getElementById('ia-tipo').value;

  if (!texto || texto.length < 50) {
    showToast('Por favor, cole um texto maior (mínimo 50 caracteres).');
    return;
  }

  const btn = document.querySelector('#screen-ia .btn-primary');
  btn.disabled = true;
  btn.textContent = 'Gerando...';

  const resultDiv = document.getElementById('ia-result');
  const content = document.getElementById('ia-result-content');
  resultDiv.classList.remove('active');
  content.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
  resultDiv.classList.add('active');

  try {
    const res = await fetch('/api/ia/gerar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, tipo })
    });
    const data = await res.json();

    if (!data.ok) throw new Error(data.erro);

    state.iaLastResult = { tipo, resultado: data.resultado };
    renderIAResult(tipo, data.resultado);
    showToast('✨ Conteúdo gerado com sucesso!');
  } catch (err) {
    content.innerHTML = `<div style="color:var(--red);font-weight:700;">❌ Erro: ${err.message}</div>`;
    showToast('Erro ao gerar com IA.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '🤖 Gerar com IA';
  }
}

function renderIAResult(tipo, resultado) {
  const content = document.getElementById('ia-result-content');

  if (tipo === 'quiz' && resultado.perguntas) {
    content.innerHTML = resultado.perguntas.map((p, i) => `
      <div class="ia-result-item">
        <strong>Pergunta ${i+1}</strong>
        <div style="font-weight:700;margin-bottom:6px;">${p.pergunta}</div>
        ${p.alternativas.map(a => `<div style="font-size:0.85rem;color:var(--muted);">• ${a}</div>`).join('')}
        <div style="margin-top:6px;color:var(--green);font-size:0.85rem;">✅ Correta: ${p.correta}</div>
      </div>
    `).join('');
  } else if (tipo === 'forca' && resultado.palavras) {
    content.innerHTML = resultado.palavras.map(p => `
      <div class="ia-result-item">
        <strong>Palavra</strong>
        <span style="font-family:'Bangers',cursive;font-size:1.3rem;letter-spacing:2px;">${p.palavra}</span>
        <div style="font-size:0.85rem;color:var(--muted);margin-top:4px;">💡 ${p.dica}</div>
      </div>
    `).join('');
  } else if (tipo === 'relacionar' && resultado.pares) {
    content.innerHTML = resultado.pares.map(p => `
      <div class="ia-result-item">
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;">
          <span style="font-weight:700;">${p.esquerda}</span>
          <span>↔️</span>
          <span style="color:var(--primary-light);">${p.direita}</span>
        </div>
      </div>
    `).join('');
  } else if (tipo === 'cacapalavras' && resultado.palavras) {
    content.innerHTML = `
      <div class="ia-result-item">
        <strong>Palavras para o Caça-Palavras:</strong>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
          ${resultado.palavras.map(w => `<span style="background:var(--primary);padding:4px 10px;border-radius:6px;font-weight:700;font-size:0.85rem;">${w}</span>`).join('')}
        </div>
      </div>
    `;
  }
}

function importarParaEditor() {
  if (!state.iaLastResult) return;
  const { tipo, resultado } = state.iaLastResult;

  setEditorType(tipo);
  showScreen('editor');

  setTimeout(() => {
    if (tipo === 'quiz' && resultado.perguntas) {
      document.getElementById('quiz-questions-list').innerHTML = '';
      resultado.perguntas.forEach((p, idx) => {
        addQuizQuestion();
        const items = document.querySelectorAll('#quiz-questions-list .question-item');
        const item = items[items.length - 1];
        if (item.querySelector('.q-pergunta')) item.querySelector('.q-pergunta').value = p.pergunta;
        p.alternativas.forEach((alt, i) => {
          const input = item.querySelector(`.q-alt-${i}`);
          if (input) input.value = alt;
        });
        // marca correta
        const radios = item.querySelectorAll('input[type=radio]');
        const correctIndex = ['A','B','C','D'].findIndex(l => p.correta === l || p.correta === `${l})`);
        if (radios[correctIndex >= 0 ? correctIndex : 0]) radios[correctIndex >= 0 ? correctIndex : 0].checked = true;
      });
    } else if (tipo === 'forca' && resultado.palavras) {
      document.getElementById('forca-words-list').innerHTML = '';
      resultado.palavras.forEach(p => {
        addForcaWord();
        const items = document.querySelectorAll('#forca-words-list .question-item');
        const item = items[items.length - 1];
        if (item.querySelector('.forca-palavra-input')) item.querySelector('.forca-palavra-input').value = p.palavra.toUpperCase();
        if (item.querySelector('.forca-dica-input')) item.querySelector('.forca-dica-input').value = p.dica;
      });
    } else if (tipo === 'relacionar' && resultado.pares) {
      document.getElementById('relacionar-pairs-list').innerHTML = '';
      resultado.pares.forEach(p => {
        addRelacionarPar();
        const items = document.querySelectorAll('#relacionar-pairs-list .question-item');
        const item = items[items.length - 1];
        if (item.querySelector('.rel-esquerda')) item.querySelector('.rel-esquerda').value = p.esquerda;
        if (item.querySelector('.rel-direita')) item.querySelector('.rel-direita').value = p.direita;
      });
    } else if (tipo === 'cacapalavras' && resultado.palavras) {
      document.getElementById('caca-words-list').innerHTML = '';
      resultado.palavras.forEach(w => {
        addCacaWord();
        const items = document.querySelectorAll('#caca-words-list .question-item');
        const item = items[items.length - 1];
        if (item.querySelector('.caca-word-input')) item.querySelector('.caca-word-input').value = w.toUpperCase();
      });
    }
    showToast('📥 Importado para o Editor!');
  }, 300);
}

function jogarGerado() {
  if (!state.iaLastResult) return;
  const { tipo, resultado } = state.iaLastResult;

  if (tipo === 'quiz') state.jogoAtual = { tipo, titulo: 'Gerado pela IA', materia: '', perguntas: resultado.perguntas.map(p => ({
    pergunta: p.pergunta,
    alternativas: p.alternativas,
    correta: ['A','B','C','D'].findIndex(l => p.correta === l || p.correta === `${l})`) || 0
  }))};
  else if (tipo === 'forca') state.jogoAtual = { tipo, titulo: 'Gerado pela IA', materia: '', palavras: resultado.palavras };
  else if (tipo === 'relacionar') state.jogoAtual = { tipo, titulo: 'Gerado pela IA', materia: '', pares: resultado.pares };
  else if (tipo === 'cacapalavras') state.jogoAtual = { tipo, titulo: 'Gerado pela IA', materia: '', palavras: resultado.palavras };

  startGame(tipo);
}

// ════════════════════════════════════════════════════
//  UTILS
// ════════════════════════════════════════════════════
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

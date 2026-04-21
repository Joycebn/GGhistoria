// ===== PERSONAGENS =====
const PERSONAGENS = [
  // Super-Heróis Masculinos
  { id: 'superman', emoji: '🦸', nome: 'Superman', tipo: 'heroi', genero: 'masculino', cor: '#0033cc' },
  { id: 'batman', emoji: '🦇', nome: 'Batman', tipo: 'heroi', genero: 'masculino', cor: '#1a1a2e' },
  { id: 'homem-aranha', emoji: '🕷️', nome: 'Homem-Aranha', tipo: 'heroi', genero: 'masculino', cor: '#cc0000' },
  { id: 'flash', emoji: '⚡', nome: 'Flash', tipo: 'heroi', genero: 'masculino', cor: '#cc0000' },
  { id: 'thor', emoji: '🔨', nome: 'Thor', tipo: 'heroi', genero: 'masculino', cor: '#003399' },
  { id: 'capitao', emoji: '🛡️', nome: 'Capitão América', tipo: 'heroi', genero: 'masculino', cor: '#003399' },
  { id: 'hulk', emoji: '💚', nome: 'Hulk', tipo: 'heroi', genero: 'masculino', cor: '#006600' },
  { id: 'homem-ferro', emoji: '🤖', nome: 'Homem de Ferro', tipo: 'heroi', genero: 'masculino', cor: '#cc3300' },
  { id: 'aquaman', emoji: '🔱', nome: 'Aquaman', tipo: 'heroi', genero: 'masculino', cor: '#006699' },
  { id: 'lanterna', emoji: '💚', nome: 'Lanterna Verde', tipo: 'heroi', genero: 'masculino', cor: '#006600' },
  // Super-Heroínas Femininas
  { id: 'mulher-maravilha', emoji: '⭐', nome: 'Mulher-Maravilha', tipo: 'heroi', genero: 'feminino', cor: '#cc0000' },
  { id: 'capitã-marvel', emoji: '✨', nome: 'Capitã Marvel', tipo: 'heroi', genero: 'feminino', cor: '#6600cc' },
  { id: 'mulher-gato', emoji: '🐱', nome: 'Mulher-Gato', tipo: 'heroi', genero: 'feminino', cor: '#1a1a1a' },
  { id: 'viuva', emoji: '🕸️', nome: 'Viúva Negra', tipo: 'heroi', genero: 'feminino', cor: '#1a1a1a' },
  { id: 'tempestade', emoji: '⛈️', nome: 'Tempestade', tipo: 'heroi', genero: 'feminino', cor: '#6600cc' },
  { id: 'supergirl', emoji: '💫', nome: 'Supergirl', tipo: 'heroi', genero: 'feminino', cor: '#0033cc' },
  // Vilões
  { id: 'coringa', emoji: '🃏', nome: 'Coringa', tipo: 'villao', genero: 'masculino', cor: '#6600cc' },
  { id: 'thanos', emoji: '💜', nome: 'Thanos', tipo: 'villao', genero: 'masculino', cor: '#4a0080' },
  { id: 'duende', emoji: '💚', nome: 'Duende Verde', tipo: 'villao', genero: 'masculino', cor: '#006600' },
  { id: 'lex', emoji: '🔬', nome: 'Lex Luthor', tipo: 'villao', genero: 'masculino', cor: '#006600' },
  // Desenhos Animados - Masculinos
  { id: 'naruto', emoji: '🍥', nome: 'Naruto', tipo: 'desenho', genero: 'masculino', cor: '#ff6600' },
  { id: 'goku', emoji: '🐉', nome: 'Goku', tipo: 'desenho', genero: 'masculino', cor: '#ff6600' },
  { id: 'sonic', emoji: '💨', nome: 'Sonic', tipo: 'desenho', genero: 'masculino', cor: '#0033cc' },
  { id: 'pikachu', emoji: '⚡', nome: 'Pikachu', tipo: 'desenho', genero: 'masculino', cor: '#ffcc00' },
  { id: 'simba', emoji: '🦁', nome: 'Simba', tipo: 'desenho', genero: 'masculino', cor: '#cc8800' },
  // Desenhos Animados - Femininos
  { id: 'sailor', emoji: '🌙', nome: 'Sailor Moon', tipo: 'desenho', genero: 'feminino', cor: '#ff99cc' },
  { id: 'moana', emoji: '🌊', nome: 'Moana', tipo: 'desenho', genero: 'feminino', cor: '#006699' },
  { id: 'elsa', emoji: '❄️', nome: 'Elsa', tipo: 'desenho', genero: 'feminino', cor: '#6699ff' },
  { id: 'hermione', emoji: '📚', nome: 'Hermione', tipo: 'desenho', genero: 'feminino', cor: '#990000' },
  { id: 'mulan', emoji: '🏮', nome: 'Mulan', tipo: 'desenho', genero: 'feminino', cor: '#cc0000' },
  { id: 'raven', emoji: '🌑', nome: 'Raven', tipo: 'desenho', genero: 'feminino', cor: '#4a0080' },
];

// ===== JOGOS DE EXEMPLO =====
const JOGOS_EXEMPLO = [
  {
    id: 'quiz-matematica',
    tipo: 'quiz',
    titulo: 'Equações do 1º Grau',
    materia: 'Matemática',
    perguntas: [
      {
        pergunta: 'Qual é a solução da equação 2x + 4 = 10?',
        alternativas: ['A) x = 2', 'B) x = 3', 'C) x = 4', 'D) x = 7'],
        correta: 1
      },
      {
        pergunta: 'Na equação 3x = 15, quanto vale x?',
        alternativas: ['A) 3', 'B) 4', 'C) 5', 'D) 6'],
        correta: 2
      },
      {
        pergunta: 'Qual é o valor de x em: x - 7 = 3?',
        alternativas: ['A) 4', 'B) 10', 'C) -4', 'D) 21'],
        correta: 1
      },
      {
        pergunta: 'Resolva: 5x + 2 = 22',
        alternativas: ['A) x = 3', 'B) x = 4', 'C) x = 5', 'D) x = 6'],
        correta: 1
      },
      {
        pergunta: 'Se 2x - 6 = 0, então x é igual a:',
        alternativas: ['A) 2', 'B) 3', 'C) 6', 'D) 12'],
        correta: 1
      }
    ]
  },
  {
    id: 'forca-ciencias',
    tipo: 'forca',
    titulo: 'Ciências da Natureza',
    materia: 'Ciências',
    palavras: [
      { palavra: 'FOTOSSINTESE', dica: 'Processo que as plantas usam para produzir alimento' },
      { palavra: 'CELULA', dica: 'Unidade básica da vida' },
      { palavra: 'MITOCONDRIA', dica: 'Organela responsável pela produção de energia' },
      { palavra: 'NUCLEO', dica: 'Centro de controle da célula' },
      { palavra: 'PROTEINA', dica: 'Molécula formada por aminoácidos' },
      { palavra: 'OSSIGÊNIO', dica: 'Gás essencial para a respiração' }
    ]
  },
  {
    id: 'relacionar-historia',
    tipo: 'relacionar',
    titulo: 'Revoluções Históricas',
    materia: 'História',
    pares: [
      { esquerda: 'Revolução Francesa', direita: '1789' },
      { esquerda: 'Independência do Brasil', direita: '1822' },
      { esquerda: 'Revolução Industrial', direita: 'Inglaterra' },
      { esquerda: 'Segunda Guerra Mundial', direita: '1939-1945' },
      { esquerda: 'Abolição da Escravatura', direita: 'Lei Áurea' }
    ]
  },
  {
    id: 'caixa-portugues',
    tipo: 'caixa',
    titulo: 'Gramática Portuguesa',
    materia: 'Português',
    perguntas: [
      {
        pergunta: 'O que é um substantivo?',
        alternativas: ['A) Palavra que modifica o verbo', 'B) Palavra que nomeia seres', 'C) Palavra que indica ação', 'D) Palavra que liga orações'],
        correta: 1
      },
      {
        pergunta: 'Qual é o plural de "cidadão"?',
        alternativas: ['A) cidadãos', 'B) cidadões', 'C) cidadãs', 'D) cidadãos ou cidadões'],
        correta: 3
      },
      {
        pergunta: 'O que é uma metáfora?',
        alternativas: ['A) Comparação com "como"', 'B) Exagero proposital', 'C) Comparação sem termo comparativo', 'D) Repetição de sons'],
        correta: 2
      },
      {
        pergunta: 'Qual destas palavras é um advérbio?',
        alternativas: ['A) Bonito', 'B) Correr', 'C) Rapidamente', 'D) Casa'],
        correta: 2
      }
    ]
  },
  {
    id: 'caca-geografia',
    tipo: 'cacapalavras',
    titulo: 'Capitais do Brasil',
    materia: 'Geografia',
    palavras: ['BRASILIA', 'SALVADOR', 'MANAUS', 'BELEM', 'RECIFE', 'FORTALEZA', 'NATAL', 'MACEIO', 'ARACAJU', 'MACAPA']
  }
];

// Exporta para uso global
window.PERSONAGENS = PERSONAGENS;
window.JOGOS_EXEMPLO = JOGOS_EXEMPLO;

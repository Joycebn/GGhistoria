# 🦸 HeroQuiz — Plataforma de Jogos Educativos

Plataforma de jogos educativos com super-heróis e personagens animados, para professores e alunos.

## 🎮 Funcionalidades

- **5 tipos de jogos**: Quiz, Forca, Relacionar Colunas, Abrir a Caixa, Caça-Palavras
- **Modo Individual**: cada aluno escolhe seu personagem e cenário
- **Modo Equipes**: professor controla, pontuação automática
- **Editor de Jogos**: crie e edite jogos, funciona offline (salva no navegador)
- **Assistente de IA**: cole um texto e a IA gera o jogo automaticamente (requer contribuição de R$5)
- **30+ personagens**: super-heróis, vilões e personagens de animação (femininos e masculinos)
- **6 cenários**: Metrópole, Espaço, Floresta, Vulcão, Oceano, Ártico

---

## 🚀 Deploy no Render

### Passo 1 — Suba o projeto no GitHub

1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos desta pasta

### Passo 2 — Configure no Render

1. Acesse https://render.com e faça login
2. Clique em **New → Web Service**
3. Conecte seu repositório do GitHub
4. Configure assim:
   - **Name**: heroquest (ou qualquer nome)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

### Passo 3 — Variáveis de Ambiente

No painel do Render, vá em **Environment** e adicione:

```
ANTHROPIC_API_KEY = sua-chave-aqui (sk-ant-...)
```

### Passo 4 — (Opcional) Configure a chave PIX da IA

Abra o arquivo `public/index.html` e procure por:
```html
<div class="pix-key" id="pix-key-display">PIX: sua-chave-pix@email.com</div>
```
Troque pelo seu e-mail ou chave PIX real.

Para personalizar os códigos de desbloqueio, abra `public/js/app.js` e edite:
```javascript
const IA_UNLOCK_CODE = 'DEMO2024';
```

---

## 💻 Rodar Localmente (Offline)

```bash
# Instale as dependências
npm install

# Crie o arquivo .env (copie o .env.example)
cp .env.example .env
# Edite .env e coloque sua chave da Anthropic

# Rode o servidor
npm start
# Acesse: http://localhost:3000
```

---

## 📁 Estrutura do Projeto

```
heroquest/
├── server.js          # Servidor Express
├── package.json
├── .env.example       # Modelo de variáveis de ambiente
├── data/              # Jogos salvos (JSON)
└── public/
    ├── index.html     # App principal
    ├── css/
    │   └── style.css
    └── js/
        ├── data.js    # Personagens e jogos de exemplo
        └── app.js     # Toda a lógica dos jogos
```

---

## 🔐 Sistema de Desbloqueio da IA

O sistema funciona assim:
1. Professor tenta usar a IA → vê a tela de contribuição
2. Faz o PIX de R$5,00 para a chave configurada
3. Você gera um código manualmente e envia para o professor
4. Ele digita o código → IA é desbloqueada

Para demo/teste, o código é: **DEMO2024**

---

## 🎨 Personagens disponíveis

**Super-Heróis Masculinos**: Superman, Batman, Homem-Aranha, Flash, Thor, Capitão América, Hulk, Homem de Ferro, Aquaman, Lanterna Verde

**Super-Heroínas Femininas**: Mulher-Maravilha, Capitã Marvel, Mulher-Gato, Viúva Negra, Tempestade, Supergirl

**Vilões**: Coringa, Thanos, Duende Verde, Lex Luthor

**Animações Masculinas**: Naruto, Goku, Sonic, Pikachu, Simba

**Animações Femininas**: Sailor Moon, Moana, Elsa, Hermione, Mulan, Raven

# MarketSync

AI-baserad jobbmatchningsplattform för arbetssökande inom IT.

---

## Vad gör appen?

1. **Hämtar jobb** från Arbetsförmedlingen
2. **Du klistrar in ditt CV** som text
3. **Du klickar på ett jobb**
4. **AI:n analyserar** hur bra ditt CV matchar jobbet

---

## Kom igång

### 1. Skaffa Groq API-nyckel (gratis)

1. Gå till [console.groq.com](https://console.groq.com)
2. Skapa konto (kan logga in med Google)
3. Klicka på "API Keys" → "Create API Key"
4. Kopiera nyckeln

### 2. Konfigurera projektet

Öppna `js/config.js` och klistra in din nyckel:

```javascript
const CONFIG = {
    GROQ_API_KEY: 'din-nyckel-här'  // ← Byt ut detta
};

export default CONFIG;
```

**OBS!** Glöm inte citattecknen runt nyckeln!

### 3. Starta servern

Projektet kräver en lokal server (på grund av ES-moduler).

**Med Python:**
```bash
python -m http.server 8000
```

**Med Node.js:**
```bash
npx live-server
```

### 4. Öppna i webbläsaren

Gå till: `http://localhost:8000`

---

## Projektstruktur

```
marketsync/
├── index.html          ← Huvudsidan
├── css/
│   └── style.css       ← All styling
├── js/
│   ├── main.js         ← Hjärnan - kopplar ihop allt
│   ├── config.js       ← API-nyckel (gitignored)
│   ├── api/
│   │   ├── jobsApi.js  ← Hämtar jobb från Arbetsförmedlingen
│   │   └── geminiApi.js← Skickar till AI (Groq)
│   ├── ui/
│   │   ├── jobList.js  ← Visar jobbkorten
│   │   ├── cvForm.js   ← Hanterar CV-inmatning
│   │   └── analysisView.js ← Visar analysresultatet
│   └── utils/
│       └── helpers.js  ← Hjälpfunktioner
└── .gitignore          ← Skyddar config.js
```

---

## Hur flödet fungerar

```
Sidan laddas
     │
     ▼
main.js startar
     │
     ├──► Hämtar jobb från Arbetsförmedlingen
     │              │
     │              ▼
     │         Visar jobbkort
     │
     ├──► Lyssnar på CV-inmatning
     │              │
     │              ▼
     │         Grön prick när CV finns
     │
     └──► Lyssnar på jobbklick
                    │
                    ▼
              Skickar CV + jobb till AI
                    │
                    ▼
              Visar analysresultat
```

---

## Teknologier

| Teknik | Används till |
|--------|--------------|
| HTML | Sidans struktur |
| CSS | Styling och layout |
| JavaScript (ES6) | All logik |
| [Jobtech API](https://jobsearch.api.jobtechdev.se) | Hämtar jobb |
| [Groq API](https://groq.com) | AI-analys |

---
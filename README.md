# MarketSync

AI-baserad jobbmatchningsplattform med fokus på IT-branschen.

## Beskrivning

MarketSync hjälper arbetssökande att förstå hur väl deras kompetens matchar aktuella jobbannonser. Applikationen hämtar jobb från Arbetsförmedlingen och använder Gemini AI för att analysera matchning mellan användarens CV och utvalda jobb.

## Funktioner

- **Jobblista**: Hämtar och visar IT-relaterade jobb från Arbetsförmedlingen
- **Jobbsökning**: Filtrera jobb baserat på sökord
- **CV-inmatning**: Klistra in ditt CV som text
- **AI-analys**: Analyserar matchning med tre tydliga avsnitt:
  - Vad som matchar
  - Vad som saknas
  - Samlad bedömning och slutsats

## Installation

1. Klona eller ladda ner projektet

2. Kopiera config-mallen och lägg till din API-nyckel:
   ```bash
   cp js/config.example.js js/config.js
   ```

3. Öppna `js/config.js` och ersätt `'din-api-nyckel-här'` med din Gemini API-nyckel

4. Starta en lokal server (eftersom projektet använder ES-moduler):
   ```bash
   # Med Python 3
   python -m http.server 8000
   
   # Med Node.js (om du har live-server)
   npx live-server
   ```

5. Öppna `http://localhost:8000` i webbläsaren

## Skaffa Gemini API-nyckel

1. Gå till [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Klicka på "Create API Key"
3. Kopiera nyckeln och klistra in i `js/config.js`

## Projektstruktur

```
marketsync/
├── index.html              # Huvudsida
├── css/
│   └── style.css           # Styling
├── js/
│   ├── config.js           # API-nyckel (gitignored)
│   ├── config.example.js   # Mall för config
│   ├── main.js             # Huvudlogik
│   ├── api/
│   │   ├── jobsApi.js      # Arbetsförmedlingen API
│   │   └── geminiApi.js    # Gemini AI API
│   ├── ui/
│   │   ├── jobList.js      # Jobblista UI
│   │   ├── cvForm.js       # CV-formulär UI
│   │   └── analysisView.js # Analys UI
│   └── utils/
│       └── helpers.js      # Hjälpfunktioner
├── .gitignore
└── README.md
```

## Teknologier

- Vanilla JavaScript (ES6 Modules)
- CSS3
- [Jobtech Job Search API](https://jobsearch.api.jobtechdev.se)
- [Gemini AI API](https://ai.google.dev/)

## Säkerhet

⚠️ **OBS**: I denna prototyp exponeras Gemini API-nyckeln i frontend. Detta är acceptabelt för ett skolprojekt men **inte för produktion**.

I en produktionsmiljö bör API-anrop till Gemini ske via en backend-server för att skydda nyckeln.

## Licens

Skolprojekt - fri användning för utbildningssyfte.

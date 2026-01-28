/**
 * API-modul för Gemini AI-analys
 * Hanterar matchning mellan CV och jobbannonser
 */

import CONFIG from '../config.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Skapar prompt för jobbmatchningsanalys
 * @param {string} cvText - Användarens CV som text
 * @param {object} job - Jobbinformation
 * @returns {string} - Komplett prompt
 */
function createAnalysisPrompt(cvText, job) {
    return `Du är en erfaren teknisk rekryterare inom IT-branschen. Din uppgift är att analysera hur väl en kandidats CV matchar en jobbannons.

JOBBANNONS:
Titel: ${job.title}
Företag: ${job.company}
Plats: ${job.location}
Yrkesroll: ${job.occupation}
Krav: ${job.requirements.join(', ') || 'Ej specificerat'}
Meriterande: ${job.niceToHave.join(', ') || 'Ej specificerat'}

Beskrivning:
${job.description}

---

KANDIDATENS CV:
${cvText}

---

INSTRUKTIONER:
Analysera matchningen mellan kandidaten och jobbet. Var objektiv och teknisk - inte coachande eller marknadsförande.

Svara ENDAST med ett JSON-objekt i följande format (ingen annan text):
{
    "matchningar": "En sammanhängande text (minst 3-4 meningar) som beskriver vilka kompetenser, erfarenheter och delar av CV:t som matchar jobbannonsens krav och arbetsuppgifter.",
    "saknas": "En sammanhängande text (minst 3-4 meningar) som beskriver vilka krav, tekniker, erfarenhetsnivåer eller ansvarsområden som inte täcks av CV:t eller där matchningen är svag.",
    "bedömning": "En sammanhängande text (minst 2-3 meningar) med en helhetsbedömning av om jobbet är lämpligt för kandidaten baserat på realistisk teknisk analys.",
    "slutsats": "Lämpligt" | "Delvis lämpligt" | "Ej lämpligt"
}

Var nyanserad och ärlig i din analys. Undvik överdrivet positiva eller negativa formuleringar.`;
}

/**
 * Analyserar matchning mellan CV och jobb med Gemini
 * @param {string} cvText - Användarens CV
 * @param {object} job - Strukturerad jobbdata
 * @returns {Promise<object>} - Analysresultat
 */
export async function analyzeJobMatch(cvText, job) {
    // Kontrollera att API-nyckel finns
    if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === 'SÄTT-IN-DIN-NYCKEL-HÄR') {
        throw new Error('Gemini API-nyckel saknas. Uppdatera js/config.js med din nyckel.');
    }
    
    const prompt = createAnalysisPrompt(cvText, job);
    
    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500
        }
    };
    
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API-fel: ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        
        // Extrahera texten från svaret
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!responseText) {
            throw new Error('Inget svar från Gemini');
        }
        
        // Försök parsa JSON från svaret
        return parseGeminiResponse(responseText);
        
    } catch (error) {
        console.error('Fel vid AI-analys:', error);
        throw error;
    }
}

/**
 * Parsar Geminis svar och extraherar JSON
 * @param {string} responseText - Rå text från Gemini
 * @returns {object} - Strukturerat analysresultat
 */
function parseGeminiResponse(responseText) {
    // Ta bort eventuella markdown-kodblock
    let cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
    
    try {
        const result = JSON.parse(cleanedText);
        
        // Validera att alla fält finns
        const requiredFields = ['matchningar', 'saknas', 'bedömning', 'slutsats'];
        for (const field of requiredFields) {
            if (!result[field]) {
                throw new Error(`Saknar fält: ${field}`);
            }
        }
        
        // Validera slutsats
        const validConclusions = ['Lämpligt', 'Delvis lämpligt', 'Ej lämpligt'];
        if (!validConclusions.includes(result.slutsats)) {
            result.slutsats = 'Delvis lämpligt'; // Fallback
        }
        
        return result;
        
    } catch (parseError) {
        console.error('Kunde inte parsa Gemini-svar:', parseError);
        console.log('Råtext:', cleanedText);
        
        // Returnera ett standardsvar vid fel
        return {
            matchningar: 'Kunde inte analysera matchningar automatiskt.',
            saknas: 'Kunde inte identifiera saknade kvalifikationer automatiskt.',
            bedömning: 'Analysen kunde inte genomföras korrekt. Försök igen eller kontrollera att CV:t är tydligt formaterat.',
            slutsats: 'Delvis lämpligt'
        };
    }
}

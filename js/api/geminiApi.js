/**
 * API-modul för AI-analys med Groq
 * Hanterar matchning mellan CV och jobbannonser
 */

import CONFIG from '../config.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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
 * Analyserar matchning mellan CV och jobb med Groq
 * @param {string} cvText - Användarens CV
 * @param {object} job - Strukturerad jobbdata
 * @returns {Promise<object>} - Analysresultat
 */
export async function analyzeJobMatch(cvText, job) {
    // Kontrollera att API-nyckel finns
    if (!CONFIG.GROQ_API_KEY || CONFIG.GROQ_API_KEY === 'din-groq-nyckel-här') {
        throw new Error('Groq API-nyckel saknas. Uppdatera js/config.js med din nyckel.');
    }
    
    const prompt = createAnalysisPrompt(cvText, job);
    
    const requestBody = {
        model: 'llama-3.1-8b-instant',
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 1500
    };
    
    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.GROQ_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API-fel: ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        
        // Extrahera texten från svaret
        const responseText = data.choices?.[0]?.message?.content;
        
        if (!responseText) {
            throw new Error('Inget svar från AI');
        }
        
        // Försök parsa JSON från svaret
        return parseAIResponse(responseText);
        
    } catch (error) {
        console.error('Fel vid AI-analys:', error);
        throw error;
    }
}

/**
 * Parsar AI-svaret och extraherar JSON
 * @param {string} responseText - Rå text från AI
 * @returns {object} - Strukturerat analysresultat
 */
function parseAIResponse(responseText) {
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
        console.error('Kunde inte parsa AI-svar:', parseError);
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

/**
 * UI-modul för att visa analysresultat
 */

import { showLoading, showError } from '../utils/helpers.js';

/**
 * Visar laddningsstatus för analys
 * @param {HTMLElement} container - Analyscontainern
 */
export function showAnalysisLoading(container) {
    showLoading(container, 'Analyserar matchning med AI...');
}

/**
 * Visar ett fel i analysvyn
 * @param {HTMLElement} container - Analyscontainern
 * @param {string} message - Felmeddelande
 */
export function showAnalysisError(container, message) {
    showError(container, message);
}

/**
 * Visar analysresultatet
 * @param {HTMLElement} container - Analyscontainern
 * @param {object} analysis - Analysresultat från Gemini
 * @param {object} job - Jobbet som analyserades
 */
export function renderAnalysis(container, analysis, job) {
    // Bestäm CSS-klass baserat på slutsats
    const conclusionClass = getConclusionClass(analysis.slutsats);
    
    container.innerHTML = `
        <div class="analysis-header">
            <h3>${job.title}</h3>
            <p>${job.company} • ${job.location}</p>
        </div>
        
        <div class="analysis-block">
            <h4><span class="analysis-icon">✅</span> Vad som matchar</h4>
            <p>${analysis.matchningar}</p>
        </div>
        
        <div class="analysis-block">
            <h4><span class="analysis-icon">⚠️</span> Vad som saknas eller är svagt</h4>
            <p>${analysis.saknas}</p>
        </div>
        
        <div class="analysis-block">
            <h4><span class="analysis-icon">📊</span> Samlad bedömning</h4>
            <p>${analysis.bedömning}</p>
        </div>
        
        <div class="analysis-conclusion ${conclusionClass}">
            <h4>Slutsats: ${analysis.slutsats}</h4>
            <p>${getConclusionDescription(analysis.slutsats)}</p>
        </div>
    `;
}

/**
 * Visar placeholder när inget jobb är valt
 * @param {HTMLElement} placeholder - Placeholder-elementet
 * @param {HTMLElement} result - Resultat-elementet
 */
export function showPlaceholder(placeholder, result) {
    placeholder.style.display = 'block';
    result.style.display = 'none';
}

/**
 * Visar resultat och döljer placeholder
 * @param {HTMLElement} placeholder - Placeholder-elementet
 * @param {HTMLElement} result - Resultat-elementet
 */
export function showResult(placeholder, result) {
    placeholder.style.display = 'none';
    result.style.display = 'block';
}

/**
 * Returnerar CSS-klass baserat på slutsats
 * @param {string} conclusion - Slutsatsen
 * @returns {string} - CSS-klass
 */
function getConclusionClass(conclusion) {
    switch (conclusion) {
        case 'Lämpligt':
            return 'suitable';
        case 'Delvis lämpligt':
            return 'partial';
        case 'Ej lämpligt':
            return 'unsuitable';
        default:
            return 'partial';
    }
}

/**
 * Returnerar beskrivning för slutsatsen
 * @param {string} conclusion - Slutsatsen
 * @returns {string} - Beskrivning
 */
function getConclusionDescription(conclusion) {
    switch (conclusion) {
        case 'Lämpligt':
            return 'Din profil matchar väl med jobbets krav. Det kan vara värt att söka.';
        case 'Delvis lämpligt':
            return 'Det finns viss matchning, men även gap. Överväg om du vill satsa på ansökan.';
        case 'Ej lämpligt':
            return 'Din profil matchar inte tillräckligt med kraven för denna roll.';
        default:
            return '';
    }
}

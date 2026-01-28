/**
 * Hjälpfunktioner för MarketSync
 */

/**
 * Förkortar en text till ett visst antal tecken
 * @param {string} text - Texten som ska förkortas
 * @param {number} maxLength - Max antal tecken
 * @returns {string} - Förkortad text med ... om den klipptes
 */
export function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Formaterar datum till svenskt format
 * @param {string} dateString - Datum som sträng
 * @returns {string} - Formaterat datum
 */
export function formatDate(dateString) {
    if (!dateString) return 'Okänt datum';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Skapar ett HTML-element med klasser och innehåll
 * @param {string} tag - HTML-tagg
 * @param {string} className - CSS-klasser
 * @param {string} content - Textinnehåll
 * @returns {HTMLElement}
 */
export function createElement(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
}

/**
 * Visar ett laddningsmeddelande i ett element
 * @param {HTMLElement} container - Elementet att visa laddning i
 * @param {string} message - Meddelande att visa
 */
export function showLoading(container, message = 'Laddar...') {
    container.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
    `;
}

/**
 * Visar ett felmeddelande i ett element
 * @param {HTMLElement} container - Elementet att visa fel i
 * @param {string} message - Felmeddelande
 */
export function showError(container, message) {
    container.innerHTML = `
        <div class="error-message">
            <strong>Något gick fel:</strong> ${message}
        </div>
    `;
}

/**
 * Avgör om ett jobb är IT-relaterat baserat på titel och beskrivning
 * @param {object} job - Jobbobjekt
 * @returns {boolean}
 */
export function isITJob(job) {
    const itKeywords = [
        'utvecklare', 'developer', 'programmerare', 'frontend', 'backend', 
        'fullstack', 'devops', 'it-', 'data', 'system', 'webb', 'web',
        'software', 'mjukvara', 'cloud', 'moln', 'java', 'python', 
        'javascript', '.net', 'react', 'angular', 'vue', 'node',
        'databas', 'database', 'sql', 'api', 'tech', 'teknik'
    ];
    
    const title = (job.headline || '').toLowerCase();
    const description = (job.description?.text || '').toLowerCase();
    const occupation = (job.occupation?.label || '').toLowerCase();
    
    const textToCheck = `${title} ${description} ${occupation}`;
    
    return itKeywords.some(keyword => textToCheck.includes(keyword));
}

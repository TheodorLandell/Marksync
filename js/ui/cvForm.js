/**
 * UI-modul för CV-hantering
 */

/**
 * Initierar CV-formuläret
 * @param {HTMLTextAreaElement} textarea - CV-textfältet
 * @param {HTMLElement} statusElement - Status-elementet
 * @param {Function} onChange - Callback när CV ändras
 */
export function initCVForm(textarea, statusElement, onChange) {
    // Lyssna på ändringar i textfältet
    textarea.addEventListener('input', () => {
        const cvText = textarea.value.trim();
        updateCVStatus(cvText, statusElement);
        onChange(cvText);
    });
    
    // Initial status
    updateCVStatus('', statusElement);
}

/**
 * Uppdaterar CV-statusen
 * @param {string} cvText - CV-texten
 * @param {HTMLElement} statusElement - Status-elementet
 */
function updateCVStatus(cvText, statusElement) {
    const statusText = statusElement.querySelector('.status-text');
    
    if (cvText.length > 50) {
        // CV är inläst
        statusElement.classList.add('active');
        const wordCount = cvText.split(/\s+/).length;
        statusText.textContent = `CV inläst (${wordCount} ord)`;
    } else if (cvText.length > 0) {
        // För kort
        statusElement.classList.remove('active');
        statusText.textContent = 'CV för kort (minst 50 tecken)';
    } else {
        // Inget CV
        statusElement.classList.remove('active');
        statusText.textContent = 'Inget CV inläst';
    }
}

/**
 * Hämtar CV-texten
 * @param {HTMLTextAreaElement} textarea - CV-textfältet
 * @returns {string|null} - CV-texten eller null om för kort
 */
export function getCVText(textarea) {
    const text = textarea.value.trim();
    
    if (text.length < 50) {
        return null;
    }
    
    return text;
}

/**
 * Validerar att CV är tillräckligt långt
 * @param {string} cvText - CV-texten
 * @returns {boolean}
 */
export function isValidCV(cvText) {
    return cvText && cvText.trim().length >= 50;
}

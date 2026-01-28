/**
 * UI-modul för att rendera jobblistan
 */

import { truncateText, formatDate } from '../utils/helpers.js';
import { parseJobData } from '../api/jobsApi.js';

/**
 * Renderar jobblistan i DOM
 * @param {Array} jobs - Lista med jobb från API:et
 * @param {HTMLElement} container - Element att rendera i
 * @param {Function} onSelectJob - Callback när ett jobb väljs
 */
export function renderJobList(jobs, container, onSelectJob) {
    // Rensa containern
    container.innerHTML = '';
    
    if (jobs.length === 0) {
        container.innerHTML = '<p class="no-jobs">Inga jobb hittades.</p>';
        return;
    }
    
    // Skapa kort för varje jobb
    jobs.forEach(rawJob => {
        const job = parseJobData(rawJob);
        const card = createJobCard(job, onSelectJob);
        container.appendChild(card);
    });
}

/**
 * Skapar ett jobbkort
 * @param {object} job - Strukturerad jobbdata
 * @param {Function} onSelect - Callback vid klick
 * @returns {HTMLElement}
 */
function createJobCard(job, onSelect) {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.dataset.jobId = job.id;
    
    // Titel
    const title = document.createElement('h3');
    title.className = 'job-card-title';
    title.textContent = truncateText(job.title, 60);
    
    // Företag
    const company = document.createElement('p');
    company.className = 'job-card-company';
    company.textContent = job.company;
    
    // Meta (plats och datum)
    const meta = document.createElement('div');
    meta.className = 'job-card-meta';
    meta.innerHTML = `
        <span>📍 ${job.location}</span>
        <span>📅 ${formatDate(job.published)}</span>
    `;
    
    // Tagg för yrkesroll
    if (job.occupation) {
        const tag = document.createElement('span');
        tag.className = 'job-card-tag';
        tag.textContent = truncateText(job.occupation, 30);
        card.appendChild(tag);
    }
    
    // Bygg kortet
    card.appendChild(title);
    card.appendChild(company);
    card.appendChild(meta);
    
    // Klick-hantering
    card.addEventListener('click', () => {
        // Ta bort "selected" från alla kort
        document.querySelectorAll('.job-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Markera detta kort
        card.classList.add('selected');
        
        // Anropa callback
        onSelect(job);
    });
    
    return card;
}

/**
 * Uppdaterar jobbinfo-texten
 * @param {number} count - Antal jobb
 * @param {string} searchTerm - Söktermen som användes
 * @param {HTMLElement} infoElement - Element att uppdatera
 */
export function updateJobsInfo(count, searchTerm, infoElement) {
    if (searchTerm) {
        infoElement.textContent = `Visar ${count} jobb för "${searchTerm}"`;
    } else {
        infoElement.textContent = `Visar ${count} IT-jobb`;
    }
}

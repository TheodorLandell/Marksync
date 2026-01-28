/**
 * MarketSync - Huvudfil
 * Kopplar ihop alla moduler och hanterar applikationslogik
 */

import { fetchJobs, fetchITJobs } from './api/jobsApi.js';
import { analyzeJobMatch } from './api/geminiApi.js';
import { renderJobList, updateJobsInfo } from './ui/jobList.js';
import { initCVForm, getCVText, isValidCV } from './ui/cvForm.js';
import { 
    showAnalysisLoading, 
    showAnalysisError, 
    renderAnalysis,
    showPlaceholder,
    showResult 
} from './ui/analysisView.js';
import { showLoading, showError } from './utils/helpers.js';

// ============================================
// DOM-element
// ============================================

const elements = {
    // CV-sektion
    cvInput: document.getElementById('cv-input'),
    cvStatus: document.getElementById('cv-status'),
    
    // Jobb-sektion
    searchInput: document.getElementById('search-input'),
    searchButton: document.getElementById('search-button'),
    jobsInfo: document.getElementById('jobs-info'),
    jobsList: document.getElementById('jobs-list'),
    
    // Analys-sektion
    analysisPlaceholder: document.getElementById('analysis-placeholder'),
    analysisResult: document.getElementById('analysis-result')
};

// ============================================
// Applikationsstate
// ============================================

const state = {
    cvText: '',
    jobs: [],
    selectedJob: null,
    isLoading: false
};

// ============================================
// Funktioner
// ============================================

/**
 * Laddar jobb vid uppstart eller sökning
 * @param {string} searchTerm - Valfri sökterm
 */
async function loadJobs(searchTerm = '') {
    state.isLoading = true;
    showLoading(elements.jobsList, 'Hämtar jobb från Arbetsförmedlingen...');
    
    try {
        let jobs;
        
        if (searchTerm.trim()) {
            // Sök med angiven term
            jobs = await fetchJobs({ query: searchTerm, limit: 30 });
        } else {
            // Hämta IT-jobb som standard
            jobs = await fetchITJobs(30);
        }
        
        state.jobs = jobs;
        
        // Rendera jobblistan
        renderJobList(jobs, elements.jobsList, handleJobSelect);
        
        // Uppdatera info
        updateJobsInfo(jobs.length, searchTerm, elements.jobsInfo);
        
    } catch (error) {
        showError(elements.jobsList, 'Kunde inte hämta jobb. Försök igen senare.');
        console.error('Fel vid laddning av jobb:', error);
    } finally {
        state.isLoading = false;
    }
}

/**
 * Hanterar när ett jobb väljs
 * @param {object} job - Det valda jobbet
 */
async function handleJobSelect(job) {
    state.selectedJob = job;
    
    // Kontrollera om CV finns
    const cvText = getCVText(elements.cvInput);
    
    if (!isValidCV(cvText)) {
        showResult(elements.analysisPlaceholder, elements.analysisResult);
        elements.analysisResult.innerHTML = `
            <div class="analysis-header">
                <h3>${job.title}</h3>
                <p>${job.company} • ${job.location}</p>
            </div>
            <div class="error-message">
                <strong>CV saknas</strong><br>
                Klistra in ditt CV i rutan till vänster för att få en matchningsanalys.
            </div>
        `;
        return;
    }
    
    // Kör analys
    await runAnalysis(job, cvText);
}

/**
 * Kör AI-analys för ett jobb
 * @param {object} job - Jobbet att analysera
 * @param {string} cvText - CV-texten
 */
async function runAnalysis(job, cvText) {
    showResult(elements.analysisPlaceholder, elements.analysisResult);
    showAnalysisLoading(elements.analysisResult);
    
    try {
        const analysis = await analyzeJobMatch(cvText, job);
        renderAnalysis(elements.analysisResult, analysis, job);
        
    } catch (error) {
        showAnalysisError(elements.analysisResult, error.message);
        console.error('Fel vid analys:', error);
    }
}

/**
 * Hanterar sökning
 */
function handleSearch() {
    const searchTerm = elements.searchInput.value.trim();
    loadJobs(searchTerm);
    
    // Återställ analys
    showPlaceholder(elements.analysisPlaceholder, elements.analysisResult);
    state.selectedJob = null;
}

/**
 * Hanterar CV-ändringar
 * @param {string} cvText - Uppdaterad CV-text
 */
function handleCVChange(cvText) {
    state.cvText = cvText;
    
    // Om ett jobb redan är valt och CV nu är giltigt, kör analys
    if (state.selectedJob && isValidCV(cvText)) {
        runAnalysis(state.selectedJob, cvText);
    }
}

// ============================================
// Event listeners
// ============================================

function setupEventListeners() {
    // Sök-knapp
    elements.searchButton.addEventListener('click', handleSearch);
    
    // Enter i sökfältet
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

// ============================================
// Initiering
// ============================================

function init() {
    console.log('MarketSync startar...');
    
    // Sätt upp CV-formuläret
    initCVForm(elements.cvInput, elements.cvStatus, handleCVChange);
    
    // Sätt upp event listeners
    setupEventListeners();
    
    // Ladda jobb vid start
    loadJobs();
    
    console.log('MarketSync redo!');
}

// Starta appen när DOM är redo
document.addEventListener('DOMContentLoaded', init);

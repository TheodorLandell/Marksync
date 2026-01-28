/**
 * API-modul för att hämta jobb från Arbetsförmedlingen
 * Använder Jobtech Job Search API
 */

const API_BASE_URL = 'https://jobsearch.api.jobtechdev.se';

/**
 * Hämtar jobbannonser från Arbetsförmedlingen
 * @param {object} options - Sökalternativ
 * @param {string} options.query - Sökord (t.ex. "frontend utvecklare")
 * @param {number} options.limit - Max antal resultat (standard: 20)
 * @returns {Promise<Array>} - Lista med jobb
 */
export async function fetchJobs(options = {}) {
    const { query = '', limit = 20 } = options;
    
    // Bygg URL med sökparametrar
    const params = new URLSearchParams({
        limit: limit.toString(),
        offset: '0'
    });
    
    // Lägg till sökord om det finns
    if (query.trim()) {
        params.append('q', query.trim());
    }
    
    const url = `${API_BASE_URL}/search?${params.toString()}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API-fel: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Returnera jobblistan
        return data.hits || [];
        
    } catch (error) {
        console.error('Fel vid hämtning av jobb:', error);
        throw error;
    }
}

/**
 * Hämtar IT-relaterade jobb
 * Söker på vanliga IT-termer
 * @param {number} limit - Max antal resultat
 * @returns {Promise<Array>} - Lista med IT-jobb
 */
export async function fetchITJobs(limit = 30) {
    // Sök på "utvecklare" för att få relevanta IT-jobb
    return fetchJobs({ 
        query: 'utvecklare', 
        limit 
    });
}

/**
 * Hämtar detaljer för ett specifikt jobb
 * @param {string} jobId - Jobbets ID
 * @returns {Promise<object>} - Jobbdetaljer
 */
export async function fetchJobDetails(jobId) {
    const url = `${API_BASE_URL}/ad/${jobId}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Kunde inte hämta jobbdetaljer: ${response.status}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Fel vid hämtning av jobbdetaljer:', error);
        throw error;
    }
}

/**
 * Extraherar viktig information från ett jobbobjekt
 * @param {object} job - Rådata från API:et
 * @returns {object} - Strukturerad jobbinformation
 */
export function parseJobData(job) {
    return {
        id: job.id,
        title: job.headline || 'Okänd titel',
        company: job.employer?.name || 'Okänd arbetsgivare',
        location: job.workplace_address?.municipality || job.workplace_address?.city || 'Okänd plats',
        description: job.description?.text || '',
        requirements: job.must_have?.skills?.map(s => s.label) || [],
        niceToHave: job.nice_to_have?.skills?.map(s => s.label) || [],
        occupation: job.occupation?.label || '',
        employmentType: job.employment_type?.label || '',
        published: job.publication_date,
        deadline: job.application_deadline,
        remote: job.remote_work || false,
        url: job.webpage_url || ''
    };
}

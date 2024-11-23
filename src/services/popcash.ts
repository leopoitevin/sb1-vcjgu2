import { PopCashConfig, PopCashCampaignDetails } from '../types';

const API_KEY = 'efb089bb81b1346a832d-1732333504-f770b9e857ae5f5ec0e2483690';
const API_BASE_URL = 'https://api.popcash.net/campaigns';
const MASTER_CAMPAIGN_ID = '792608';

export function calculateDailyBudget(visitsPerDay: number): number {
  const impressionsNeeded = visitsPerDay * 1.2; // Add 20% buffer for safety
  return Math.ceil((impressionsNeeded / 1000) * 1 * 100) / 100;
}

async function makeApiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  try {
    // Always include API key as query parameter
    const url = new URL(endpoint);
    url.searchParams.append('apikey', API_KEY);

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY, // Include API key in header as well for redundancy
        ...options.headers,
      },
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('PopCash API request failed:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to communicate with PopCash API');
  }
}

export async function updateMasterCampaign(config: PopCashConfig): Promise<void> {
  try {
    const dailyBudget = calculateDailyBudget(config.visitsPerDay || 100);
    
    const updatePayload = {
      name: config.name || 'SEO Dopamine Traffic Router',
      status: 1, // Running
      url: config.url,
      adjustBudget: dailyBudget * 30, // Monthly budget adjustment
      frequencyCap: 1,
      bid: 0.001, // $1 CPM
      isAdult: false,
      isSound: false,
      isSoftware: false,
      isGambling: false,
      blankReferrer: true,
      networkConnection: 0, // Both mobile and wifi
      pauseAfterApproval: false,
      countries: [], // All countries
      carriers: [], // All carriers
      categories: [], // All categories
      devices: [], // All devices
      operatingSystems: [], // All OS
      browsers: [], // All browsers
      languages: [] // All languages
    };

    await makeApiRequest(`${API_BASE_URL}/${MASTER_CAMPAIGN_ID}`, {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
    });
  } catch (error) {
    console.error('Error updating master PopCash campaign:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to update master campaign. Please try again later.');
  }
}

export async function getMasterCampaignDetails(): Promise<PopCashCampaignDetails> {
  try {
    return await makeApiRequest(`${API_BASE_URL}/${MASTER_CAMPAIGN_ID}`);
  } catch (error) {
    console.error('Error fetching master campaign details:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to fetch master campaign details. Please try again later.');
  }
}
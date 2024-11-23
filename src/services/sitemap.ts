import { XMLParser } from 'fast-xml-parser';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

async function fetchWithFallback(url: string): Promise<Response> {
  try {
    // Try direct fetch first
    const response = await fetch(url);
    if (response.ok) return response;
    
    // If direct fetch fails, try through proxy
    const proxyResponse = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
    if (!proxyResponse.ok) {
      throw new Error(`Failed to fetch sitemap: ${proxyResponse.statusText}`);
    }
    return proxyResponse;
  } catch (error) {
    // If both attempts fail, try one last time through proxy
    const finalAttempt = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
    if (!finalAttempt.ok) {
      throw new Error('Failed to access sitemap. Please verify the URL is correct and publicly accessible.');
    }
    return finalAttempt;
  }
}

export async function fetchAndParseSitemap(url: string): Promise<string[]> {
  try {
    const response = await fetchWithFallback(url);
    const text = await response.text();
    const parser = new XMLParser();
    const result = parser.parse(text);

    // Handle sitemap index
    if (result.sitemapindex?.sitemap) {
      const sitemaps = Array.isArray(result.sitemapindex.sitemap) 
        ? result.sitemapindex.sitemap 
        : [result.sitemapindex.sitemap];
      
      const allUrls: string[] = [];
      for (const sitemap of sitemaps) {
        const urls = await fetchAndParseSitemap(sitemap.loc);
        allUrls.push(...urls);
      }
      return allUrls;
    }

    // Handle regular sitemap
    if (!result.urlset?.url) {
      throw new Error('Invalid sitemap format: No URLs found');
    }

    const urls = Array.isArray(result.urlset.url) 
      ? result.urlset.url 
      : [result.urlset.url];

    return urls.map(url => url.loc);
  } catch (error) {
    throw error instanceof Error 
      ? error 
      : new Error('Failed to parse sitemap');
  }
}

export async function validateSitemapUrl(url: string): Promise<{ isValid: boolean; message?: string }> {
  try {
    const urlObj = new URL(url);
    if (!urlObj.protocol.startsWith('http')) {
      return { 
        isValid: false, 
        message: 'Invalid URL: Must start with http:// or https://' 
      };
    }

    if (!url.toLowerCase().includes('sitemap')) {
      return { 
        isValid: false, 
        message: 'URL should contain "sitemap" (e.g., sitemap.xml or sitemap_index.xml)' 
      };
    }
    
    const response = await fetchWithFallback(url);
    const text = await response.text();
    
    // Verify it's XML content
    if (!text.trim().startsWith('<?xml')) {
      return { 
        isValid: false, 
        message: 'Invalid content: File must be a valid XML document' 
      };
    }

    // Test if we can parse it
    const parser = new XMLParser();
    const result = parser.parse(text);

    if (!result.urlset && !result.sitemapindex) {
      return { 
        isValid: false, 
        message: 'Invalid sitemap format: Must be a valid sitemap or sitemap index' 
      };
    }

    // Validate that we have at least one URL
    if (result.urlset?.url || result.sitemapindex?.sitemap) {
      return { isValid: true };
    }

    return { 
      isValid: false, 
      message: 'Invalid sitemap: No URLs found in the sitemap' 
    };
  } catch (error) {
    return { 
      isValid: false, 
      message: error instanceof Error 
        ? error.message 
        : 'Failed to validate sitemap URL' 
    };
  }
}
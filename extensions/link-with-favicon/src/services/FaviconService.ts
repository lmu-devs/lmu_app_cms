export interface FaviconResult {
    url: string;
    dataUrl: string | null;
}

export class FaviconService {
    /**
     * Get the favicon URL using various favicon services as fallbacks.
     * @param url The URL to get the favicon for
     * @returns Promise<FaviconResult | null> The favicon URLs or null if not found
     */
    public async getFaviconUrl(url: string): Promise<FaviconResult | null> {
        try {
            // Clean the URL to get domain
            const domain = url.includes("//") ? url.split("/")[2] : url.split("/")[0];

            // Try icon.horse service first
            const iconHorseUrl = `https://icon.horse/icon/${domain}`;
            const iconHorseDataUrl = await this.convertToDataUrl(iconHorseUrl);
            if (iconHorseDataUrl) {
                return { url: iconHorseUrl, dataUrl: iconHorseDataUrl };
            }

            // Try DuckDuckGo
            const ddgUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
            const ddgDataUrl = await this.convertToDataUrl(ddgUrl);
            if (ddgDataUrl) {
                return { url: ddgUrl, dataUrl: ddgDataUrl };
            }

            // Try allesedv.com
            const allesedvUrl = `https://f3.allesedv.com/64/${domain}`;
            const allesedvDataUrl = await this.convertToDataUrl(allesedvUrl);
            if (allesedvDataUrl) {
                return { url: allesedvUrl, dataUrl: allesedvDataUrl };
            }

            // Try Google's service
            const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            const googleDataUrl = await this.convertToDataUrl(googleUrl);
            if (googleDataUrl) {
                return { url: googleUrl, dataUrl: googleDataUrl };
            }

            return null;
        } catch (error) {
            console.error('Error getting favicon URL:', error);
            return null;
        }
    }

    /**
     * Convert an external image URL to a data URL - needs to be done because of directus CORS
     * @param url The URL of the image to convert
     * @returns Promise<string | null> The data URL or null if failed
     */
    public async convertToDataUrl(url: string): Promise<string | null> {
        try {
            const response = await fetch(url);
            if (!response.ok) return null;
            
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            return null;
        }
    }
} 
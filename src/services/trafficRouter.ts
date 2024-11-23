import { Campaign } from '../types';

export class TrafficRouter {
  private static instance: TrafficRouter;
  private campaigns: Map<number, Campaign>;

  private constructor() {
    this.campaigns = new Map();
  }

  public static getInstance(): TrafficRouter {
    if (!TrafficRouter.instance) {
      TrafficRouter.instance = new TrafficRouter();
    }
    return TrafficRouter.instance;
  }

  public addCampaign(campaign: Campaign): void {
    this.campaigns.set(campaign.id, campaign);
  }

  public removeCampaign(id: number): void {
    this.campaigns.delete(id);
  }

  public getCampaign(id: number): Campaign | undefined {
    return this.campaigns.get(id);
  }

  public getAllCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values());
  }

  public getActiveCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values()).filter(
      campaign => campaign.status === 1 && this.isWithinDuration(campaign)
    );
  }

  private isWithinDuration(campaign: Campaign): boolean {
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + campaign.duration);
    const now = new Date();
    return now >= startDate && now <= endDate;
  }

  public getNextUrl(type: 'site' | 'page' | 'backlinks'): string | null {
    const activeCampaigns = this.getActiveCampaigns().filter(c => c.trafficType === type);
    
    if (activeCampaigns.length === 0) {
      return null;
    }

    // For site campaigns, randomly select from available URLs
    if (type === 'site') {
      const siteCampaigns = activeCampaigns.filter(c => c.sitemapUrl);
      if (siteCampaigns.length === 0) return null;
      
      // TODO: Implement URL selection from sitemap
      // For now, return the main URL
      const campaign = this.getWeightedRandomCampaign(siteCampaigns);
      return campaign?.url || null;
    }

    // For page or backlink campaigns, use weighted random selection
    const campaign = this.getWeightedRandomCampaign(activeCampaigns);
    return campaign?.url || null;
  }

  private getWeightedRandomCampaign(campaigns: Campaign[]): Campaign | null {
    if (campaigns.length === 0) return null;

    // Calculate total daily visits
    const totalVisits = campaigns.reduce((sum, c) => sum + c.visitsPerDay, 0);
    
    // Generate random number between 0 and total visits
    const random = Math.random() * totalVisits;
    
    // Select campaign based on weighted probability
    let accumulator = 0;
    for (const campaign of campaigns) {
      accumulator += campaign.visitsPerDay;
      if (random <= accumulator) {
        return campaign;
      }
    }

    return campaigns[campaigns.length - 1];
  }

  public updateCampaignStatus(id: number, status: number): void {
    const campaign = this.campaigns.get(id);
    if (campaign) {
      campaign.status = status;
      this.campaigns.set(id, campaign);
    }
  }
}
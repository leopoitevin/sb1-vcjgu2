export interface Campaign {
  id: number;
  status: number;
  url: string;
  name: string;
  bid: number;
  budget: number;
  trafficType: 'site' | 'page' | 'backlinks';
  visitsPerDay: number;
  duration: number;
  startDate: string;
  sitemapUrl?: string;
}

export interface User {
  id: string;
  email: string;
  campaigns: Campaign[];
}

export interface PopCashConfig {
  name: string;
  status?: number;
  url: string;
  budget?: number;
  dailyBudget?: number;
  adjustBudget?: number;
  frequencyCap: number;
  bid: number;
  isAdult: boolean;
  isSound: boolean;
  isSoftware: boolean;
  isGambling: boolean;
  blankReferrer: boolean;
  networkConnection: number;
  pauseAfterApproval: boolean;
  countries: string[];
  carriers: number[];
  categories: number[];
  devices: number[];
  operatingSystems: number[];
  browsers: number[];
  languages: number[];
}

export interface PopCashCountry {
  id: number;
  code: string;
  name: string;
}

export interface PopCashCarrier {
  id: number;
  name: string;
  countryCode: string;
}

export interface PopCashCategory {
  id: number;
  name: string;
}

export interface PopCashOperatingSystem {
  id: number;
  name: string;
  browsers: PopCashBrowser[];
}

export interface PopCashBrowser {
  id: number;
  name: string;
}

export interface PopCashDevice {
  id: number;
  name: string;
  operatingSystems: PopCashOperatingSystem[];
}

export interface PopCashLanguage {
  id: number;
  name: string;
}

export interface PopCashCampaignDetails {
  id: number;
  status: number;
  url: string;
  name: string;
  bid: number;
  frequencyCap: number;
  remainingBudget: number;
  budget: number;
  isAdult: boolean;
  isSoftware: boolean;
  isSound: boolean;
  isGambling: boolean;
  blankReferrer: boolean;
  networkConnection: number;
  pauseAfterApproval: boolean;
  countries: PopCashCountry[];
  carriers: PopCashCarrier[];
  categories: PopCashCategory[];
  devices: PopCashDevice[];
  operatingSystems: PopCashOperatingSystem[];
  browsers: PopCashBrowser[];
  languages: PopCashLanguage[];
}
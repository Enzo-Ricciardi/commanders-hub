
export interface Commander {
  name: string;
  credits: number;
  location: string;
  ranks: {
    combat: string;
    trade: string;
    exploration: string;
    cqc: string;
    federation?: string;
    empire?: string;
    mercenary?: string;
    exobiologist?: string;
  };
  allegiance: string;
  power: string;
  powerRank?: number;
  reputation: {
    federation: number;
    empire: number;
    alliance: number;
  };
  statistics?: {
    bankAccount?: {
      currentWealth: number;
      spentOnShips: number;
      spentOnOutfitting: number;
      spentOnRepairs: number;
      spentOnFuel: number;
      spentOnAmmo: number;
    };
    combat?: {
      bounties: number;
      bonds: number;
      assassinations: number;
    };
    exploration?: {
      systemsVisited: number;
      profitsFromExploration: number;
      timePlayedSeconds: number;
      highestPayout: number;
    };
    trading?: {
      marketsProfits: number;
      resourcesTraded: number;
    };
  };
  engineers?: Engineer[];
}

export interface Ship {
  name: string;
  type: string;
  fuel: {
    current: number;
    capacity: number;
  };
  cargo: {
    current: number;
    capacity: number;
  };
  modules: {
    core: string[];
    optional: string[];
    hardpoints: string[];
  };
  integrity: number;
  rebuyCost: number;
  jumpRange: {
    current: number;
    max: number;
  };
  shields: number;
  armor: number;
}

export interface Resource {
  name: string;
  type: 'Mineral' | 'Gas' | 'Chemical' | 'Metal';
  location: string; // e.g., "Mars", "Saturn Rings"
  rarity: 'Common' | 'Standard' | 'Rare' | 'Very Rare';
}

export interface StarSystem {
  name: string;
  allegiance: string;
  government: string;
  economy: string;
  population: number;
  security: string;
  controllingFaction: string;
  star: {
    name: string;
    type: string;
  };
  planets: Planet[];
  resources?: Resource[];
}

export interface Planet {
  name: string;
  type: string;
  isLandable: boolean;
  distanceToArrival: number;
}

export interface StoredShip {
  id: number;
  type: string;
  name?: string;
  location: string;
  value: number;
}

export interface Material {
  name: string;
  category: 'Raw' | 'Manufactured' | 'Encoded';
  count: number;
  max: number;
}

export interface Mission {
  id: string;
  type: string;
  faction: string;
  destinationSystem: string;
  reward: number;
  isWing: boolean;
  status: 'Active' | 'Complete';
}

export interface ExplorationScan {
  id: string;
  bodyName: string;
  systemName: string;
  scanType: 'Exobiology' | 'Geological' | 'Thargoid' | 'Guardian' | 'Celestial';
  description: string;
  detailsForPrompt: string;
}

export interface FleetCarrier {
  name: string;
  callsign: string;
  location: string;
  fuel: {
    tritium: number;
    capacity: number;
  };
  balance: number;
  services: string[];
}

export interface ThargoidSystem {
  name: string;
  status: string; // 'Active', 'Invasion', 'Alert'
  progress: number;
  state: string;
  distance?: number | null; // Distance in light years from current system
}

export interface GameData {
  commander: Commander;
  ship: Ship;
  system: StarSystem;
  storedShips: StoredShip[];
  materials: Material[];
  missions: Mission[];
  explorationScans: ExplorationScan[];
  fleetCarrier?: FleetCarrier;
  thargoidWar?: ThargoidSystem[];
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  sources?: GroundingSource[];
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Engineer {
  name: string;
  rank: number;
  progress: number;
  rankProgress: number;
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMockGameData = exports.mockFleetCarrier = exports.mockExplorationScans = exports.mockMissions = exports.mockMaterials = exports.mockStoredShips = exports.mockSystem = exports.mockShip = exports.mockCommander = void 0;
exports.mockCommander = {
    name: "CMDR Maverick",
    credits: 145890234,
    location: "Sol / Abraham Lincoln",
    ranks: {
        combat: "Master",
        trade: "Tycoon",
        exploration: "Ranger",
        cqc: "Helpless",
    },
    allegiance: "Independent",
    power: "Zachary Hudson",
    reputation: {
        federation: 75, // percentage
        empire: 15,
        alliance: 45,
    },
};
exports.mockShip = {
    name: "Void Chaser",
    type: "Krait Phantom",
    fuel: {
        current: 32,
        capacity: 32,
    },
    cargo: {
        current: 64,
        capacity: 128,
    },
    modules: {
        core: ["5A Power Plant (G3 Overcharged)", "5A Thrusters (G5 Dirty)", "5A Frame Shift Drive (G5 Increased Range)", "4D Life Support"],
        optional: ["5H Guardian FSD Booster", "3A Collector Limpet", "3E Cargo Rack", "3A Prospector Limpet"],
        hardpoints: ["2B Seismic Charge Launcher", "1D Abrasion Blaster", "2B Sub-surface Displacement Missile"],
    },
    integrity: 98,
    rebuyCost: 7543210,
    jumpRange: {
        current: 68.54,
        max: 72.11,
    },
    shields: 100,
    armor: 100,
};
exports.mockSystem = {
    name: "Sol",
    allegiance: "Federation",
    government: "Democracy",
    economy: "Refinery / High Tech",
    population: 28754123548,
    security: "High",
    controllingFaction: "Federation",
    star: {
        name: "Sol",
        type: "G-class Star",
    },
    planets: [
        { name: "Mercury", type: "Rocky body", isLandable: true, distanceToArrival: 187 },
        { name: "Venus", type: "High metal content", isLandable: true, distanceToArrival: 361 },
        { name: "Earth", type: "Earth-like world", isLandable: false, distanceToArrival: 500 },
        { name: "Luna", type: "Rocky body", isLandable: true, distanceToArrival: 501 },
        { name: "Abraham Lincoln", type: "O'Neill Cylinder", isLandable: false, distanceToArrival: 501 },
        { name: "Mars", type: "Rocky body", isLandable: true, distanceToArrival: 753 },
        { name: "Olympus Village", type: "Planetary Port", isLandable: true, distanceToArrival: 753 },
        { name: "Jupiter", type: "Gas giant with ammonia life", isLandable: false, distanceToArrival: 2596 },
        { name: "Saturn", type: "Gas giant with rings", isLandable: false, distanceToArrival: 4768 },
        { name: "Uranus", type: "Gas giant with rings", isLandable: false, distanceToArrival: 9576 },
        { name: "Neptune", type: "Gas giant", isLandable: false, distanceToArrival: 15024 },
    ],
    resources: [
        { name: "Water", type: "Chemical", location: "Mars", rarity: "Common" },
        { name: "Iron", type: "Metal", location: "Mercury", rarity: "Common" },
        { name: "Nickel", type: "Metal", location: "Mercury", rarity: "Standard" },
        { name: "Sulphur Dioxide", type: "Chemical", location: "Venus", rarity: "Common" },
        { name: "Bauxite", type: "Mineral", location: "Luna", rarity: "Standard" },
        { name: "Gold", type: "Metal", location: "Jupiter Belt", rarity: "Rare" },
        { name: "Low Temperature Diamonds", type: "Mineral", location: "Saturn Rings", rarity: "Very Rare" },
        { name: "Methane", type: "Gas", location: "Saturn", rarity: "Common" },
        { name: "Ammonia", type: "Gas", location: "Jupiter", rarity: "Standard" },
        { name: "Platinum", type: "Metal", location: "Uranus Rings", rarity: "Rare" },
    ],
    services: [],
};
exports.mockStoredShips = [
    { id: 1, type: "Cobra MkIII", name: "Legacy", location: "Lave Station / Lave", value: 349720 },
    { id: 2, type: "Anaconda", name: "The Behemoth", location: "Jameson Memorial / Shinrarta Dezhra", value: 146969450 },
    { id: 3, type: "Diamondback Explorer", location: "Diaguandri / Ray Gateway", value: 1894760 },
];
exports.mockMaterials = [
    { name: "Carbon", category: "Raw", count: 150, max: 300 },
    { name: "Iron", category: "Raw", count: 280, max: 300 },
    { name: "Sulphur", category: "Raw", count: 120, max: 300 },
    { name: "Conductive Polymers", category: "Manufactured", count: 45, max: 200 },
    { name: "Mechanical Scrap", category: "Manufactured", count: 180, max: 200 },
    { name: "Anomalous Bulk Scan Data", category: "Encoded", count: 88, max: 150 },
    { name: "Datamined Wake Exceptions", category: "Encoded", count: 12, max: 150 },
];
exports.mockMissions = [
    { id: "m1", type: "Courier", faction: "Sirius Corporation", destinationSystem: "Procyon", reward: 250000, isWing: false, status: "Active" },
    { id: "m2", type: "Assassination", faction: "Eurybia Blue Mafia", destinationSystem: "Eurybia", reward: 4500000, isWing: true, status: "Active" },
    { id: "m3", type: "Mining", faction: "LHS 20 Corporation", destinationSystem: "LHS 20", reward: 12000000, isWing: false, status: "Active" },
];
exports.mockExplorationScans = [
    {
        id: "scan1",
        bodyName: "Traikeou AA-A h29 A 1 a",
        systemName: "Traikeou AA-A h29",
        scanType: "Exobiology",
        description: "Ammonia world with primitive biological signals.",
        detailsForPrompt: "An ammonia world with a thick, hazy atmosphere. Surface temperature is extremely low, around -150°C. Detected signatures of primitive, ammonia-based bacterial colonies thriving near geothermal vents. The sky is a murky orange color.",
    },
    {
        id: "scan2",
        bodyName: "HIP 22460 10 b",
        systemName: "HIP 22460",
        scanType: "Thargoid",
        description: "Planet with a Thargoid surface site.",
        detailsForPrompt: "A rocky, barren moon with a strange, greenish luminescence on the surface. Scans confirm a large, non-human structure of Thargoid origin. The site is covered in barnacles and emits a low-frequency, unsettling energy signature. The parent gas giant looms large in the sky.",
    },
    {
        id: "scan3",
        bodyName: "NGC 7822 B-21 3",
        systemName: "NGC 7822 Sector B-21",
        scanType: "Celestial",
        description: "Earth-like world orbiting a black hole.",
        detailsForPrompt: "A stunning Earth-like world with liquid water, continents, and a breathable atmosphere. The most remarkable feature is its orbit around a massive black hole, which dominates the sky. The accretion disk of the black hole provides light and warmth, creating a surreal purple and blue nebula-like effect across the sky.",
    },
];
exports.mockFleetCarrier = {
    name: "Stargazer's Rest",
    callsign: "H2G-42Z",
    location: "Sol",
    fuel: {
        tritium: 18500,
        capacity: 25000,
    },
    balance: 750000000,
    services: ["Refuel", "Repair", "Armoury", "Shipyard", "Universal Cartographics"],
};
const getMockGameData = () => {
    return {
        commander: exports.mockCommander,
        ship: exports.mockShip,
        system: exports.mockSystem,
        storedShips: exports.mockStoredShips,
        materials: exports.mockMaterials,
        missions: exports.mockMissions,
        explorationScans: exports.mockExplorationScans,
        fleetCarrier: exports.mockFleetCarrier,
    };
};
exports.getMockGameData = getMockGameData;
//# sourceMappingURL=mockData.js.map
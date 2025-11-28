"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameData = exports.retrieveAuthData = exports.frontierCallback = exports.frontierAuth = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const firebase_functions_1 = require("firebase-functions");
// Modifica: usiamo defineSecret per tutte le credenziali sensibili
const params_1 = require("firebase-functions/params");
const axios_1 = __importDefault(require("axios"));
const mockData_1 = require("./mockData");
admin.initializeApp();
// =======================================================================================
// INIZIO MODIFICHE CRUCIALI PER LA SICUREZZA
// =======================================================================================
// Definisci i parametri per leggere i valori da Secret Manager
// Il nome del secret deve corrispondere esattamente a quello creato in Secret Manager.
const frontierClientId = (0, params_1.defineSecret)("FRONTIER_CLIENT_ID");
const frontierClientSecret = (0, params_1.defineSecret)("FRONTIER_SHARED_KEY"); // Usiamo il nome del secret creato
const inaraApiKey = (0, params_1.defineSecret)("INARA_API_KEY");
// Rimuoviamo completamente le costanti FALLBACK hardcoded.
// const FALLBACK_FRONTIER_CLIENT_ID = "db54bf88-2a8a-4d63-bfcc-638b44cdd982"; // RIGA ELIMINATA
// const FALLBACK_FRONTIER_CLIENT_SECRET = "66596cdb-a027-414a-acc4-9c5c39c13c1e"; // RIGA ELIMINATA
// Funzione helper per accedere al secret (semplificata)
const getFrontierClientId = () => {
    // Legge il valore iniettato da defineSecret.value()
    return frontierClientId.value().trim();
};
const getFrontierClientSecret = () => {
    // Legge il valore iniettato da defineSecret.value()
    return frontierClientSecret.value().trim();
};
// =======================================================================================
// FINE MODIFICHE CRUCIALI PER LA SICUREZZA
// =======================================================================================
// --- AUTHENTICATION FLOW ---
// Riscrivi la variabile PROJECT_ID per usare una costante, non per una riscrittura dinamica
// Questa costante non deve essere modificata se il progetto è fisso.
const PROJECT_ID = "gen-lang-client-0452273955";
// This is the URL that Frontier will redirect to after the user logs in.
const REDIRECT_URI = `https://${PROJECT_ID}.web.app/frontiercallback`;
// Step 1: Redirect user to Frontier's login page
exports.frontierAuth = (0, https_1.onRequest)({ cors: true, secrets: [frontierClientId, frontierClientSecret] }, (request, response) => {
    const clientId = getFrontierClientId();
    if (!clientId) {
        firebase_functions_1.logger.error("Frontier Client ID is not configured (Secret not loaded).");
        response.status(500).send("Application is not configured correctly. Please contact support.");
        return;
    }
    const state = "random_string_for_security";
    const authUrl = "https://auth.frontierstore.net/auth?" +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `scope=auth%20capi&` +
        `state=${state}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    firebase_functions_1.logger.info(`Redirecting user to Frontier for authentication. URI: ${REDIRECT_URI}`);
    response.redirect(authUrl);
});
// In-memory cache to prevent double-use of auth codes
const usedAuthCodes = new Set();
// Step 2: Handle the callback from Frontier
// Aggiornamento: Aggiungi tutti i secret usati in questa funzione
exports.frontierCallback = (0, https_1.onRequest)({ cors: true, secrets: [frontierClientId, frontierClientSecret, inaraApiKey] }, async (request, response) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4;
    const code = request.query.code;
    const state = request.query.state;
    firebase_functions_1.logger.info("Callback received", { code: code ? "***" : "missing", state, query: request.query });
    if (!code) {
        firebase_functions_1.logger.error("Callback received without an authorization code.");
        response.status(400).send("Authentication failed: No authorization code provided.");
        return;
    }
    // TEMPORARILY DISABLED - Debug mode
    // Check if this code was already used
    // if (usedAuthCodes.has(code)) {
    //   logger.warn("Auth code already used, ignoring duplicate request");
    //   response.status(200).send(`...`);
    //   return;
    // }
    // Mark this code as used
    usedAuthCodes.add(code);
    // Clean up after 5 minutes
    setTimeout(() => usedAuthCodes.delete(code), 5 * 60 * 1000);
    firebase_functions_1.logger.info("Received authorization code from Frontier. Exchanging for token...");
    try {
        const clientId = getFrontierClientId();
        const clientSecret = getFrontierClientSecret(); // Ora legge dal secret
        if (!clientId || !clientSecret) {
            firebase_functions_1.logger.error("Frontier credentials are not configured (Secrets are empty).");
            throw new Error("Server configuration error.");
        }
        // Manually construct the body string
        const bodyParams = [
            `grant_type=authorization_code`,
            `code=${code}`,
            `redirect_uri=${encodeURIComponent(REDIRECT_URI)}`,
            `client_id=${clientId}`,
            `client_secret=${clientSecret}`
        ].join('&');
        firebase_functions_1.logger.info("Sending token request to Frontier with manual body:", {
            redirect_uri: REDIRECT_URI,
            client_id: clientId,
            grant_type: "authorization_code"
        });
        const tokenResponse = await axios_1.default.post("https://auth.frontierstore.net/token", bodyParams, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        const accessToken = tokenResponse.data.access_token;
        firebase_functions_1.logger.info("Successfully obtained access token from Frontier.");
        // --- Test API call with the new token ---
        firebase_functions_1.logger.info("Fetching profile data from Frontier CAPI...");
        const profileResponse = await axios_1.default.get("https://companion.orerve.net/profile", {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });
        firebase_functions_1.logger.info("Successfully fetched profile data:", profileResponse.data);
        // Map profile to GameData
        const profile = profileResponse.data;
        const gameData = (0, mockData_1.getMockGameData)();
        // Map Commander data
        if (profile.commander) {
            gameData.commander.name = profile.commander.name || gameData.commander.name;
            gameData.commander.credits = profile.commander.credits || gameData.commander.credits;
            // Map ranks (Updated with Elite I-V and additional ranks)
            if (profile.commander.rank) {
                const rankNames = ['Harmless', 'Mostly Harmless', 'Novice', 'Competent', 'Expert', 'Master', 'Dangerous', 'Deadly', 'Elite', 'Elite I', 'Elite II', 'Elite III', 'Elite IV', 'Elite V'];
                const tradeRanks = ['Penniless', 'Mostly Penniless', 'Peddler', 'Dealer', 'Merchant', 'Broker', 'Entrepreneur', 'Tycoon', 'Elite', 'Elite I', 'Elite II', 'Elite III', 'Elite IV', 'Elite V'];
                const exploreRanks = ['Aimless', 'Mostly Aimless', 'Scout', 'Surveyor', 'Trailblazer', 'Pathfinder', 'Ranger', 'Pioneer', 'Elite', 'Elite I', 'Elite II', 'Elite III', 'Elite IV', 'Elite V'];
                const cqcRanks = ['Helpless', 'Mostly Helpless', 'Amateur', 'Semi Professional', 'Professional', 'Champion', 'Hero', 'Legend', 'Elite', 'Elite I', 'Elite II', 'Elite III', 'Elite IV', 'Elite V'];
                const federationRanks = ['None', 'Recruit', 'Cadet', 'Midshipman', 'Petty Officer', 'Chief Petty Officer', 'Warrant Officer', 'Ensign', 'Lieutenant', 'Lieutenant Commander', 'Post Commander', 'Post Captain', 'Rear Admiral', 'Vice Admiral', 'Admiral'];
                const empireRanks = ['None', 'Outsider', 'Serf', 'Master', 'Squire', 'Knight', 'Lord', 'Baron', 'Viscount', 'Count', 'Earl', 'Marquis', 'Duke', 'Prince', 'King'];
                const mercenaryRanks = ['Defenceless', 'Mostly Defenceless', 'Rookie', 'Soldier', 'Gunslinger', 'Warrior', 'Gladiator', 'Deadeye', 'Elite', 'Elite I', 'Elite II', 'Elite III', 'Elite IV', 'Elite V'];
                const exobiologistRanks = ['Directionless', 'Mostly Directionless', 'Compiler', 'Collector', 'Cataloguer', 'Taxonomist', 'Ecologist', 'Geneticist', 'Elite', 'Elite I', 'Elite II', 'Elite III', 'Elite IV', 'Elite V'];
                gameData.commander.ranks.combat = rankNames[profile.commander.rank.combat] || gameData.commander.ranks.combat;
                gameData.commander.ranks.trade = tradeRanks[profile.commander.rank.trade] || gameData.commander.ranks.trade;
                gameData.commander.ranks.exploration = exploreRanks[profile.commander.rank.explore] || gameData.commander.ranks.exploration;
                gameData.commander.ranks.cqc = cqcRanks[profile.commander.rank.cqc] || gameData.commander.ranks.cqc;
                // Additional ranks
                if (profile.commander.rank.federation !== undefined) {
                    gameData.commander.ranks.federation = federationRanks[profile.commander.rank.federation] || 'None';
                }
                if (profile.commander.rank.empire !== undefined) {
                    gameData.commander.ranks.empire = empireRanks[profile.commander.rank.empire] || 'None';
                }
                if (profile.commander.rank.soldier !== undefined) {
                    gameData.commander.ranks.mercenary = mercenaryRanks[profile.commander.rank.soldier] || 'Defenceless';
                }
                if (profile.commander.rank.exobiologist !== undefined) {
                    gameData.commander.ranks.exobiologist = exobiologistRanks[profile.commander.rank.exobiologist] || 'Directionless';
                }
            }
            // Map Powerplay
            if (profile.commander.power) {
                gameData.commander.power = profile.commander.power;
                gameData.commander.powerRank = profile.commander.powerRank || 0;
            }
            // Map Reputation
            if (profile.commander.reputation) {
                const mapRep = (val) => {
                    if (typeof val !== 'number')
                        return 0;
                    return val <= 1 ? Math.round(val * 100) : Math.round(val);
                };
                gameData.commander.reputation.federation = mapRep(profile.commander.reputation.federation) || gameData.commander.reputation.federation;
                gameData.commander.reputation.empire = mapRep(profile.commander.reputation.empire) || gameData.commander.reputation.empire;
                gameData.commander.reputation.alliance = mapRep(profile.commander.reputation.alliance) || gameData.commander.reputation.alliance;
            }
            // Map Statistics
            if (profile.statistics) {
                gameData.commander.statistics = {
                    bankAccount: {
                        currentWealth: ((_a = profile.statistics.bank_account) === null || _a === void 0 ? void 0 : _a.current_wealth) || gameData.commander.credits,
                        spentOnShips: ((_b = profile.statistics.bank_account) === null || _b === void 0 ? void 0 : _b.spent_on_ships) || 0,
                        spentOnOutfitting: ((_c = profile.statistics.bank_account) === null || _c === void 0 ? void 0 : _c.spent_on_outfitting) || 0,
                        spentOnRepairs: ((_d = profile.statistics.bank_account) === null || _d === void 0 ? void 0 : _d.spent_on_repairs) || 0,
                        spentOnFuel: ((_e = profile.statistics.bank_account) === null || _e === void 0 ? void 0 : _e.spent_on_fuel) || 0,
                        spentOnAmmo: ((_f = profile.statistics.bank_account) === null || _f === void 0 ? void 0 : _f.spent_on_ammo_consumables) || 0
                    },
                    combat: {
                        bounties: ((_g = profile.statistics.combat) === null || _g === void 0 ? void 0 : _g.bounties_claimed) || 0,
                        bonds: ((_h = profile.statistics.combat) === null || _h === void 0 ? void 0 : _h.combat_bonds) || 0,
                        assassinations: ((_j = profile.statistics.combat) === null || _j === void 0 ? void 0 : _j.assassinations) || 0
                    },
                    exploration: {
                        systemsVisited: ((_k = profile.statistics.exploration) === null || _k === void 0 ? void 0 : _k.systems_visited) || 0,
                        profitsFromExploration: ((_l = profile.statistics.exploration) === null || _l === void 0 ? void 0 : _l.exploration_profits) || 0,
                        timePlayedSeconds: ((_m = profile.statistics.exploration) === null || _m === void 0 ? void 0 : _m.time_played) || 0,
                        highestPayout: ((_o = profile.statistics.exploration) === null || _o === void 0 ? void 0 : _o.highest_payout) || 0
                    },
                    trading: {
                        marketsProfits: ((_p = profile.statistics.trading) === null || _p === void 0 ? void 0 : _p.market_profits) || 0,
                        resourcesTraded: ((_q = profile.statistics.trading) === null || _q === void 0 ? void 0 : _q.resources_traded) || 0
                    }
                };
            }
            // Map Engineers (if available in profile)
            if (profile.engineer_progress && Array.isArray(profile.engineer_progress)) {
                gameData.commander.engineers = profile.engineer_progress.map((eng) => ({
                    name: eng.Engineer || 'Unknown',
                    rank: eng.Rank || 0,
                    progress: eng.Progress || 0,
                    rankProgress: eng.RankProgress || 0
                }));
            }
        }
        // Map current location
        if (profile.lastSystem) {
            gameData.commander.location = profile.lastSystem.name || gameData.commander.location;
            gameData.system.name = profile.lastSystem.name || gameData.system.name;
            // Fetch system bodies from EDSM
            if (gameData.system.name) {
                try {
                    firebase_functions_1.logger.info(`Fetching bodies for system ${gameData.system.name} from EDSM...`);
                    const edsmResponse = await axios_1.default.get(`https://www.edsm.net/api-system-v1/bodies?systemName=${encodeURIComponent(gameData.system.name)}`);
                    if (edsmResponse.data && edsmResponse.data.bodies) {
                        gameData.system.planets = edsmResponse.data.bodies.map((body) => ({
                            name: body.name,
                            type: body.subType || body.type || 'Unknown',
                            isLandable: body.isLandable || false,
                            distanceToArrival: body.distanceToArrival || 0
                        }));
                        // Extract resources from bodies (rings/belts) for the Resource Survey
                        const resources = [];
                        edsmResponse.data.bodies.forEach((body) => {
                            if (body.rings) {
                                body.rings.forEach((ring) => {
                                    resources.push({
                                        name: `${body.name} - ${ring.name}`,
                                        type: ring.type,
                                        location: body.name,
                                        rarity: 'Standard'
                                    });
                                });
                            }
                            if (body.belts) {
                                body.belts.forEach((belt) => {
                                    resources.push({
                                        name: `${body.name} - ${belt.name}`,
                                        type: belt.type,
                                        location: body.name,
                                        rarity: 'Standard'
                                    });
                                });
                            }
                        });
                        // Only set resources if we actually found some
                        if (resources.length > 0) {
                            gameData.system.resources = resources;
                        }
                        else {
                            gameData.system.resources = [];
                        }
                        firebase_functions_1.logger.info(`Fetched ${gameData.system.planets.length} bodies from EDSM.`);
                    }
                }
                catch (edsmError) {
                    firebase_functions_1.logger.error("Failed to fetch data from EDSM:", edsmError);
                    // Fallback: empty array is better than wrong data
                    gameData.system.planets = [];
                    gameData.system.resources = [];
                }
            }
        }
        // Map current ship
        if (profile.ship) {
            gameData.ship.name = profile.ship.shipName || profile.ship.name || gameData.ship.name;
            gameData.ship.type = profile.ship.name || gameData.ship.type;
            if (profile.ship.fuel) {
                gameData.ship.fuel.current = profile.ship.fuel.FuelMain || gameData.ship.fuel.current;
                gameData.ship.fuel.capacity = profile.ship.fuel.FuelCapacity || gameData.ship.fuel.capacity;
            }
            if (profile.ship.cargo) {
                gameData.ship.cargo.current = profile.ship.cargo.count || 0;
                gameData.ship.cargo.capacity = profile.ship.cargo.capacity || gameData.ship.cargo.capacity;
            }
            gameData.ship.integrity = ((_r = profile.ship.health) === null || _r === void 0 ? void 0 : _r.hull) || gameData.ship.integrity;
            gameData.ship.shields = ((_s = profile.ship.health) === null || _s === void 0 ? void 0 : _s.shield) || gameData.ship.shields;
            gameData.ship.rebuyCost = ((_t = profile.ship.value) === null || _t === void 0 ? void 0 : _t.hull) || gameData.ship.rebuyCost;
        }
        // Map stored ships
        let shipsArray = [];
        if (profile.ships) {
            if (Array.isArray(profile.ships)) {
                shipsArray = profile.ships;
            }
            else if (typeof profile.ships === 'object') {
                shipsArray = Object.values(profile.ships);
            }
        }
        if (shipsArray.length > 0) {
            gameData.storedShips = shipsArray.map((ship, index) => {
                var _a, _b, _c;
                return ({
                    id: ship.id || index,
                    type: ship.name || 'Unknown',
                    name: ship.shipName,
                    location: ((_a = ship.starsystem) === null || _a === void 0 ? void 0 : _a.name) || ((_b = ship.station) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown',
                    value: ((_c = ship.value) === null || _c === void 0 ? void 0 : _c.hull) || 0
                });
            });
        }
        // Fetch additional data from Inara API for more accurate information
        try {
            const inaraResponse = await axios_1.default.post('https://inara.cz/inapi/v1/', {
                header: {
                    appName: "Commander's Hub",
                    appVersion: "1.0",
                    isDeveloped: true,
                    APIkey: inaraApiKey.value() // Legge l'Inara API Key in modo sicuro
                },
                events: [
                    {
                        eventName: "getCommanderProfile",
                        eventTimestamp: new Date().toISOString(),
                        eventData: {
                            searchName: gameData.commander.name
                        }
                    }
                ]
            });
            if ((_w = (_v = (_u = inaraResponse.data) === null || _u === void 0 ? void 0 : _u.events) === null || _v === void 0 ? void 0 : _v[0]) === null || _w === void 0 ? void 0 : _w.eventData) {
                const inaraData = inaraResponse.data.events[0].eventData;
                firebase_functions_1.logger.info("Inara data fetched successfully", { commanderName: inaraData.userName });
                // Update reputation with Inara data (more accurate)
                if (inaraData.commanderReputationMajorFaction) {
                    inaraData.commanderReputationMajorFaction.forEach((rep) => {
                        const value = Math.round((rep.value || 0) * 100);
                        if (rep.majorfactionName === 'Federation')
                            gameData.commander.reputation.federation = value;
                        if (rep.majorfactionName === 'Empire')
                            gameData.commander.reputation.empire = value;
                        if (rep.majorfactionName === 'Alliance')
                            gameData.commander.reputation.alliance = value;
                    });
                }
                // Update ranks with Inara data
                if (inaraData.commanderRanksPilot) {
                    inaraData.commanderRanksPilot.forEach((rank) => {
                        if (rank.rankName === 'combat')
                            gameData.commander.ranks.combat = rank.rankValue || gameData.commander.ranks.combat;
                        if (rank.rankName === 'trade')
                            gameData.commander.ranks.trade = rank.rankValue || gameData.commander.ranks.trade;
                        if (rank.rankName === 'explore')
                            gameData.commander.ranks.exploration = rank.rankValue || gameData.commander.ranks.exploration;
                        if (rank.rankName === 'cqc')
                            gameData.commander.ranks.cqc = rank.rankValue || gameData.commander.ranks.cqc;
                    });
                }
                // Get Fleet Carrier from Inara (more reliable)
                if (inaraData.commanderFleet) {
                    const carrier = inaraData.commanderFleet.find((ship) => ship.shipType === 'Fleet Carrier');
                    if (carrier) {
                        gameData.fleetCarrier = {
                            name: carrier.shipName || 'Fleet Carrier',
                            callsign: carrier.shipIdent || 'XXX-XXX',
                            location: carrier.starsystemName || 'Unknown',
                            fuel: {
                                tritium: 0,
                                capacity: 25000
                            },
                            balance: 0,
                            services: []
                        };
                    }
                }
            }
        }
        catch (inaraError) {
            firebase_functions_1.logger.warn("Failed to fetch Inara data, using Frontier data only", inaraError);
        }
        // Fetch Thargoid War Data with distance calculation (no change needed here)
        try {
            // First, get current system coordinates from EDSM
            let currentCoords = { x: 0, y: 0, z: 0 };
            if (gameData.system.name) {
                try {
                    const coordsResponse = await axios_1.default.get(`https://www.edsm.net/api-v1/system?systemName=${encodeURIComponent(gameData.system.name)}&showCoordinates=1`);
                    if ((_x = coordsResponse.data) === null || _x === void 0 ? void 0 : _x.coords) {
                        currentCoords = coordsResponse.data.coords;
                        firebase_functions_1.logger.info(`Current system coordinates: ${JSON.stringify(currentCoords)}`);
                    }
                }
                catch (e) {
                    firebase_functions_1.logger.warn("Could not fetch current system coordinates", e);
                }
            }
            const dcohResponse = await axios_1.default.get('https://dcoh.watch/api/v1/overviews/systems');
            if (dcohResponse.data && dcohResponse.data.systems) {
                const thargoidSystems = dcohResponse.data.systems
                    .filter((s) => s.thargoidLevel && s.thargoidLevel.name !== 'Clear')
                    .map((s) => {
                    var _a;
                    return ({
                        name: s.name,
                        status: ((_a = s.thargoidLevel) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                        progress: s.progress || 0,
                        state: s.state || 'Active',
                        coords: s.coords || null
                    });
                });
                // Calculate distances and filter within 200ly
                const systemsWithDistance = await Promise.all(thargoidSystems.map(async (sys) => {
                    var _a;
                    if (!sys.coords && sys.name) {
                        // Fetch coordinates from EDSM if not available
                        try {
                            const sysCoords = await axios_1.default.get(`https://www.edsm.net/api-v1/system?systemName=${encodeURIComponent(sys.name)}&showCoordinates=1`);
                            if ((_a = sysCoords.data) === null || _a === void 0 ? void 0 : _a.coords) {
                                sys.coords = sysCoords.data.coords;
                            }
                        }
                        catch (e) {
                            firebase_functions_1.logger.warn(`Could not fetch coordinates for ${sys.name}`);
                        }
                    }
                    if (sys.coords && currentCoords.x !== 0) {
                        const dx = sys.coords.x - currentCoords.x;
                        const dy = sys.coords.y - currentCoords.y;
                        const dz = sys.coords.z - currentCoords.z;
                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        return Object.assign(Object.assign({}, sys), { distance: Math.round(distance * 10) / 10 });
                    }
                    return Object.assign(Object.assign({}, sys), { distance: null });
                }));
                // Filter systems within 200ly and sort by distance
                gameData.thargoidWar = systemsWithDistance
                    .filter((s) => s.distance === null || s.distance <= 200)
                    .sort((a, b) => {
                    if (a.distance === null)
                        return 1;
                    if (b.distance === null)
                        return -1;
                    return a.distance - b.distance;
                })
                    .slice(0, 5)
                    .map((s) => ({
                    name: s.name,
                    status: s.status,
                    progress: s.progress,
                    state: s.state,
                    distance: s.distance
                }));
            }
        }
        catch (e) {
            firebase_functions_1.logger.error("Failed to fetch Thargoid data", e);
            gameData.thargoidWar = [];
        }
        // Map Fleet Carrier from Frontier CAPI (fallback if Inara didn't provide it)
        if (!gameData.fleetCarrier && profile.fleetCarrier) {
            const fc = profile.fleetCarrier;
            gameData.fleetCarrier = {
                name: fc.name || 'Fleet Carrier',
                callsign: fc.callsign || 'XXX-XXX',
                location: fc.currentSystem || 'Unknown',
                fuel: {
                    tritium: fc.fuel || 0,
                    capacity: 25000
                },
                balance: fc.bankBalance || 0,
                services: fc.services || []
            };
        }
        // Map materials
        if (profile.materials) {
            const materials = [];
            if (profile.materials.Raw) {
                Object.entries(profile.materials.Raw).forEach(([name, count]) => {
                    materials.push({ name, category: 'Raw', count: count, max: 300 });
                });
            }
            if (profile.materials.Manufactured) {
                Object.entries(profile.materials.Manufactured).forEach(([name, count]) => {
                    materials.push({ name, category: 'Manufactured', count: count, max: 250 });
                });
            }
            if (profile.materials.Encoded) {
                Object.entries(profile.materials.Encoded).forEach(([name, count]) => {
                    materials.push({ name, category: 'Encoded', count: count, max: 500 });
                });
            }
            if (materials.length > 0) {
                gameData.materials = materials;
            }
        }
        // Map active missions
        if (profile.missions && Array.isArray(profile.missions)) {
            gameData.missions = profile.missions.map((mission) => {
                var _a;
                return ({
                    id: ((_a = mission.MissionID) === null || _a === void 0 ? void 0 : _a.toString()) || Math.random().toString(),
                    type: mission.LocalisedName || mission.Name || 'Unknown Mission',
                    faction: mission.Faction || 'Unknown',
                    destinationSystem: mission.DestinationSystem || 'Unknown',
                    reward: mission.Reward || 0,
                    isWing: mission.Wing || false,
                    status: 'Active'
                });
            });
        }
        firebase_functions_1.logger.info("Mapped game data:", {
            commanderName: gameData.commander.name,
            location: gameData.commander.location,
            shipType: gameData.ship.type,
            credits: gameData.commander.credits
        });
        // SAVE TO FIRESTORE (Server-side, before sending response)
        const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        try {
            await admin.firestore().collection('auth_sessions').doc(sessionId).set({
                data: gameData,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            firebase_functions_1.logger.info('Data saved to Firestore with session ID:', sessionId);
        }
        catch (dbError) {
            firebase_functions_1.logger.error('Failed to save to Firestore:', dbError);
            response.status(500).send(`
        <html>
          <body style="background-color: #0c111a; color: #e5e7eb; text-align: center; padding: 50px;">
            <h1>Database Error</h1>
            <p>Failed to save session data. Please try again.</p>
          </body>
        </html>
      `);
            return;
        }
        // Respond to the user's browser with a simple redirect
        response.status(200).send(`
      <html>
        <body style="background-color: #0c111a; color: #e5e7eb; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
          <div style="text-align: center;">
            <h1 style="margin-bottom: 20px;">Authentication Successful</h1>
            <p>Redirecting to dashboard...</p>
            <div style="margin-top: 20px; width: 40px; height: 40px; border: 4px solid #f97316; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-left: auto; margin-right: auto;"></div>
          </div>
          <style>
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
          <script>
            setTimeout(() => {
              window.location.href = '/?session_id=${sessionId}';
            }, 500);
          </script>
        </body>
      </html>
    `);
    }
    catch (error) {
        firebase_functions_1.logger.error("Error during token exchange or profile fetch:", error);
        let errorMessage = "Unknown error occurred";
        if (axios_1.default.isAxiosError(error)) {
            firebase_functions_1.logger.error("Axios error details:", {
                status: (_y = error.response) === null || _y === void 0 ? void 0 : _y.status,
                data: (_z = error.response) === null || _z === void 0 ? void 0 : _z.data,
                url: (_0 = error.config) === null || _0 === void 0 ? void 0 : _0.url
            });
            errorMessage = ((_2 = (_1 = error.response) === null || _1 === void 0 ? void 0 : _1.data) === null || _2 === void 0 ? void 0 : _2.error_description) || ((_4 = (_3 = error.response) === null || _3 === void 0 ? void 0 : _3.data) === null || _4 === void 0 ? void 0 : _4.error) || error.message;
        }
        else if (error instanceof Error) {
            errorMessage = error.message;
        }
        response.status(500).send(`
      <html>
        <body style="background-color: #0c111a; color: #e5e7eb; text-align: center; padding: 50px; font-family: sans-serif;">
          <h1 style="color: #f97316;">Authentication Error</h1>
          <p>Failed to complete authentication with Frontier.</p>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">${errorMessage}</p>
          <button onclick="window.location.href='/'" style="margin-top: 30px; padding: 12px 24px; background: #f97316; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
            Try Again
          </button>
        </body>
      </html>
    `);
    }
});
// New function to retrieve data by session ID
exports.retrieveAuthData = (0, https_1.onCall)(async (request) => {
    var _a;
    const sessionId = request.data.sessionId;
    if (!sessionId) {
        throw new https_1.HttpsError('invalid-argument', 'The function must be called with a sessionId.');
    }
    const doc = await admin.firestore().collection('auth_sessions').doc(sessionId).get();
    if (!doc.exists) {
        throw new https_1.HttpsError('not-found', 'Session not found or expired.');
    }
    const data = (_a = doc.data()) === null || _a === void 0 ? void 0 : _a.data;
    // Clean up (delete the session after retrieval)
    await admin.firestore().collection('auth_sessions').doc(sessionId).delete();
    return data;
});
// --- MOCK DATA FLOW ---
exports.getGameData = (0, https_1.onCall)((request) => {
    firebase_functions_1.logger.info("getGameData function was called for MOCK data", { auth: request.auth });
    const gameData = (0, mockData_1.getMockGameData)();
    return Promise.resolve(gameData);
});
//# sourceMappingURL=index.js.map
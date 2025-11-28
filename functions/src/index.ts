import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
// Modifica: usiamo defineSecret per tutte le credenziali sensibili
import { defineSecret } from "firebase-functions/params";
import axios from "axios";

import { getMockGameData } from "./mockData";
import { GameData } from "./types";

admin.initializeApp();

// =======================================================================================
// INIZIO MODIFICHE CRUCIALI PER LA SICUREZZA
// =======================================================================================

// Definisci i parametri per leggere i valori da Secret Manager
// Il nome del secret deve corrispondere esattamente a quello creato in Secret Manager.
const frontierClientId = defineSecret("FRONTIER_CLIENT_ID");
const frontierClientSecret = defineSecret("FRONTIER_SHARED_KEY"); // Usiamo il nome del secret creato
const inaraApiKey = defineSecret("INARA_API_KEY");

// Rimuoviamo completamente le costanti FALLBACK hardcoded.
// const FALLBACK_FRONTIER_CLIENT_ID = "db54bf88-2a8a-4d63-bfcc-638b44cdd982"; // RIGA ELIMINATA
// const FALLBACK_FRONTIER_CLIENT_SECRET = "66596cdb-a027-414a-acc4-9c5c39c13c1e"; // RIGA ELIMINATA

// Funzione helper per accedere al secret (semplificata)
const getFrontierClientId = (): string => {
  // Legge il valore iniettato da defineSecret.value()
  return frontierClientId.value().trim();
};

const getFrontierClientSecret = (): string => {
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
export const frontierAuth = onRequest({ cors: true, secrets: [frontierClientId, frontierClientSecret] }, (request, response) => {
  const clientId = getFrontierClientId();
  if (!clientId) {
    logger.error("Frontier Client ID is not configured (Secret not loaded).");
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

  logger.info(`Redirecting user to Frontier for authentication. URI: ${REDIRECT_URI}`);
  response.redirect(authUrl);
});


// In-memory cache to prevent double-use of auth codes
const usedAuthCodes = new Set<string>();

// Step 2: Handle the callback from Frontier
// Aggiornamento: Aggiungi tutti i secret usati in questa funzione
export const frontierCallback = onRequest({ cors: true, secrets: [frontierClientId, frontierClientSecret, inaraApiKey] }, async (request, response) => {
  const code = request.query.code as string;
  const state = request.query.state as string;

  logger.info("Callback received", { code: code ? "***" : "missing", state, query: request.query });

  if (!code) {
    logger.error("Callback received without an authorization code.");
    response.status(400).send("Authentication failed: No authorization code provided.");
    return;
  }

  // Check if this code was already used
  if (usedAuthCodes.has(code)) {
    logger.warn("Auth code already used, ignoring duplicate request");
    response.status(200).send(`
      <html>
        <body style="background-color: #0c111a; color: #e5e7eb; text-align: center; padding: 50px;">
          <h1>Already Processing</h1>
          <p>This authentication is already being processed. Please wait...</p>
        </body>
      </html>
    `);
    return;
  }

  // Mark this code as used
  usedAuthCodes.add(code);
  // Clean up after 5 minutes
  setTimeout(() => usedAuthCodes.delete(code), 5 * 60 * 1000);

  logger.info("Received authorization code from Frontier. Exchanging for token...");

  try {
    const clientId = getFrontierClientId();
    const clientSecret = getFrontierClientSecret(); // Ora legge dal secret

    if (!clientId || !clientSecret) {
      logger.error("Frontier credentials are not configured (Secrets are empty).");
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

    logger.info("Sending token request to Frontier with manual body:", {
      redirect_uri: REDIRECT_URI,
      client_id: clientId,
      grant_type: "authorization_code"
    });

    const tokenResponse = await axios.post(
      "https://auth.frontierstore.net/token",
      bodyParams,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const accessToken = tokenResponse.data.access_token;
    logger.info("Successfully obtained access token from Frontier.");

    // --- Test API call with the new token ---
    logger.info("Fetching profile data from Frontier CAPI...");
    const profileResponse = await axios.get("https://companion.orerve.net/profile", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    logger.info("Successfully fetched profile data:", profileResponse.data);

    // Map profile to GameData
    const profile = profileResponse.data;
    const gameData = getMockGameData();

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
        const mapRep = (val: number) => {
          if (typeof val !== 'number') return 0;
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
            currentWealth: profile.statistics.bank_account?.current_wealth || gameData.commander.credits,
            spentOnShips: profile.statistics.bank_account?.spent_on_ships || 0,
            spentOnOutfitting: profile.statistics.bank_account?.spent_on_outfitting || 0,
            spentOnRepairs: profile.statistics.bank_account?.spent_on_repairs || 0,
            spentOnFuel: profile.statistics.bank_account?.spent_on_fuel || 0,
            spentOnAmmo: profile.statistics.bank_account?.spent_on_ammo_consumables || 0
          },
          combat: {
            bounties: profile.statistics.combat?.bounties_claimed || 0,
            bonds: profile.statistics.combat?.combat_bonds || 0,
            assassinations: profile.statistics.combat?.assassinations || 0
          },
          exploration: {
            systemsVisited: profile.statistics.exploration?.systems_visited || 0,
            profitsFromExploration: profile.statistics.exploration?.exploration_profits || 0,
            timePlayedSeconds: profile.statistics.exploration?.time_played || 0,
            highestPayout: profile.statistics.exploration?.highest_payout || 0
          },
          trading: {
            marketsProfits: profile.statistics.trading?.market_profits || 0,
            resourcesTraded: profile.statistics.trading?.resources_traded || 0
          }
        };
      }

      // Map Engineers (if available in profile)
      if (profile.engineer_progress && Array.isArray(profile.engineer_progress)) {
        gameData.commander.engineers = profile.engineer_progress.map((eng: any) => ({
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
          logger.info(`Fetching bodies for system ${gameData.system.name} from EDSM...`);
          const edsmResponse = await axios.get(`https://www.edsm.net/api-system-v1/bodies?systemName=${encodeURIComponent(gameData.system.name)}`);

          if (edsmResponse.data && edsmResponse.data.bodies) {
            gameData.system.planets = edsmResponse.data.bodies.map((body: any) => ({
              name: body.name,
              type: body.subType || body.type || 'Unknown',
              isLandable: body.isLandable || false,
              distanceToArrival: body.distanceToArrival || 0
            }));

            // Extract resources from bodies (rings/belts) for the Resource Survey
            const resources: any[] = [];
            edsmResponse.data.bodies.forEach((body: any) => {
              if (body.rings) {
                body.rings.forEach((ring: any) => {
                  resources.push({
                    name: `${body.name} - ${ring.name}`,
                    type: ring.type,
                    location: body.name,
                    rarity: 'Standard'
                  });
                });
              }
              if (body.belts) {
                body.belts.forEach((belt: any) => {
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
            } else {
              gameData.system.resources = [];
            }

            logger.info(`Fetched ${gameData.system.planets.length} bodies from EDSM.`);
          }
        } catch (edsmError) {
          logger.error("Failed to fetch data from EDSM:", edsmError);
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

      gameData.ship.integrity = profile.ship.health?.hull || gameData.ship.integrity;
      gameData.ship.shields = profile.ship.health?.shield || gameData.ship.shields;
      gameData.ship.rebuyCost = profile.ship.value?.hull || gameData.ship.rebuyCost;
    }

    // Map stored ships
    let shipsArray: any[] = [];
    if (profile.ships) {
      if (Array.isArray(profile.ships)) {
        shipsArray = profile.ships;
      } else if (typeof profile.ships === 'object') {
        shipsArray = Object.values(profile.ships);
      }
    }

    if (shipsArray.length > 0) {
      gameData.storedShips = shipsArray.map((ship: any, index: number) => ({
        id: ship.id || index,
        type: ship.name || 'Unknown',
        name: ship.shipName,
        location: ship.starsystem?.name || ship.station?.name || 'Unknown',
        value: ship.value?.hull || 0
      }));
    }

    // Fetch additional data from Inara API for more accurate information
    try {
      const inaraResponse = await axios.post('https://inara.cz/inapi/v1/', {
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

      if (inaraResponse.data?.events?.[0]?.eventData) {
        const inaraData = inaraResponse.data.events[0].eventData;
        logger.info("Inara data fetched successfully", { commanderName: inaraData.userName });

        // Update reputation with Inara data (more accurate)
        if (inaraData.commanderReputationMajorFaction) {
          inaraData.commanderReputationMajorFaction.forEach((rep: any) => {
            const value = Math.round((rep.value || 0) * 100);
            if (rep.majorfactionName === 'Federation') gameData.commander.reputation.federation = value;
            if (rep.majorfactionName === 'Empire') gameData.commander.reputation.empire = value;
            if (rep.majorfactionName === 'Alliance') gameData.commander.reputation.alliance = value;
          });
        }

        // Update ranks with Inara data
        if (inaraData.commanderRanksPilot) {
          inaraData.commanderRanksPilot.forEach((rank: any) => {
            if (rank.rankName === 'combat') gameData.commander.ranks.combat = rank.rankValue || gameData.commander.ranks.combat;
            if (rank.rankName === 'trade') gameData.commander.ranks.trade = rank.rankValue || gameData.commander.ranks.trade;
            if (rank.rankName === 'explore') gameData.commander.ranks.exploration = rank.rankValue || gameData.commander.ranks.exploration;
            if (rank.rankName === 'cqc') gameData.commander.ranks.cqc = rank.rankValue || gameData.commander.ranks.cqc;
          });
        }

        // Get Fleet Carrier from Inara (more reliable)
        if (inaraData.commanderFleet) {
          const carrier = inaraData.commanderFleet.find((ship: any) => ship.shipType === 'Fleet Carrier');
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
    } catch (inaraError) {
      logger.warn("Failed to fetch Inara data, using Frontier data only", inaraError);
    }

    // Fetch Thargoid War Data with distance calculation (no change needed here)
    try {
      // First, get current system coordinates from EDSM
      let currentCoords = { x: 0, y: 0, z: 0 };
      if (gameData.system.name) {
        try {
          const coordsResponse = await axios.get(`https://www.edsm.net/api-v1/system?systemName=${encodeURIComponent(gameData.system.name)}&showCoordinates=1`);
          if (coordsResponse.data?.coords) {
            currentCoords = coordsResponse.data.coords;
            logger.info(`Current system coordinates: ${JSON.stringify(currentCoords)}`);
          }
        } catch (e) {
          logger.warn("Could not fetch current system coordinates", e);
        }
      }

      const dcohResponse = await axios.get('https://dcoh.watch/api/v1/overviews/systems');
      if (dcohResponse.data && dcohResponse.data.systems) {
        const thargoidSystems = dcohResponse.data.systems
          .filter((s: any) => s.thargoidLevel && s.thargoidLevel.name !== 'Clear')
          .map((s: any) => ({
            name: s.name,
            status: s.thargoidLevel?.name || 'Unknown',
            progress: s.progress || 0,
            state: s.state || 'Active',
            coords: s.coords || null
          }));

        // Calculate distances and filter within 200ly
        const systemsWithDistance = await Promise.all(
          thargoidSystems.map(async (sys: any) => {
            if (!sys.coords && sys.name) {
              // Fetch coordinates from EDSM if not available
              try {
                const sysCoords = await axios.get(`https://www.edsm.net/api-v1/system?systemName=${encodeURIComponent(sys.name)}&showCoordinates=1`);
                if (sysCoords.data?.coords) {
                  sys.coords = sysCoords.data.coords;
                }
              } catch (e) {
                logger.warn(`Could not fetch coordinates for ${sys.name}`);
              }
            }

            if (sys.coords && currentCoords.x !== 0) {
              const dx = sys.coords.x - currentCoords.x;
              const dy = sys.coords.y - currentCoords.y;
              const dz = sys.coords.z - currentCoords.z;
              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
              return { ...sys, distance: Math.round(distance * 10) / 10 };
            }
            return { ...sys, distance: null };
          })
        );

        // Filter systems within 200ly and sort by distance
        gameData.thargoidWar = systemsWithDistance
          .filter((s: any) => s.distance === null || s.distance <= 200)
          .sort((a: any, b: any) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          })
          .slice(0, 5)
          .map((s: any) => ({
            name: s.name,
            status: s.status,
            progress: s.progress,
            state: s.state,
            distance: s.distance
          }));
      }
    } catch (e) {
      logger.error("Failed to fetch Thargoid data", e);
      gameData.thargoidWar = [];
    }

    // Map Fleet Carrier from Frontier CAPI (fallback if Inara didn't provide it)
    if (!gameData.fleetCarrier && (profile as any).fleetCarrier) {
      const fc = (profile as any).fleetCarrier;
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
      const materials: any[] = [];

      if (profile.materials.Raw) {
        Object.entries(profile.materials.Raw).forEach(([name, count]) => {
          materials.push({ name, category: 'Raw', count: count as number, max: 300 });
        });
      }

      if (profile.materials.Manufactured) {
        Object.entries(profile.materials.Manufactured).forEach(([name, count]) => {
          materials.push({ name, category: 'Manufactured', count: count as number, max: 250 });
        });
      }

      if (profile.materials.Encoded) {
        Object.entries(profile.materials.Encoded).forEach(([name, count]) => {
          materials.push({ name, category: 'Encoded', count: count as number, max: 500 });
        });
      }

      if (materials.length > 0) {
        gameData.materials = materials;
      }
    }

    // Map active missions
    if (profile.missions && Array.isArray(profile.missions)) {
      gameData.missions = profile.missions.map((mission: any) => ({
        id: mission.MissionID?.toString() || Math.random().toString(),
        type: mission.LocalisedName || mission.Name || 'Unknown Mission',
        faction: mission.Faction || 'Unknown',
        destinationSystem: mission.DestinationSystem || 'Unknown',
        reward: mission.Reward || 0,
        isWing: mission.Wing || false,
        status: 'Active'
      }));
    }

    logger.info("Mapped game data:", {
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

      logger.info('Data saved to Firestore with session ID:', sessionId);
    } catch (dbError) {
      logger.error('Failed to save to Firestore:', dbError);
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
  } catch (error) {
    logger.error("Error during token exchange or profile fetch:", error);
    // ... error handling ...
    response.status(500).send("Internal Server Error");
  }
});

// New function to retrieve data by session ID
export const retrieveAuthData = onCall(async (request) => {
  const sessionId = request.data.sessionId;
  if (!sessionId) {
    throw new HttpsError('invalid-argument', 'The function must be called with a sessionId.');
  }

  const doc = await admin.firestore().collection('auth_sessions').doc(sessionId).get();
  if (!doc.exists) {
    throw new HttpsError('not-found', 'Session not found or expired.');
  }

  const data = doc.data()?.data;

  // Clean up (delete the session after retrieval)
  await admin.firestore().collection('auth_sessions').doc(sessionId).delete();

  return data;
});


// --- MOCK DATA FLOW ---
export const getGameData = onCall<unknown, Promise<GameData>>((request) => {
  logger.info("getGameData function was called for MOCK data", { auth: request.auth });
  const gameData = getMockGameData();
  return Promise.resolve(gameData);
});

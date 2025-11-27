import React, { useState } from 'react';
import { DataCard } from '../DataCard';
import { ShipIcon } from '../icons';
import { GameData, StoredShip } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface FleetOverviewProps {
    gameData: GameData;
}

export const FleetOverview: React.FC<FleetOverviewProps> = ({ gameData }) => {
    const { t } = useLanguage();
    const [selectedShip, setSelectedShip] = useState<StoredShip | null>(null);
    const [showCarrier, setShowCarrier] = useState(false);

    const activeShip: StoredShip = {
        id: -1,
        type: gameData.ship.type,
        name: gameData.ship.name,
        location: gameData.system.name, // Active ship is always with commander
        value: gameData.ship.rebuyCost * 20 // Approx value
    };

    // Filter out the active ship from storedShips to avoid duplicates
    const storedShips = [...gameData.storedShips];
    const activeIndex = storedShips.findIndex(s =>
        (s.name === activeShip.name || (!s.name && !activeShip.name)) &&
        s.type === activeShip.type
    );

    if (activeIndex !== -1) {
        storedShips.splice(activeIndex, 1);
    }

    const allShips = [activeShip, ...storedShips];

    return (
        <DataCard title="fleetOverviewTitle" icon={<ShipIcon />} className="h-[26rem]">
            <div className="flex flex-col h-full">
                {selectedShip ? (
                    <div className="flex flex-col h-full animate-fadeIn">
                        <button onClick={() => setSelectedShip(null)} className="mb-2 text-sm text-orange-400 hover:text-orange-300 flex items-center">
                            ← {t('backToFleet')}
                        </button>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex-grow overflow-y-auto">
                            <h3 className="text-xl font-bold text-white mb-1">{selectedShip.name || selectedShip.type}</h3>
                            <p className="text-orange-500 mb-4">{selectedShip.type}</p>

                            <div className="space-y-2 text-sm text-gray-300">
                                <div className="flex justify-between border-b border-gray-700 pb-1">
                                    <span>{t('location')}:</span>
                                    <span className="text-white">{selectedShip.location}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-700 pb-1">
                                    <span>{t('value')}:</span>
                                    <span className="text-white">{selectedShip.value.toLocaleString()} CR</span>
                                </div>

                                {selectedShip.id === -1 && (
                                    <>
                                        <div className="mt-4 pt-2 border-t border-gray-600">
                                            <h4 className="text-white font-bold mb-2">{t('shipStatusTitle')}</h4>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-gray-900/50 p-2 rounded">
                                                    <span className="block text-xs text-gray-400">{t('fuelLabel')}</span>
                                                    <span className="text-white">{gameData.ship.fuel.current}/{gameData.ship.fuel.capacity} t</span>
                                                </div>
                                                <div className="bg-gray-900/50 p-2 rounded">
                                                    <span className="block text-xs text-gray-400">{t('cargoLabel')}</span>
                                                    <span className="text-white">{gameData.ship.cargo.current}/{gameData.ship.cargo.capacity} t</span>
                                                </div>
                                                <div className="bg-gray-900/50 p-2 rounded">
                                                    <span className="block text-xs text-gray-400">{t('hullLabel')}</span>
                                                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                                                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${(gameData.ship.integrity || 1) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-900/50 p-2 rounded">
                                                    <span className="block text-xs text-gray-400">{t('shieldsLabel')}</span>
                                                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                                                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 p-2 bg-green-900/20 border border-green-500/30 rounded text-center text-green-400">
                                            {t('currentShipStatus')}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ) : showCarrier && gameData.fleetCarrier ? (
                    <div className="flex flex-col h-full animate-fadeIn">
                        <button onClick={() => setShowCarrier(false)} className="mb-2 text-sm text-orange-400 hover:text-orange-300 flex items-center">
                            ← {t('backToFleet')}
                        </button>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex-grow">
                            <h3 className="text-xl font-bold text-white mb-1">{gameData.fleetCarrier.name}</h3>
                            <p className="text-orange-500 mb-4">{gameData.fleetCarrier.callsign}</p>

                            <div className="space-y-2 text-sm text-gray-300">
                                <div className="flex justify-between border-b border-gray-700 pb-1">
                                    <span>{t('location')}:</span>
                                    <span className="text-white">{gameData.fleetCarrier.location}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-700 pb-1">
                                    <span>{t('fuel')}:</span>
                                    <span className="text-white">{gameData.fleetCarrier.fuel.tritium} / {gameData.fleetCarrier.fuel.capacity}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-700 pb-1">
                                    <span>{t('balance')}:</span>
                                    <span className="text-white">{gameData.fleetCarrier.balance.toLocaleString()} CR</span>
                                </div>
                                <div className="mt-2">
                                    <span className="block mb-1 text-gray-400">{t('services')}:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {gameData.fleetCarrier.services.map(s => (
                                            <span key={s} className="text-xs bg-gray-700 px-2 py-1 rounded">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-2">
                        {/* Fleet Carrier Button */}
                        {gameData.fleetCarrier && (
                            <div
                                onClick={() => setShowCarrier(true)}
                                className="flex items-center justify-between p-3 bg-gray-800/80 rounded border border-purple-500/50 hover:bg-gray-700 cursor-pointer transition-colors group"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded bg-purple-900/50 flex items-center justify-center text-purple-400 font-bold text-xs">FC</div>
                                    <div>
                                        <div className="font-bold text-white group-hover:text-purple-400 transition-colors">{gameData.fleetCarrier.name}</div>
                                        <div className="text-xs text-gray-400">{gameData.fleetCarrier.callsign}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">{gameData.fleetCarrier.location}</div>
                            </div>
                        )}

                        {/* Ships List */}
                        {allShips.map((ship, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedShip(ship)}
                                className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors group ${ship.id === -1 ? 'bg-orange-900/20 border-orange-500/50 hover:bg-orange-900/30' : 'bg-gray-900/40 border-gray-700 hover:bg-gray-800'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${ship.id === -1 ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                        {ship.id === -1 ? 'ACT' : 'STO'}
                                    </div>
                                    <div>
                                        <div className={`font-bold transition-colors ${ship.id === -1 ? 'text-orange-100' : 'text-gray-200 group-hover:text-white'}`}>
                                            {ship.name || ship.type}
                                        </div>
                                        <div className="text-xs text-gray-400">{ship.type}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">{ship.location}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DataCard>
    );
};
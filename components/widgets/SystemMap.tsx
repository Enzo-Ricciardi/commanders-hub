
import React, { useState, useMemo } from 'react';
import { DataCard } from '../DataCard';
import { StarSystem, Planet, Resource } from '../../types';
import { SystemIcon, SparkleIcon, ResourceIcon } from '../icons';
import { useLanguage } from '../../context/LanguageContext';
import { analyzeWithAI } from '../../services/geminiService';

// --- ICONS (Styled for Elite Dangerous HUD) ---

const StarGIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-yellow-400" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

const EarthlikeIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
);

const HighMetalContentIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" strokeDasharray="2 2" />
    </svg>
);

const RockyBodyIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v20M2 12h20" strokeWidth="0.5" />
    </svg>
);

const GasGiantIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M4 8h16M4 16h16" />
    </svg>
);

const StationIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 12h2l2-3 2 3 2-3 2 3 2-3 2 3 2 3h2" />
        <path d="M3 12v-2a2 2 0 012-2h14a2 2 0 012 2v2M3 12v2a2 2 0 002 2h14a2 2 0 002-2v-2" />
    </svg>
);

const LandableIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12C3 7.02944 7.02944 3 12 3" />
    </svg>
);


const getBodyIcon = (planet: Planet): React.ReactElement => {
    const type = planet.type.toLowerCase();
    if (!isMajorBody(planet)) return <StationIcon />;
    if (type.includes('earth-like')) return <EarthlikeIcon />;
    if (type.includes('high metal')) return <HighMetalContentIcon />;
    if (type.includes('gas giant')) return <GasGiantIcon />;
    return <RockyBodyIcon />;
};

// --- DATA STRUCTURING ---

interface SystemBodyNode extends Planet {
    children: SystemBodyNode[];
}

const isMajorBody = (planet: Planet): boolean => {
    const type = planet.type.toLowerCase();
    return !type.includes('starport') && !type.includes('cylinder') && !type.includes('port') && !type.includes('outpost') && !type.includes('base');
};

const buildSystemTree = (planets: Planet[]): SystemBodyNode[] => {
    const sortedPlanets = [...planets].sort((a, b) => a.distanceToArrival - b.distanceToArrival);
    const tree: SystemBodyNode[] = [];
    const potentialParents: SystemBodyNode[] = [];

    sortedPlanets.forEach(p => {
        const node: SystemBodyNode = { ...p, children: [] };
        let parent: SystemBodyNode | null = null;

        for (let i = potentialParents.length - 1; i >= 0; i--) {
            const pParent = potentialParents[i];
            if (node.distanceToArrival > pParent.distanceToArrival && node.distanceToArrival - pParent.distanceToArrival < 50) {
                parent = pParent;
                break;
            }
        }

        if (parent) {
            parent.children.push(node);
        } else {
            tree.push(node);
        }

        if (isMajorBody(p)) {
            potentialParents.push(node);
        }
    });

    return tree;
}

// --- RENDER COMPONENTS ---

const ResourceSurvey: React.FC<{ system: StarSystem }> = ({ system }) => {
    const { t } = useLanguage();
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setAnalysis('');
        const prompt = `Based on the resources in the ${system.name} system, suggest the most profitable mining hotspots for a commander flying a Krait Phantom equipped for asteroid mining. Resources available: ${JSON.stringify(system.resources)}. Be specific about locations (e.g., rings, specific planets) and what to look for. Format the response as a concise tactical briefing.`;
        const result = await analyzeWithAI(prompt, true);
        setAnalysis(result);
        setIsLoading(false);
    };

    const rarityColor = (rarity: Resource['rarity']) => {
        switch (rarity) {
            case 'Very Rare': return 'text-purple-400';
            case 'Rare': return 'text-yellow-400';
            case 'Standard': return 'text-blue-300';
            default: return 'text-gray-400';
        }
    };

    const getRarityTranslation = (rarity: Resource['rarity']) => {
        switch (rarity) {
            case 'Very Rare': return t('rarityVeryRare');
            case 'Rare': return t('rarityRare');
            case 'Standard': return t('rarityStandard');
            default: return t('rarityCommon');
        }
    }

    if (!system.resources || system.resources.length === 0) {
        return <div className="flex items-center justify-center h-full"><p className="text-gray-500">{t('noResourcesDetected')}</p></div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                {system.resources.map((res, index) => (
                    <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-900/40 rounded-md">
                        <div>
                            <p className="font-semibold text-gray-200">{res.name} <span className="text-xs text-gray-500">({res.type})</span></p>
                            <p className="text-xs text-gray-400">{res.location}</p>
                        </div>
                        <p className={`font-bold ${rarityColor(res.rarity)}`}>{getRarityTranslation(res.rarity)}</p>
                    </div>
                ))}
            </div>
            <div className="pt-2 mt-2 border-t border-orange-500/20">
                <button onClick={handleAnalyze} disabled={isLoading} className="w-full flex items-center justify-center bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500">
                    <SparkleIcon />
                    <span className="ml-2">{isLoading ? t('analyzingHotspotsButton') : t('analyzeHotspotsButton')}</span>
                </button>
                {isLoading && !analysis && (
                    <div className="flex items-center justify-center h-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-400"></div>
                    </div>
                )}
                {analysis && (
                    <div className="mt-3 p-3 bg-gray-900/50 rounded-md border border-gray-700 text-sm max-h-40 overflow-y-auto">
                        <h4 className="font-semibold mb-2 text-orange-400">{t('miningAnalysisTitle')}:</h4>
                        <div className="whitespace-pre-wrap text-gray-300">{analysis}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface BodyListItemProps {
    node: SystemBodyNode;
    level: number;
}

const BodyListItem: React.FC<BodyListItemProps> = ({ node, level }) => {
    return (
        <div className="flex flex-col">
            <div className="flex items-center p-1.5 hover:bg-orange-500/10 rounded-md transition-colors duration-200">
                <div style={{ paddingLeft: `${level * 1.25}rem` }} className="flex items-center flex-grow">
                    {level > 0 && <span className="mr-2 text-gray-600"> L </span>}
                    <div className="mr-3">{getBodyIcon(node)}</div>
                    <div className="flex-grow">
                        <p className="text-sm text-gray-200">{node.name}</p>
                        <p className="text-xs text-gray-500">{node.type}</p>
                    </div>
                    <div className="flex items-center space-x-4 pr-2">
                        {node.isLandable && <LandableIcon />}
                        <p className="text-xs font-mono text-orange-300 w-20 text-right">{node.distanceToArrival.toLocaleString()} Ls</p>
                    </div>
                </div>
            </div>
            {node.children.length > 0 && (
                <div className="border-l border-gray-700/50">
                    {node.children.map(child => <BodyListItem key={child.name} node={child} level={level + 1} />)}
                </div>
            )}
        </div>
    );
};

interface SystemMapProps {
    system: StarSystem;
}

type View = 'map' | 'resources';

export const SystemMap: React.FC<SystemMapProps> = ({ system }) => {
    const { t } = useLanguage();
    const systemTree = useMemo(() => buildSystemTree(system.planets), [system.planets]);
    const [activeTab, setActiveTab] = useState<'map' | 'resources'>('map');

    return (
        <DataCard title="systemMapTitle" icon={<SystemIcon />} className="col-span-1 lg:col-span-2 h-[32rem]">
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-2xl font-orbitron text-orange-500">{system.name}</div>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('map')}
                            className={`px-3 py-1 rounded text-sm transition-colors ${activeTab === 'map' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            {t('mapTab')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('resources')}
                            className={`px-3 py-1 rounded text-sm transition-colors ${activeTab === 'resources' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            {t('resourcesTab')}
                        </button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    {activeTab === 'map' ? (
                        <div className="space-y-4">
                            {/* Star Info */}
                            <div className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg border border-orange-500/20">
                                <div className="w-12 h-12 rounded-full bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] flex-shrink-0"></div>
                                <div>
                                    <div className="font-bold text-lg">{system.star?.name || system.name}</div>
                                    <div className="text-sm text-gray-400">{t('starType')}: {system.star?.type || 'Unknown'}</div>
                                </div>
                                <div className="ml-auto text-right text-xs text-gray-500">
                                    <div>{t('security')}: {system.security}</div>
                                    <div>{t('economy')}: {system.economy}</div>
                                </div>
                            </div>

                            {/* Planets */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {system.planets && system.planets.length > 0 ? (
                                    system.planets.map((planet, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-2 bg-gray-900/40 rounded border border-gray-700 hover:border-orange-500/50 transition-colors">
                                            <div className={`w-8 h-8 rounded-full flex-shrink-0 ${planet.isLandable ? 'bg-blue-900 border-2 border-blue-400' : 'bg-gray-700'}`}></div>
                                            <div className="overflow-hidden">
                                                <div className="font-medium truncate">{planet.name}</div>
                                                <div className="text-xs text-gray-400 truncate">{planet.type}</div>
                                                {planet.isLandable && <div className="text-[10px] text-blue-400 uppercase tracking-wider">{t('landable')}</div>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center text-gray-500 py-4 italic">
                                        {t('noPlanetsData')}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {system.resources && system.resources.length > 0 ? (
                                system.resources.map((res, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-900/40 rounded border border-gray-700">
                                        <div>
                                            <div className="font-medium text-gray-200">{res.name}</div>
                                            <div className="text-xs text-gray-400">{res.location}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-orange-400">{res.type}</div>
                                            <div className="text-xs text-gray-500">{res.rarity}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    {t('noResourcesFound')}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DataCard>
    );
};
import React from 'react';
import { CommanderProfile } from './widgets/CommanderProfile';
import { ShipStatus } from './widgets/ShipStatus';
import { ThargoidWar } from './widgets/ThargoidWar';
import { SystemMap } from './widgets/SystemMap';
import { GalnetNews } from './widgets/GalnetNews';
import { MissionPlanner } from './widgets/MissionPlanner';
import { FleetOverview } from './widgets/FleetOverview';
import { ExplorationLog } from './widgets/ExplorationLog';
import { GameData } from '../types';

interface DashboardProps {
  gameData: GameData;
}

export const Dashboard: React.FC<DashboardProps> = ({ gameData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Column 1 */}
      <div className="space-y-6">
        <CommanderProfile commander={gameData.commander} />
        <SystemMap system={gameData.system} />
        <ThargoidWar systems={gameData.thargoidWar || []} />
      </div>

      {/* Column 2 */}
      <div className="space-y-6">
        <MissionPlanner ship={gameData.ship} />
        <FleetOverview gameData={gameData} />
      </div>

      {/* Column 3 */}
      <div className="space-y-6">
        <GalnetNews />
        <ExplorationLog gameData={gameData} />
      </div>
    </div>
  );
};
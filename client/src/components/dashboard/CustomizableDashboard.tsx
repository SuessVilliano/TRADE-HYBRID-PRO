import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { settingsService, DashboardModule } from '../../lib/services/settings-service';
import { useAuth } from '../../lib/context/AuthContext';

// Dashboard module components
const ModuleComponents: Record<string, React.FC> = {
  [DashboardModule.TRADE]: () => (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Trade Panel</h2>
      <p>Access your trading tools and execute trades.</p>
    </div>
  ),
  [DashboardModule.JOURNAL]: () => (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Trading Journal</h2>
      <p>Record and analyze your trading journey.</p>
    </div>
  ),
  [DashboardModule.METAVERSE]: () => (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Metaverse</h2>
      <p>Enter the immersive trading experience.</p>
    </div>
  ),
  [DashboardModule.LEARN]: () => (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Learning Center</h2>
      <p>Educational resources to improve your trading.</p>
    </div>
  ),
  [DashboardModule.SIGNALS]: () => (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Trading Signals</h2>
      <p>Get real-time signals from our AI systems.</p>
    </div>
  ),
  [DashboardModule.LEADERBOARD]: () => (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
      <p>See top traders and their performance.</p>
    </div>
  ),
  [DashboardModule.BOTS]: () => (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Trading Bots</h2>
      <p>Configure and deploy automated trading strategies.</p>
    </div>
  ),
  [DashboardModule.NEWS]: () => (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Market News</h2>
      <p>Stay updated with the latest market news.</p>
    </div>
  ),
  [DashboardModule.PROFILE]: () => (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Profile</h2>
      <p>Manage your account and profile information.</p>
    </div>
  ),
  [DashboardModule.SETTINGS]: () => (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <p>Customize your trading experience.</p>
    </div>
  ),
};

interface Props {
  className?: string;
}

const CustomizableDashboard: React.FC<Props> = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const [dashboardOrder, setDashboardOrder] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Load dashboard order from settings service
  useEffect(() => {
    const order = settingsService.getDashboardOrder();
    setDashboardOrder(order);
    
    // If logged in, load settings from server
    if (currentUser?.id) {
      settingsService.loadSettingsFromServer(currentUser.id)
        .then((settings) => {
          if (settings.dashboardOrder) {
            setDashboardOrder(settings.dashboardOrder);
          }
        });
    }
  }, [currentUser]);

  // Handle drag end event
  const handleDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    // Reorder dashboard modules
    const newOrder = Array.from(dashboardOrder);
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);

    // Update state
    setDashboardOrder(newOrder);
    
    // Save new order to settings service
    settingsService.updateDashboardOrder(newOrder, currentUser?.id);
  };

  // Track module usage when clicked
  const handleModuleClick = (moduleId: string) => {
    if (!isEditing) {
      settingsService.trackModuleUsage(moduleId, currentUser?.id);
    }
  };

  return (
    <div className={`${className} p-4`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Trade Hybrid Dashboard</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          {isEditing ? 'Save Layout' : 'Customize Layout'}
        </button>
      </div>

      {isEditing ? (
        <div className="bg-gray-900 p-4 mb-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-2">Dashboard Customization</h2>
          <p className="text-gray-400 mb-4">
            Drag and drop modules to rearrange your dashboard. Your most frequently used modules will automatically move up in priority over time.
          </p>
        </div>
      ) : null}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" isDropDisabled={!isEditing}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {dashboardOrder.map((moduleId, index) => {
                const ModuleComponent = ModuleComponents[moduleId];
                
                return (
                  <Draggable 
                    key={moduleId} 
                    draggableId={moduleId} 
                    index={index}
                    isDragDisabled={!isEditing}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`${isEditing ? 'border-2 border-dashed border-blue-500 cursor-move' : ''} rounded-lg overflow-hidden`}
                        onClick={() => handleModuleClick(moduleId)}
                      >
                        {ModuleComponent && <ModuleComponent />}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default CustomizableDashboard;
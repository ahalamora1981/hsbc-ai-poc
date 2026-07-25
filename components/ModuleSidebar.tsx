'use client';

import { Module, ModuleName, CampaignState } from '@/types';
import { isFieldRelevant, getRequiredFields, getConditionalFields, getOptionalFields } from '@/data/field-definitions';

interface ModuleSidebarProps {
  modules: Module[];
  currentModule: ModuleName;
  onModuleClick: (module: ModuleName) => void;
  formState: CampaignState;
}

export default function ModuleSidebar({ modules, currentModule, onModuleClick, formState }: ModuleSidebarProps) {
  const getStatusColor = (status: Module['status']) => {
    switch (status) {
      case 'complete': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'waiting': return 'text-gray-500';
    }
  };

  const getStatusText = (module: Module) => {
    if (module.missingCount === 0 && module.status === 'complete') {
      return 'Complete';
    }
    if (module.status === 'waiting') {
      return 'Waiting';
    }
    return `${module.missingCount} missing`;
  };

  const getModuleIcon = (module: Module) => {
    switch (module.status) {
      case 'complete': return '✓';
      case 'in-progress': return '→';
      case 'waiting': return '○';
    }
  };

  return (
    <div className="w-[280px] bg-white border-r border-gray-200 p-4 flex-shrink-0 overflow-hidden">
      <h2 className="text-xs font-semibold text-gray-600 mb-4 uppercase tracking-wide">MODULES</h2>
      
      <div className="space-y-1">
        {modules.map((module) => (
          <button
            key={module.name}
            onClick={() => onModuleClick(module.name)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              module.name === currentModule
                ? 'bg-blue-50 text-blue-700 font-medium'
                : module.status === 'complete'
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${getStatusColor(module.status)}`}>
                  {getModuleIcon(module)}
                </span>
                <span className="truncate text-sm">{module.name}</span>
              </div>
              <span className={`text-xs ${getStatusColor(module.status)}`}>
                {getStatusText(module)}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 pt-4 px-2 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-2">
          {/* Required */}
          <div>
            <div className="font-semibold text-gray-700 mb-1">Required</div>
            <div className="pl-2 space-y-1">
              <div className="flex justify-between">
                <span>Filled:</span>
                <span className="font-medium text-green-600">
                  {modules.reduce((sum, m) => {
                    const requiredFields = m.fields.filter(f => f.required === 'Required');
                    return sum + requiredFields.filter(f => formState.values[f.name] && formState.statuses[f.name] !== 'empty').length;
                  }, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Not Filled:</span>
                <span className="font-medium text-red-600">
                  {modules.reduce((sum, m) => {
                    const requiredFields = m.fields.filter(f => f.required === 'Required');
                    return sum + requiredFields.filter(f => !formState.values[f.name] || formState.statuses[f.name] === 'empty').length;
                  }, 0)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Conditional */}
          <div>
            <div className="font-semibold text-gray-700 mb-1">Conditional</div>
            <div className="pl-2 space-y-1">
              <div className="flex justify-between">
                <span>Filled:</span>
                <span className="font-medium text-green-600">
                  {modules.reduce((sum, m) => {
                    const conditionalFields = m.fields.filter(f => f.required === 'Conditional');
                    return sum + conditionalFields.filter(f => formState.values[f.name] && formState.statuses[f.name] !== 'empty').length;
                  }, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Not Filled:</span>
                <span className="font-medium text-yellow-600">
                  {modules.reduce((sum, m) => {
                    const conditionalFields = m.fields.filter(f => f.required === 'Conditional');
                    return sum + conditionalFields.filter(f => !formState.values[f.name] || formState.statuses[f.name] === 'empty').length;
                  }, 0)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Optional */}
          <div>
            <div className="font-semibold text-gray-700 mb-1">Optional</div>
            <div className="pl-2 space-y-1">
              <div className="flex justify-between">
                <span>Filled:</span>
                <span className="font-medium text-green-600">
                  {modules.reduce((sum, m) => {
                    const optionalFields = m.fields.filter(f => f.required === 'Optional');
                    return sum + optionalFields.filter(f => formState.values[f.name] && formState.statuses[f.name] !== 'empty').length;
                  }, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Not Filled:</span>
                <span className="font-medium text-gray-500">
                  {modules.reduce((sum, m) => {
                    const optionalFields = m.fields.filter(f => f.required === 'Optional');
                    return sum + optionalFields.filter(f => !formState.values[f.name] || formState.statuses[f.name] === 'empty').length;
                  }, 0)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Grand Total */}
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Total Filled:</span>
              <span className="font-semibold text-green-600">
                {modules.reduce((sum, m) => {
                  return sum + m.fields.filter(f => formState.values[f.name] && formState.statuses[f.name] !== 'empty').length;
                }, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Total Not Filled:</span>
              <span className="font-semibold text-gray-500">
                {modules.reduce((sum, m) => {
                  return sum + m.fields.filter(f => !formState.values[f.name] || formState.statuses[f.name] === 'empty').length;
                }, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

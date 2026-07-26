'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { CampaignState, ReferenceUseCase, FieldStatus, FieldDefinition, ModuleName, Module } from '@/types';
import { isFieldRelevant, moduleOrder, getRequiredFields } from '@/data/field-definitions';
import ReferenceCards from './ReferenceCards';
import FieldRow from './FieldRow';
import ChannelMatrix from './ChannelMatrix';

interface FormPanelProps {
  formState: CampaignState;
  referenceUseCases: ReferenceUseCase[];
  showReferences: boolean;
  onFieldEdit: (fieldName: string, value: string) => void;
  onFieldConfirm: (fieldName: string) => void;
  onSelectReference: (useCaseId: string) => void;
  onStartFresh: () => void;
  onViewReferences: () => void;
  onAdvanceModule: () => void;
  scrollToModule?: ModuleName | null;
  onScrollComplete?: () => void;
}

const moduleDescriptions: Record<string, string> = {
  'Basic Info': 'Confirm core use case information and source-system context.',
  'Extension Info': 'Confirm ownership, business hierarchy, schedule, risk and triggering condition.',
  'Delivery Channel': 'Configure channel priority, routing, tags, sender identity and traffic strategy.',
  'Opt-In Flag': 'Opt-in flags are computed based on channel selection and other settings.',
  'Bounce Back': 'Configure bounce back behavior for each channel.',
};

function getModuleMissingCount(module: Module, formState: CampaignState): number {
  const relevantFields = module.fields.filter(f => isFieldRelevant(f.name, formState.channels, formState.values));
  return relevantFields.filter(f => 
    !formState.values[f.name] || formState.statuses[f.name] === 'empty'
  ).length;
}

export default function FormPanel({
  formState,
  referenceUseCases,
  showReferences,
  onFieldEdit,
  onFieldConfirm,
  onSelectReference,
  onStartFresh,
  onViewReferences,
  onAdvanceModule,
  scrollToModule,
  onScrollComplete,
}: FormPanelProps) {
  // Track which modules are expanded (default: current module is expanded)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([formState.currentModule]));
  
  // Refs for module sections
  const moduleRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Toggle module expansion
  const toggleModule = useCallback((moduleName: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleName)) {
        next.delete(moduleName);
      } else {
        next.add(moduleName);
      }
      return next;
    });
  }, []);

  // Auto-expand current module when it changes
  useEffect(() => {
    setExpandedModules(prev => new Set([...prev, formState.currentModule]));
  }, [formState.currentModule]);

  // Scroll to module when scrollToModule changes
  useEffect(() => {
    if (scrollToModule) {
      const moduleEl = moduleRefs.current.get(scrollToModule);
      if (moduleEl) {
        // Expand the module if not already expanded
        setExpandedModules(prev => new Set([...prev, scrollToModule]));
        // Scroll to the module with a small delay to allow expansion
        setTimeout(() => {
          moduleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Reset scrollToModule after scrolling
          onScrollComplete?.();
        }, 100);
      }
    }
  }, [scrollToModule, onScrollComplete]);

  // Register module ref
  const setModuleRef = useCallback((moduleName: string, el: HTMLDivElement | null) => {
    if (el) {
      moduleRefs.current.set(moduleName, el);
    } else {
      moduleRefs.current.delete(moduleName);
    }
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 h-full">
      {/* Reference Selection */}
      {showReferences && referenceUseCases.length > 0 && (
        <ReferenceCards
          useCases={referenceUseCases}
          onSelect={onSelectReference}
          onStartFresh={onStartFresh}
        />
      )}

      {/* Requirement Prefill Ready Header */}
      {!showReferences && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Requirement prefill ready</h2>
            <p className="text-sm text-gray-500">
              Only values extracted from the requirement are currently populated. 
              Select a historical use case to apply reference-prefilled values.
            </p>
          </div>
          <button
            onClick={onViewReferences}
            className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            View historical matches
          </button>
        </div>
      )}

      {/* All Modules in Order */}
      {formState.modules.map(module => {
        const isCurrentModule = module.name === formState.currentModule;
        const isExpanded = expandedModules.has(module.name);
        const missingCount = getModuleMissingCount(module, formState);
        const isComplete = missingCount === 0;

        return (
          <div 
            key={module.name} 
            className="mb-4"
            ref={(el) => setModuleRef(module.name, el)}
          >
            {/* Module Header - Clickable to expand/collapse */}
            <div 
              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                isCurrentModule 
                  ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100' 
                  : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => toggleModule(module.name)}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isComplete 
                    ? 'bg-green-500 text-white' 
                    : isCurrentModule
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {isComplete ? '✓' : isCurrentModule ? '→' : '○'}
                </span>
                <span className={`font-medium ${isCurrentModule ? 'text-blue-700' : 'text-gray-700'}`}>
                  {module.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${isComplete ? 'text-green-600' : isCurrentModule ? 'text-blue-600' : 'text-gray-500'}`}>
                  {isComplete ? 'Complete' : `${missingCount} missing`}
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''} ${isCurrentModule ? 'text-blue-500' : 'text-gray-400'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Module Content - Expanded */}
            {isExpanded && (
              <div className="mt-2 ml-4">
                {/* Module Description */}
                <p className="text-sm text-gray-500 mb-4">
                  {moduleDescriptions[module.name] || ''}
                </p>

                {/* Channel Matrix for Delivery Channel module */}
                {module.name === 'Delivery Channel' && formState.channels.length > 0 && (
                  <ChannelMatrix
                    channels={formState.channels}
                    formState={formState}
                    onFieldEdit={onFieldEdit}
                    onFieldConfirm={onFieldConfirm}
                  />
                )}

                {/* Field Rows */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
                    <div className="col-span-3">Field</div>
                    <div className="col-span-4">Value</div>
                    <div className="col-span-1 text-center">Help</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Action</div>
                  </div>

                  {/* Field Rows */}
                  {module.fields
                    .filter(field => isFieldRelevant(field.name, formState.channels, formState.values))
                    .map(field => (
                      <FieldRow
                        key={field.name}
                        field={field}
                        value={formState.values[field.name] as string}
                        status={formState.statuses[field.name] || 'empty'}
                        onEdit={onFieldEdit}
                        onConfirm={onFieldConfirm}
                      />
                    ))}
                </div>

                {/* Next Module Button - Only show for current module */}
                {isCurrentModule && (() => {
                  const currentIndex = moduleOrder.indexOf(formState.currentModule);
                  const nextModule = moduleOrder[currentIndex + 1];
                  if (!nextModule) return null;
                  
                  // Check if all required fields in current module are filled
                  const requiredFields = getRequiredFields(formState.currentModule);
                  const allRequiredFilled = requiredFields.every(f => 
                    formState.values[f.name] && formState.statuses[f.name] !== 'empty'
                  );
                  
                  if (!allRequiredFilled) return null;
                  
                  return (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAdvanceModule();
                        }}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
                      >
                        Next: {nextModule}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

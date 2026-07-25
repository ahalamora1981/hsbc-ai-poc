'use client';

import { CampaignState, ReferenceUseCase, FieldStatus, FieldDefinition } from '@/types';
import { isFieldRelevant } from '@/data/field-definitions';
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
}: FormPanelProps) {
  const currentModule = formState.modules.find(m => m.name === formState.currentModule);

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

      {/* Current Module Section */}
      {currentModule && (
        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{currentModule.name}</h3>
            {currentModule.name === 'Basic Info' && (
              <p className="text-sm text-gray-500">
                Confirm core use case information and source-system context.
              </p>
            )}
            {currentModule.name === 'Extension Info' && (
              <p className="text-sm text-gray-500">
                Confirm ownership, business hierarchy, schedule, risk and triggering condition.
              </p>
            )}
            {currentModule.name === 'Delivery Channel' && (
              <p className="text-sm text-gray-500">
                Configure channel priority, routing, tags, sender identity and traffic strategy.
              </p>
            )}
            {currentModule.name === 'Opt-In Flag' && (
              <p className="text-sm text-gray-500">
                Opt-in flags are computed based on channel selection and other settings.
              </p>
            )}
            {currentModule.name === 'Bounce Back' && (
              <p className="text-sm text-gray-500">
                Configure bounce back behavior for each channel.
              </p>
            )}
            {currentModule.name === 'Opt-In Flag' && (
              <p className="text-sm text-gray-500">
                Opt-in flags are computed based on channel selection and other settings.
              </p>
            )}
            {currentModule.name === 'Bounce Back' && (
              <p className="text-sm text-gray-500">
                Configure bounce back behavior for each channel.
              </p>
            )}
          </div>

          {/* Channel Matrix for Delivery Channel module */}
          {currentModule.name === 'Delivery Channel' && formState.channels.length > 0 && (
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
            {currentModule.fields
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
        </div>
      )}

      {/* Other Modules Preview */}
      {formState.modules
        .filter(m => m.name !== formState.currentModule)
        .map(module => (
          <div key={module.name} className="mb-4 opacity-50">
            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  module.status === 'complete' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {module.status === 'complete' ? '✓' : '○'}
                </span>
                <span className="font-medium text-gray-700">{module.name}</span>
              </div>
              <span className="text-sm text-gray-500">
                {module.missingCount > 0 ? `${module.missingCount} missing` : module.status === 'complete' ? 'Complete' : 'Waiting'}
              </span>
            </div>
          </div>
        ))}
    </div>
  );
}

'use client';

import { CampaignState, FieldStatus } from '@/types';
import { fieldDefinitions } from '@/data/field-definitions';

interface ChannelMatrixProps {
  channels: string[];
  formState: CampaignState;
  onFieldEdit: (fieldName: string, value: string) => void;
  onFieldConfirm: (fieldName: string) => void;
}

export default function ChannelMatrix({ channels, formState, onFieldEdit, onFieldConfirm }: ChannelMatrixProps) {
  const channelFields = fieldDefinitions.filter(f => 
    f.module === 'Delivery Channel' && 
    f.dependsOn &&
    channels.some(ch => f.dependsOn?.includes(ch))
  );

  const getFieldNameForChannel = (baseFieldName: string, channel: string) => {
    return `${baseFieldName}_${channel.toLowerCase()}`;
  };

  return (
    <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h4 className="font-medium text-gray-900">Per-Channel Delivery Rule Matrix</h4>
        <p className="text-sm text-gray-500">Configure priority, routing, tags, sender identity and traffic strategy per channel.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50">
                Field
              </th>
              {channels.map(channel => (
                <th key={channel} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50">
                  {channel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {channelFields.map(field => (
              <tr key={field.name} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{field.displayName}</div>
                  <div className="text-xs text-gray-500">{field.name}</div>
                </td>
                {channels.map(channel => {
                  const isRelevant = field.dependsOn?.includes(channel);
                  const fieldName = getFieldNameForChannel(field.name, channel);
                  const value = formState.values[fieldName] as string;
                  const status = formState.statuses[fieldName] || 'empty';

                  return (
                    <td key={channel} className="px-4 py-3">
                      {isRelevant ? (
                        <div>
                          {field.fieldType === 'select' && field.options ? (
                            <select
                              value={value || ''}
                              onChange={(e) => {
                                onFieldEdit(fieldName, e.target.value);
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select</option>
                              {field.options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          ) : field.fieldType === 'number' ? (
                            <input
                              type="number"
                              value={value || ''}
                              onChange={(e) => onFieldEdit(fieldName, e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              placeholder="0"
                            />
                          ) : (
                            <input
                              type="text"
                              value={value || ''}
                              onChange={(e) => onFieldEdit(fieldName, e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              placeholder="Add value"
                            />
                          )}
                          {status === 'confirmed' && (
                            <span className="text-xs text-green-600 mt-1">✓ Confirmed</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

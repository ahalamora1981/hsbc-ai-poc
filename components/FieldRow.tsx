'use client';

import { useState } from 'react';
import { FieldDefinition, FieldStatus } from '@/types';

interface FieldRowProps {
  field: FieldDefinition;
  value: string | undefined;
  status: FieldStatus;
  onEdit: (fieldName: string, value: string) => void;
  onConfirm: (fieldName: string) => void;
}

export default function FieldRow({ field, value, status, onEdit, onConfirm }: FieldRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSave = () => {
    onEdit(field.name, editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'ai-prefill':
      case 'reference-prefill':
      case 'filled':
        return <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">Filled</span>;
      case 'confirmed':
        return <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">Confirmed</span>;
      case 'modified':
        return <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">Modified</span>;
      default:
        if (field.required === 'Required') {
          return <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded whitespace-nowrap">Required</span>;
        }
        if (field.required === 'Conditional') {
          return <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded whitespace-nowrap">Conditional</span>;
        }
        return <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded">Optional</span>;
    }
  };

  const renderInput = () => {
    if (field.fieldType === 'select' && field.options) {
      return (
        <select
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value);
            onEdit(field.name, e.target.value);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Select value</option>
          {field.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    if (field.fieldType === 'textarea') {
      return (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Add value"
        />
      );
    }

    return (
      <input
        type={field.fieldType === 'number' ? 'number' : 'text'}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') handleCancel();
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        placeholder="Add value"
      />
    );
  };

  return (
    <div className="grid grid-cols-12 gap-3 px-4 py-4 border-b border-gray-100 hover:bg-gray-50 items-center">
      {/* Field Name */}
      <div className="col-span-3">
        <div className="font-medium text-gray-900 text-sm">{field.displayName}</div>
        <div className="text-xs text-gray-400">{field.name}</div>
      </div>

      {/* Value */}
      <div className="col-span-4">
        {isEditing ? (
          <div className="flex gap-2">
            {renderInput()}
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="cursor-pointer text-sm"
          >
            {value ? (
              <span className="text-gray-900">{value}</span>
            ) : (
              <span className="text-gray-400">Add value</span>
            )}
          </div>
        )}
      </div>

      {/* Help */}
      <div 
        className="col-span-1 relative flex items-center justify-center"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs hover:bg-gray-300">
          ?
        </button>
        {showTooltip && (
          <div className="absolute z-10 w-56 p-3 bg-white border border-gray-200 text-xs rounded-lg shadow-lg left-1/2 -translate-x-1/2 bottom-full mb-2">
            <div className="text-gray-700">{field.businessDescription}</div>
            {field.dependsOn && (
              <div className="mt-2 pt-2 border-t border-gray-100 text-gray-500 text-[10px]">
                Depends on: {field.dependsOn}
              </div>
            )}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-white border-r border-b border-gray-200 rotate-45 -mt-1" />
          </div>
        )}
      </div>

      {/* Status */}
      <div className="col-span-2 flex items-center justify-start">
        {getStatusBadge()}
      </div>

      {/* Action */}
      <div className="col-span-2 flex items-center justify-end">
        {status === 'empty' ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
          >
            Add
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import { ReferenceUseCase } from '@/types';

interface ReferenceCardsProps {
  useCases: ReferenceUseCase[];
  onSelect: (useCaseId: string) => void;
  onStartFresh: () => void;
}

export default function ReferenceCards({ useCases, onSelect, onStartFresh }: ReferenceCardsProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Related historical use cases</h2>
          <p className="text-sm text-gray-500">Select a reference or start a new use case.</p>
        </div>
        <button
          onClick={onStartFresh}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Start new use case
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {useCases.map((useCase) => (
          <div
            key={useCase.id}
            className={`bg-white rounded-lg border-2 p-4 transition-all hover:shadow-md ${
              useCase.isBestMatch
                ? 'border-green-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                useCase.isBestMatch
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {useCase.isBestMatch ? 'Best match' : 'Possible match'}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {useCase.similarity}%
              </span>
            </div>

            <h3 className="font-medium text-gray-900 mb-1">{useCase.name}</h3>
            <p className="text-xs text-gray-500 mb-3">{useCase.description}</p>

            <div className="flex flex-wrap gap-1 mb-4">
              {useCase.channels.map(channel => (
                <span
                  key={channel}
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    channel === 'SMS' ? 'bg-blue-100 text-blue-700' :
                    channel === 'EMAIL' ? 'bg-purple-100 text-purple-700' :
                    channel === 'PUSH' ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  }`}
                >
                  {channel}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onSelect(useCase.id)}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Use as reference
              </button>
              <button
                className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

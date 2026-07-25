'use client';

const steps = [
  { number: 1, label: 'Drafted' },
  { number: 2, label: 'Content Preparation' },
  { number: 3, label: 'Pending for QC' },
  { number: 4, label: 'Pending for 2LoD 1st' },
  { number: 5, label: 'Pending for 2LoD 2nd' },
  { number: 6, label: 'Template Development' },
  { number: 7, label: 'UAT Sign Off' },
  { number: 8, label: 'Signed off' },
  { number: 9, label: 'Released' },
];

export default function StepperHeader() {
  return (
    <div className="bg-white px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Campaign Configuration</h1>
          <p className="text-sm text-gray-500">Configure customer messaging settings for your business use case.</p>
        </div>
        <span className="text-sm text-gray-500">Drafted</span>
      </div>
      
      <div className="flex items-start justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-start flex-1">
            <div className="flex flex-col items-center w-full">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.number === 1
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.number}
              </div>
              <span
                className={`text-[10px] mt-1.5 text-center leading-tight min-h-[28px] flex items-start ${
                  step.number === 1 ? 'text-green-600 font-medium' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex items-center -mx-1 mt-2.5">
                <div className={`w-4 h-0.5 ${step.number === 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div className={`w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[4px] ${
                  step.number === 1 ? 'border-l-green-500' : 'border-l-gray-300'
                }`} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

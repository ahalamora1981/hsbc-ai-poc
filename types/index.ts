// Field definition from CSV
export interface FieldDefinition {
  name: string;
  displayName: string;
  businessDescription: string;
  module: ModuleName;
  required: 'Required' | 'Required by UI' | 'Optional' | 'Conditional' | 'Optional / generated' | 'Required when channel selected' | 'Required for SMS' | 'Required for SMS/EMAIL multi-path' | 'Required by section';
  section: string;
  dependsOn?: string;
  fieldType: 'text' | 'select' | 'boolean' | 'number' | 'textarea';
  options?: { label: string; value: string }[];
}

export type ModuleName = 'Basic Info' | 'Extension Info' | 'Delivery Channel' | 'Opt-In Flag' | 'Bounce Back';

export interface Module {
  name: ModuleName;
  fields: FieldDefinition[];
}

// Campaign form state
export interface CampaignState {
  modules: Module[];
  currentModule: ModuleName;
  channels: string[];
  values: Record<string, string | number | boolean>;
  statuses: Record<string, FieldStatus>;
}

export type FieldStatus = 'empty' | 'ai-prefill' | 'reference-prefill' | 'filled' | 'confirmed' | 'modified' | 'user-input' | 'historical-stats';

// Reference use case
export interface ReferenceUseCase {
  id: string;
  name: string;
  description: string;
  channels: string[];
  similarity: number;
  values: Record<string, string | number | boolean | undefined>;
  isBestMatch: boolean;
}

// Historical statistics
export interface HistoricalStats {
  department: string;
  lineOfBusiness: string;
  stats: Record<string, string | number | boolean>;
}

// Chat message
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type: 'text' | 'action-card' | 'processing' | 'hint' | 'error';
  actionButtons?: ActionButton[];
  functionCall?: FunctionCall;
}

export interface ActionButton {
  label: string;
  action: string;
  variant: 'primary' | 'secondary' | 'danger';
}

export interface FunctionCall {
  name: string;
  arguments: Record<string, unknown>;
}

// API types
export interface ChatRequest {
  messages: ChatMessage[];
  formState: CampaignState;
  userMessage: string;
}

export interface ChatResponse {
  message: ChatMessage;
  functionCalls?: FunctionCall[];
}

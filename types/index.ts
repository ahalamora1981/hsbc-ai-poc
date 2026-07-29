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
  // BR-09: field is only editable during campaign creation, not edit mode
  editableInCreateOnly?: boolean;
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

export type FieldStatus = 'empty' | 'ai-prefill' | 'reference-prefill' | 'filled' | 'confirmed' | 'modified' | 'user-input';

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
// ---------------------------------------------------------------------------
// Reference data model (mirrors BRD 3-table architecture, sourced from CSVs)
// ---------------------------------------------------------------------------

// Org directory entry (from users.csv)
export interface OrgUser {
  name: string;
  grade: string;
  title: string;
  reportsTo: string;
  level: number;
  entity: string; // group_member
  market: string; // country_code
  lineOfBusiness: string;
  serviceLine: string;
  departHead: string;
  teamHead: string;
  messageOwner: string;
  businessLine1stLevel: string;
  businessLine2ndLevel: string;
  businessTeam: string;
  businessContact: string;
}

// Channel-specific delivery rule (from use-case-channel-rules.csv → tbl_use_case_channel_rule)
export interface ChannelRule {
  use_case_id: string;
  channel: string;
  priority: string;
  app_name: string;
  send_to_china_flag: string;
  traffic_percentage: string;
  sender: string;
  sender_name: string;
  cost_center_id: string;
  encrypt_type: string;
}

// Full reference use case (from use-cases.csv → tbl_use_case + tbl_use_case_ext)
export interface ReferenceUseCaseFull {
  use_case_id: string;
  values: Record<string, string | number | boolean | undefined>;
  // Fields that can be auto-populated/derived (from CSV auto_populated column)
  autoPopulated: string[];
  // Channel rules attached to this use case (1:N)
  channelRules: ChannelRule[];
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

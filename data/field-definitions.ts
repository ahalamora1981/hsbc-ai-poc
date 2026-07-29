import { FieldDefinition, ModuleName } from '@/types';

export const fieldDefinitions: FieldDefinition[] = [
  // Basic Info
  { name: 'group_member', displayName: 'Entity', businessDescription: 'Entity / group member, e.g. HASE, HSBC', module: 'Basic Info', required: 'Required', section: 'Basic Information', fieldType: 'select', options: [{ label: 'HASE', value: 'HASE' }, { label: 'HSBC', value: 'HSBC' }] },
  { name: 'country_code', displayName: 'Market', businessDescription: 'Use case cover business area. E.g.: INHK -- HK / MO, HASE only HK', module: 'Basic Info', required: 'Required', section: 'Basic Information', fieldType: 'select', options: [{ label: 'INHK (HK/MO)', value: 'INHK' }, { label: 'HASE (HK only)', value: 'HASE' }] },
  { name: 'line_of_business', displayName: 'Line Of Business', businessDescription: 'Line of business', module: 'Basic Info', required: 'Required', section: 'Basic Information', fieldType: 'select', options: [{ label: 'WPB', value: 'WPB' }, { label: 'RB', value: 'RB' }, { label: 'CMB', value: 'CMB' }], editableInCreateOnly: true },
  { name: 'use_case_name', displayName: 'Use Case Name', businessDescription: "The business scenario for the message triggering, it's for user to check the related message delivery information in MDC MI report", module: 'Basic Info', required: 'Required', section: 'Basic Information', fieldType: 'text' },
  { name: 'project_name', displayName: 'Project Name', businessDescription: 'Project name', module: 'Basic Info', required: 'Required', section: 'Basic Information', fieldType: 'text' },
  { name: 'source_system', displayName: 'Source System', businessDescription: 'Source system name that will pass the notification request to MDC', module: 'Basic Info', required: 'Required', section: 'Technical Requirement', fieldType: 'text' },
  { name: 'downstream_name', displayName: 'Downstream Name', businessDescription: 'Downstream system/name that MDC will pass the notification request from MDC', module: 'Basic Info', required: 'Optional', section: 'Technical Requirement', fieldType: 'text' },
  { name: 'service_line', displayName: 'Service Line', businessDescription: 'Message servicing nature, servicing or marketing', module: 'Basic Info', required: 'Required', section: 'Message Classification', fieldType: 'select', options: [{ label: 'Servicing', value: 'Servicing' }, { label: 'Marketing', value: 'Marketing' }] },

  // Extension Info
  { name: 'depart_head', displayName: 'Depart. Head', businessDescription: 'Department head, MD or GCB 2', module: 'Extension Info', required: 'Required by UI', section: 'Basic Information', fieldType: 'text' },
  { name: 'team_head', displayName: 'Team Head', businessDescription: 'Team head, GCB 3', module: 'Extension Info', required: 'Required by UI', section: 'Basic Information', fieldType: 'text' },
  { name: 'message_owner', displayName: 'Message Owner', businessDescription: 'Message owner, GCB 5 or above', module: 'Extension Info', required: 'Required', section: 'Basic Information', fieldType: 'text' },
  { name: 'business_line_1st_level', displayName: 'Business Line 1st Level', businessDescription: 'Business line first level, the department of the department head', module: 'Extension Info', required: 'Required by UI', section: 'Basic Information', fieldType: 'text' },
  { name: 'business_line_2nd_level', displayName: 'Business Line 2nd Level', businessDescription: 'Business line second level, the department of the team head', module: 'Extension Info', required: 'Required by UI', section: 'Basic Information', fieldType: 'text' },
  { name: 'delivery_schedule', displayName: 'Is 7×24', businessDescription: 'Whether delivery schedule supports 7×24', module: 'Extension Info', required: 'Required', section: 'Message Classification', fieldType: 'select', options: [{ label: 'Yes (7×24)', value: 'Yes' }, { label: 'No', value: 'No' }] },
  { name: 'delivery_schedule_other', displayName: 'Other Schedule', businessDescription: "If the delivery schedule doesn't need to support 7×24, what's the expected delivery frequency", module: 'Extension Info', required: 'Conditional', section: 'Message Classification', fieldType: 'text', dependsOn: 'delivery_schedule=No' },
  { name: 'high_risk_flag', displayName: 'Is High Risk', businessDescription: 'High risk critical message flag: regulatory message, time sensitive message, message for high-risk transaction', module: 'Extension Info', required: 'Required', section: 'Message Classification', fieldType: 'select', options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }] },
  { name: 'is_dual_channel', displayName: 'Is Dual Channel', businessDescription: 'Dual channel message flag, if the message requires to send dual channel or not', module: 'Extension Info', required: 'Optional', section: 'Message Classification', fieldType: 'select', options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }] },
  { name: 'support_dual_vendor', displayName: 'Support Dual Vendor', businessDescription: 'Support dual vendor flag, if the SMS requires to send through dual vendor or not, high-risk message is a must for this feature', module: 'Extension Info', required: 'Optional', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }] },
  { name: 'business_team', displayName: 'Business Team', businessDescription: 'Business team', module: 'Extension Info', required: 'Optional', section: 'Basic Information', fieldType: 'text' },
  { name: 'business_contact', displayName: 'Business Contact', businessDescription: 'Business contact', module: 'Extension Info', required: 'Optional', section: '', fieldType: 'text' },
  { name: 'message_trigger_conditions', displayName: 'Message Trigger Conditions', businessDescription: 'Message trigger conditions', module: 'Extension Info', required: 'Optional', section: 'Basic Information', fieldType: 'textarea' },
  { name: 'message_journey', displayName: 'Message Journey', businessDescription: 'Message journey', module: 'Extension Info', required: 'Optional', section: '', fieldType: 'text' },
  { name: 'customer_journey', displayName: 'Customer Journey', businessDescription: 'Customer journey', module: 'Extension Info', required: 'Optional', section: '', fieldType: 'text' },
  { name: 'business_journey', displayName: 'Business Journey', businessDescription: 'Business journey', module: 'Extension Info', required: 'Optional', section: '', fieldType: 'text' },
  { name: 'remarks', displayName: 'Remarks', businessDescription: 'Key information', module: 'Extension Info', required: 'Optional', section: '', fieldType: 'textarea' },
  { name: 'regulatory_requirement', displayName: 'Regulatory Requirement', businessDescription: 'Regulatory requirement details like MECP B9 + B11, TM-E-1 FAQ 4.1 Q11', module: 'Extension Info', required: 'Optional', section: 'Message Classification', fieldType: 'text' },
  { name: 'cost_owner', displayName: 'Cost Owner', businessDescription: 'Cost owner', module: 'Extension Info', required: 'Required by UI', section: '', fieldType: 'text' },

  // Delivery Channel
  { name: 'channel', displayName: 'Delivery Channel', businessDescription: 'Selected delivery channel', module: 'Delivery Channel', required: 'Required', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'SMS', value: 'SMS' }, { label: 'EMAIL', value: 'EMAIL' }, { label: 'PUSH', value: 'PUSH' }, { label: 'LETTER', value: 'LETTER' }] },
  { name: 'priority', displayName: 'Priority', businessDescription: 'Channel priority / mandatory routing', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'High', value: 'High' }, { label: 'Medium', value: 'Medium' }, { label: 'Low', value: 'Low' }] },
  { name: 'app_name', displayName: 'App Name', businessDescription: 'The App name for Push Notification', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'text', dependsOn: 'PUSH' },
  { name: 'send_to_china_flag', displayName: 'Send to China', businessDescription: 'Requires to send to China Mobile Number or NOT', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }], dependsOn: 'SMS' },
  { name: 'traffic_percentage', displayName: 'Traffic Percentage', businessDescription: 'Traffic split percentage', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'number', dependsOn: 'SMS,EMAIL,PUSH' },
  { name: 'sender', displayName: 'Sender', businessDescription: 'Sender ID/address/name depending on channel', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'text', dependsOn: 'SMS,EMAIL' },
  { name: 'sender_name', displayName: 'Sender Name', businessDescription: 'Email sender name', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'text', dependsOn: 'EMAIL' },
  { name: 'cost_center_id', displayName: 'Cost Center Id', businessDescription: 'SMS cost center id', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'text', dependsOn: 'SMS' },
  { name: 'encrypt_type', displayName: 'Encrypt Type', businessDescription: 'Email encryption type: TLS is for public or internal, Encrypt is for restricted or highly restricted', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'TLS', value: 'TLS' }, { label: 'Encrypt', value: 'Encrypt' }], dependsOn: 'EMAIL' },

  // Opt-In Flag (computed/read-only)
  { name: 'push_optin_flag', displayName: 'Master Opt-in', businessDescription: 'Opt-in master flag', module: 'Opt-In Flag', required: 'Optional', section: 'Technical Requirement', fieldType: 'boolean', dependsOn: 'PUSH' },
  { name: 'marketing_optin_flag', displayName: 'Marketing Opt-in', businessDescription: 'Push marketing opt-in flag', module: 'Opt-In Flag', required: 'Optional', section: 'Technical Requirement', fieldType: 'boolean', dependsOn: 'PUSH & app_name' },
  { name: 'high_risk_push_optin_flag', displayName: 'High Risk Opt-in', businessDescription: 'Push high risk opt-in flag (DAASC path)', module: 'Opt-In Flag', required: 'Optional', section: 'Technical Requirement', fieldType: 'boolean', dependsOn: 'PUSH' },

  // Bounce Back
  { name: 'bounce_back', displayName: 'Callback', businessDescription: 'Bounce back callback flag, mobile will call MDC API to let MDC know when it received the PN', module: 'Bounce Back', required: 'Conditional', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }], dependsOn: 'PUSH' },
  { name: 'letter_bounce_back_success_flag', displayName: 'Letter Bounce Back', businessDescription: 'Letter bounce back success flag, it is for the INHK eStatement/eAdvice case', module: 'Bounce Back', required: 'Optional', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }], dependsOn: 'LETTER' },
  { name: 'push_bounce_back_period', displayName: 'Push Bounce Back Period', businessDescription: 'Push bounce back period in minutes', module: 'Bounce Back', required: 'Optional', section: 'Technical Requirement', fieldType: 'number', dependsOn: 'PUSH & bounce_back=Yes' },
  { name: 'sms_bounce_back_period', displayName: 'SMS Bounce Back Period', businessDescription: 'SMS bounce back period in minutes', module: 'Bounce Back', required: 'Optional', section: 'Technical Requirement', fieldType: 'number', dependsOn: 'SMS & unknown_bounce_back_status=Yes' },
  { name: 'email_bounce_back_period', displayName: 'Email Bounce Back Period', businessDescription: 'Email bounce back period in minutes', module: 'Bounce Back', required: 'Optional', section: 'Technical Requirement', fieldType: 'number', dependsOn: 'EMAIL & unknown_bounce_back_status=Yes' },
  { name: 'letter_bounce_back_period', displayName: 'Letter Bounce Back Period', businessDescription: 'Letter bounce back period in minutes', module: 'Bounce Back', required: 'Optional', section: 'Technical Requirement', fieldType: 'number', dependsOn: 'LETTER & unknown_bounce_back_status=Yes' },
  { name: 'bounce_back_next_channel', displayName: 'Bounce Back Next Channel', businessDescription: 'Whether route to next channel after bounce back', module: 'Bounce Back', required: 'Optional', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }] },
  { name: 'unknown_bounce_back_status', displayName: 'Unknown Bounce Back Status', businessDescription: "When opened this button, MDC will check the channel bounce back period set above", module: 'Bounce Back', required: 'Optional', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }] },
  { name: 'auto_bounce_back_flag', displayName: 'Auto Update Invalid Flag', businessDescription: 'Auto update mobile number / email invalid flag to CUS when getting the failed status', module: 'Bounce Back', required: 'Optional', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }] },
];

export const moduleOrder: ModuleName[] = ['Basic Info', 'Extension Info', 'Delivery Channel', 'Opt-In Flag', 'Bounce Back'];

export function getFieldsByModule(module: ModuleName): FieldDefinition[] {
  return fieldDefinitions.filter(f => f.module === module);
}

export function getRequiredFields(module: ModuleName): FieldDefinition[] {
  return getFieldsByModule(module).filter(f => f.required === 'Required');
}

export function getConditionalFields(module: ModuleName): FieldDefinition[] {
  return getFieldsByModule(module).filter(f => f.required === 'Conditional');
}

export function getOptionalFields(module: ModuleName): FieldDefinition[] {
  return getFieldsByModule(module).filter(f => f.required === 'Optional');
}

// Get fields that need to be filled before advancing to next module.
// Includes Required + Required by UI fields, plus Conditional fields whose
// dependencies are currently satisfied (channel + value based).
export function getActionableFields(
  module: ModuleName,
  channels: string[],
  values: Record<string, string | number | boolean> = {}
): FieldDefinition[] {
  const moduleFields = getFieldsByModule(module);

  return moduleFields.filter(f => {
    if (f.required === 'Required' || f.required === 'Required by UI') return true;
    if (f.required === 'Conditional') return isFieldRelevant(f.name, channels, values);
    return false;
  });
}

export function getFieldDependencies(fieldName: string): string[] {
  const field = fieldDefinitions.find(f => f.name === fieldName);
  if (!field?.dependsOn) return [];
  const dep = field.dependsOn;
  const separator = dep.includes('&') ? '&' : ',';
  return dep.split(separator).map(d => d.trim());
}

const CHANNEL_TOKENS = ['SMS', 'EMAIL', 'PUSH', 'LETTER'];

// Evaluate a single dependency token against current channels/values.
// Token forms: a channel name (e.g. 'SMS'), 'field=value', or 'field' (has value).
function isTokenSatisfied(
  token: string,
  channels: string[],
  values: Record<string, string | number | boolean>
): boolean {
  const t = token.trim();
  if (!t) return true;

  if (CHANNEL_TOKENS.includes(t)) return channels.includes(t);

  if (t.includes('=')) {
    const [key, val] = t.split('=').map(s => s.trim());
    return String(values[key]) === val;
  }

  // "has value" token (e.g. app_name)
  const v = values[t];
  return v !== undefined && v !== '' && v !== false;
}

// Determine whether a field should be visible/relevant given the current
// channel selection and field values. Implements BRD §5 dependency rules.
// Semantics: '&' => all tokens must be satisfied (AND); ',' => any token (OR).
export function isFieldRelevant(
  fieldName: string,
  channels: string[],
  values: Record<string, string | number | boolean>
): boolean {
  const field = fieldDefinitions.find(f => f.name === fieldName);
  if (!field?.dependsOn) return true;

  const dep = field.dependsOn.trim();

  if (dep.includes('&')) {
    return dep.split('&').every(tok => isTokenSatisfied(tok, channels, values));
  }

  return dep.split(',').some(tok => isTokenSatisfied(tok, channels, values));
}

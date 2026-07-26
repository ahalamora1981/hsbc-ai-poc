import { FieldDefinition, ModuleName } from '@/types';

export const fieldDefinitions: FieldDefinition[] = [
  // Basic Info
  { name: 'group_member', displayName: 'Entity', businessDescription: 'Entity / group member, e.g. HASE, HSBC', module: 'Basic Info', required: 'Required', section: 'Basic Information', fieldType: 'select', options: [{ label: 'HASE', value: 'HASE' }, { label: 'HSBC', value: 'HSBC' }] },
  { name: 'country_code', displayName: 'Market', businessDescription: 'Use case cover business area. E.g.: INHK -- HK / MO, HASE only HK', module: 'Basic Info', required: 'Required', section: 'Basic Information', fieldType: 'select', options: [{ label: 'INHK (HK/MO)', value: 'INHK' }, { label: 'HASE (HK only)', value: 'HASE' }] },
  { name: 'line_of_business', displayName: 'Line Of Business', businessDescription: 'Line of business', module: 'Basic Info', required: 'Required', section: 'Basic Information', fieldType: 'select', options: [{ label: 'WPB', value: 'WPB' }, { label: 'RB', value: 'RB' }, { label: 'CMB', value: 'CMB' }], dependsOn: 'create mode editable' },
  { name: 'use_case_name', displayName: 'Use Case Name', businessDescription: "The business scenario for the message triggering, it's for user to check the related message delivery information in MDC MI report", module: 'Basic Info', required: 'Required', section: 'Basic Information', fieldType: 'text' },
  { name: 'project_name', displayName: 'Project Name', businessDescription: 'Project name', module: 'Basic Info', required: 'Required', section: 'Basic Information', fieldType: 'text' },
  { name: 'source_system', displayName: 'Source System', businessDescription: 'Source system name that will pass the notification request to MDC', module: 'Basic Info', required: 'Required', section: 'Technical Requirement', fieldType: 'text' },
  { name: 'downstream_name', displayName: 'Downstream Name', businessDescription: 'Downstream system/name that MDC will pass the notification request from MDC', module: 'Basic Info', required: 'Optional', section: 'Technical Requirement', fieldType: 'text' },
  { name: 'service_line', displayName: 'Service Line', businessDescription: 'Message servicing nature, servicing or marketing', module: 'Basic Info', required: 'Required', section: 'Message Classification', fieldType: 'select', options: [{ label: 'Servicing', value: 'Servicing' }, { label: 'Marketing', value: 'Marketing' }] },

  // Extension Info
  { name: 'depart_head', displayName: 'Depart. Head', businessDescription: 'Department head, MD or GCB 2', module: 'Extension Info', required: 'Conditional', section: 'Basic Information', fieldType: 'text' },
  { name: 'team_head', displayName: 'Team Head', businessDescription: 'Team head, GCB 3', module: 'Extension Info', required: 'Conditional', section: 'Basic Information', fieldType: 'text' },
  { name: 'message_owner', displayName: 'Message Owner', businessDescription: 'Message owner, GCB 5 or above', module: 'Extension Info', required: 'Required', section: 'Basic Information', fieldType: 'text' },
  { name: 'business_line_1st_level', displayName: 'Business Line 1st Level', businessDescription: 'Business line first level, the department of the department head', module: 'Extension Info', required: 'Conditional', section: 'Basic Information', fieldType: 'text' },
  { name: 'business_line_2nd_level', displayName: 'Business Line 2nd Level', businessDescription: 'Business line second level, the department of the team head', module: 'Extension Info', required: 'Conditional', section: 'Basic Information', fieldType: 'text' },
  { name: 'delivery_schedule', displayName: 'Is 7×24', businessDescription: 'Whether delivery schedule supports 7×24', module: 'Extension Info', required: 'Required', section: 'Message Classification', fieldType: 'select', options: [{ label: 'Yes (7×24)', value: 'Yes' }, { label: 'No', value: 'No' }] },
  { name: 'delivery_schedule_other', displayName: 'Other Schedule', businessDescription: "If the delivery schedule doesn't need to support 7×24, what's the expected delivery frequency", module: 'Extension Info', required: 'Required', section: 'Message Classification', fieldType: 'text', dependsOn: 'delivery_schedule=No' },
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
  { name: 'cost_owner', displayName: 'Cost Owner', businessDescription: 'Cost owner', module: 'Extension Info', required: 'Conditional', section: '', fieldType: 'text' },

  // Delivery Channel
  { name: 'channel', displayName: 'Delivery Channel', businessDescription: 'Selected delivery channel', module: 'Delivery Channel', required: 'Required', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'SMS', value: 'SMS' }, { label: 'EMAIL', value: 'EMAIL' }, { label: 'PUSH', value: 'PUSH' }, { label: 'LETTER', value: 'LETTER' }] },
  { name: 'priority', displayName: 'Priority', businessDescription: 'Channel priority / mandatory routing', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'High', value: 'High' }, { label: 'Medium', value: 'Medium' }, { label: 'Low', value: 'Low' }] },
  { name: 'app_name', displayName: 'App Name', businessDescription: 'The App name for Push Notification', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'text', dependsOn: 'PUSH' },
  { name: 'send_to_china_flag', displayName: 'Send to China', businessDescription: 'Requires to send to China Mobile Number or NOT', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }], dependsOn: 'SMS' },
  { name: 'traffic_percentage', displayName: 'Traffic Percentage', businessDescription: 'Traffic split percentage', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'number', dependsOn: 'SMS,EMAIL,PUSH' },
  { name: 'sender', displayName: 'Sender', businessDescription: 'Sender ID/address/name depending on channel', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'text', dependsOn: 'SMS,EMAIL' },
  { name: 'sender_name', displayName: 'Sender Name', businessDescription: 'Email sender name', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'text', dependsOn: 'EMAIL' },
  { name: 'cost_center_id', displayName: 'Cost Center Id', businessDescription: 'SMS cost center id', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'text', dependsOn: 'SMS' },
  { name: 'encrypt_type', displayName: 'Encrypt Type', businessDescription: 'Email encryption type: TLS is for public or internal, Encrypt is for restricted or highly restricted', module: 'Delivery Channel', required: 'Conditional', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'TLS', value: 'TLS' }, { label: 'Encrypt', value: 'Encrypt' }], dependsOn: 'EMAIL PFP' },

  // Opt-In Flag (computed/read-only)
  { name: 'push_optin_flag', displayName: 'Master Opt-in', businessDescription: 'Opt-in master flag', module: 'Opt-In Flag', required: 'Optional', section: 'Technical Requirement', fieldType: 'boolean', dependsOn: 'PUSH' },
  { name: 'marketing_optin_flag', displayName: 'Marketing Opt-in', businessDescription: 'Push marketing opt-in flag', module: 'Opt-In Flag', required: 'Optional', section: 'Technical Requirement', fieldType: 'boolean', dependsOn: 'PUSH appName' },
  { name: 'high_risk_push_optin_flag', displayName: 'High Risk Opt-in', businessDescription: 'Push high risk opt-in flag', module: 'Opt-In Flag', required: 'Optional', section: 'Technical Requirement', fieldType: 'boolean', dependsOn: 'PUSH DAASC' },

  // Bounce Back
  { name: 'bounce_back', displayName: 'Callback', businessDescription: 'Bounce back callback flag, mobile will call MDC API to let MDC know when it received the PN', module: 'Bounce Back', required: 'Conditional', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }], dependsOn: 'PUSH' },
  { name: 'letter_bounce_back_success_flag', displayName: 'Letter Bounce Back', businessDescription: 'Letter bounce back success flag, it is for the INHK eStatement/eAdvice case', module: 'Bounce Back', required: 'Optional', section: 'Technical Requirement', fieldType: 'select', options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }], dependsOn: 'LETTER' },
  { name: 'push_bounce_back_period', displayName: 'Push Bounce Back Period', businessDescription: 'Push bounce back period in minutes', module: 'Bounce Back', required: 'Optional', section: 'Technical Requirement', fieldType: 'number', dependsOn: 'bounce_back' },
  { name: 'sms_bounce_back_period', displayName: 'SMS Bounce Back Period', businessDescription: 'SMS bounce back period in minutes', module: 'Bounce Back', required: 'Optional', section: 'Technical Requirement', fieldType: 'number', dependsOn: 'SMS' },
  { name: 'email_bounce_back_period', displayName: 'Email Bounce Back Period', businessDescription: 'Email bounce back period in minutes', module: 'Bounce Back', required: 'Optional', section: 'Technical Requirement', fieldType: 'number', dependsOn: 'EMAIL' },
  { name: 'letter_bounce_back_period', displayName: 'Letter Bounce Back Period', businessDescription: 'Letter bounce back period in minutes', module: 'Bounce Back', required: 'Optional', section: 'Technical Requirement', fieldType: 'number', dependsOn: 'LETTER' },
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

// Get fields that need to be filled before advancing to next module
// Includes Required fields + Conditional fields that are relevant to selected channels
export function getActionableFields(module: ModuleName, channels: string[]): FieldDefinition[] {
  const moduleFields = getFieldsByModule(module);
  
  return moduleFields.filter(f => {
    // Always include Required fields
    if (f.required === 'Required') return true;
    
    // Include Conditional fields if their dependsOn matches selected channels
    if (f.required === 'Conditional' && f.dependsOn) {
      return channels.some(ch => f.dependsOn?.includes(ch));
    }
    
    return false;
  });
}

export function getFieldDependencies(fieldName: string): string[] {
  const field = fieldDefinitions.find(f => f.name === fieldName);
  if (!field?.dependsOn) return [];
  return field.dependsOn.split(',').map(d => d.trim());
}

export function isFieldRelevant(fieldName: string, channels: string[], values: Record<string, string | number | boolean>): boolean {
  const field = fieldDefinitions.find(f => f.name === fieldName);
  if (!field?.dependsOn) return true;

  const deps = field.dependsOn.split(',').map(d => d.trim());

  // Check if any dependency is met
  for (const dep of deps) {
    // Channel dependencies
    if (channels.includes(dep)) return true;

    // Field value dependencies
    if (dep.includes('=')) {
      const [key, val] = dep.split('=');
      if (values[key] === val) return true;
    }

    // Special cases
    if (dep === 'bounce_back' && values['bounce_back'] === 'Yes') return true;
    if (dep === 'PUSH' && channels.includes('PUSH')) return true;
    if (dep === 'EMAIL' && channels.includes('EMAIL')) return true;
    if (dep === 'SMS' && channels.includes('SMS')) return true;
    if (dep === 'LETTER' && channels.includes('LETTER')) return true;
    if (dep === 'PUSH appName' && channels.includes('PUSH') && values['app_name']) return true;
    if (dep === 'PUSH DAASC' && channels.includes('PUSH')) return true;
    if (dep === 'EMAIL PFP' && channels.includes('EMAIL')) return true;
    
    // Special case: 'create mode editable' means field is always visible in create mode
    if (dep === 'create mode editable') return true;
  }

  return false;
}

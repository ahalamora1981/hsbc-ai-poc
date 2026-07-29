import { CampaignState } from '@/types';

// ---------------------------------------------------------------------------
// Value Constraint Rules (BRD §7.4, VC-01..06)
// ---------------------------------------------------------------------------

type Validator = (value: string) => string | null;

function isPositiveInteger(value: string): boolean {
  return /^\d+$/.test(value.trim()) && Number(value) > 0;
}

// Per-field value validators. Empty values are treated as "no error" here
// (required-ness is handled separately by the module completeness logic).
export const VALUE_CONSTRAINTS: Record<string, Validator> = {
  // VC-01: traffic_percentage 0–100
  traffic_percentage: (v) => {
    const n = Number(v);
    if (v.trim() === '' || Number.isNaN(n)) return 'Must be a number between 0 and 100';
    if (n < 0 || n > 100) return 'Must be between 0 and 100';
    return null;
  },
  // VC-02..05: bounce-back periods must be positive integers (minutes)
  push_bounce_back_period: (v) => (isPositiveInteger(v) ? null : 'Must be a positive whole number of minutes'),
  sms_bounce_back_period: (v) => (isPositiveInteger(v) ? null : 'Must be a positive whole number of minutes'),
  email_bounce_back_period: (v) => (isPositiveInteger(v) ? null : 'Must be a positive whole number of minutes'),
  letter_bounce_back_period: (v) => (isPositiveInteger(v) ? null : 'Must be a positive whole number of minutes'),
  // VC-06: cost_center_id must be a numeric string
  cost_center_id: (v) => (/^\d+$/.test(v.trim()) ? null : 'Must be a numeric string (e.g. 25267613)'),
};

// Validate a single field value against its constraint. Returns an error
// message or null. Blank values are considered valid (not yet filled).
export function validateValue(fieldName: string, value: string | undefined): string | null {
  if (value === undefined || value === '') return null;
  const validator = VALUE_CONSTRAINTS[fieldName];
  return validator ? validator(value) : null;
}

// ---------------------------------------------------------------------------
// Business Rules (BRD §7.3, BR-01..09)
// ---------------------------------------------------------------------------

export type RuleSeverity = 'error' | 'warning' | 'info';

export interface RuleFinding {
  id: string;
  severity: RuleSeverity;
  field: string;
  message: string;
}

function val(values: CampaignState['values'], key: string): string {
  const v = values[key];
  return v === undefined || v === null ? '' : String(v);
}

// Evaluate cross-field business rules against current form state.
// Returns findings (errors must be resolved; warnings/info are recommendations).
export function evaluateBusinessRules(
  values: CampaignState['values'],
  channels: string[]
): RuleFinding[] {
  const findings: RuleFinding[] = [];
  const highRisk = val(values, 'high_risk_flag') === 'Yes';
  const serviceLine = val(values, 'service_line');
  const bounceBack = val(values, 'bounce_back') === 'Yes';
  const unknownBounce = val(values, 'unknown_bounce_back_status') === 'Yes';

  // BR-01: High-risk messages must use dual vendor.
  if (highRisk && val(values, 'support_dual_vendor') !== 'Yes') {
    findings.push({
      id: 'BR-01',
      severity: 'error',
      field: 'support_dual_vendor',
      message: 'High-risk messages must support dual vendor — set Support Dual Vendor to "Yes".',
    });
  }

  // BR-02/03/04: Traffic-split guidance based on message nature.
  if (channels.some((c) => ['SMS', 'EMAIL', 'PUSH'].includes(c))) {
    if (highRisk) {
      findings.push({
        id: 'BR-02',
        severity: 'info',
        field: 'traffic_percentage',
        message: 'High-risk real-time messages should use HTCL-100%, CSL-0% for resilience.',
      });
    } else if (/otp|one[\s-]?time|verification|驗證|一次性/i.test(val(values, 'use_case_name') + ' ' + val(values, 'message_trigger_conditions'))) {
      findings.push({
        id: 'BR-03',
        severity: 'info',
        field: 'traffic_percentage',
        message: 'One-time-password messages should use HTCL-70%, CSL-30% for resilience.',
      });
    } else {
      findings.push({
        id: 'BR-04',
        severity: 'info',
        field: 'traffic_percentage',
        message: 'Standard real-time or batch messages should use HTCL-100%.',
      });
    }
  }

  // BR-05: Bounce-back enabled → configure the next channel.
  if ((bounceBack || unknownBounce) && val(values, 'bounce_back_next_channel') === '') {
    findings.push({
      id: 'BR-05',
      severity: 'warning',
      field: 'bounce_back_next_channel',
      message: 'Bounce-back is enabled — configure Bounce Back Next Channel.',
    });
  }

  // BR-07: Servicing messages should record regulatory requirement.
  if (serviceLine === 'Servicing' && val(values, 'regulatory_requirement') === '') {
    findings.push({
      id: 'BR-07',
      severity: 'warning',
      field: 'regulatory_requirement',
      message: 'Service line is "Servicing" — filling Regulatory Requirement is recommended.',
    });
  }

  // BR-08: PUSH channel selected → the master opt-in flag must be addressed.
  if (channels.includes('PUSH') && val(values, 'push_optin_flag') === '') {
    findings.push({
      id: 'BR-08',
      severity: 'warning',
      field: 'push_optin_flag',
      message: 'PUSH channel is selected — address the master Push Opt-in Flag.',
    });
  }

  return findings;
}

// Collect all value-constraint errors across the current values.
export function collectValueErrors(values: CampaignState['values']): RuleFinding[] {
  const findings: RuleFinding[] = [];
  for (const [field, raw] of Object.entries(values)) {
    const err = validateValue(field, raw === undefined ? undefined : String(raw));
    if (err) {
      findings.push({ id: 'VC', severity: 'error', field, message: err });
    }
  }
  return findings;
}

import { referenceUseCases } from '@/data/reference/use-cases';
import { ReferenceUseCaseFull, ReferenceUseCase } from '@/types';

export { referenceUseCases };

// Unique ordered list of channels a use case delivers on (from its channel rules).
export function getUseCaseChannels(uc: ReferenceUseCaseFull): string[] {
  return [...new Set(uc.channelRules.map(r => r.channel).filter(Boolean))];
}

// Flatten a full use case into a flat field→value map, merging in the
// channel-rule fields (non-empty values; later rules override earlier ones).
export function flattenUseCaseValues(uc: ReferenceUseCaseFull): Record<string, string> {
  const out: Record<string, string> = {};

  for (const [k, v] of Object.entries(uc.values)) {
    if (v !== undefined && v !== '') out[k] = String(v);
  }

  for (const rule of uc.channelRules) {
    for (const [k, v] of Object.entries(rule)) {
      if (k === 'use_case_id' || k === 'channel') continue;
      if (v !== undefined && v !== '') out[k] = String(v);
    }
  }

  return out;
}

// Build the UI display model for a matched use case.
export function toDisplayUseCase(
  uc: ReferenceUseCaseFull,
  similarity: number,
  isBestMatch: boolean
): ReferenceUseCase {
  return {
    id: uc.use_case_id,
    name: String(uc.values.use_case_name ?? uc.use_case_id),
    description: String(uc.values.project_name ?? uc.values.remarks ?? ''),
    channels: getUseCaseChannels(uc),
    similarity,
    values: flattenUseCaseValues(uc),
    isBestMatch,
  };
}

// Compact summaries for the LLM matcher prompt.
export function getUseCaseSummaries() {
  return referenceUseCases.map(uc => ({
    use_case_id: uc.use_case_id,
    name: uc.values.use_case_name,
    project: uc.values.project_name,
    line_of_business: uc.values.line_of_business,
    service_line: uc.values.service_line,
    high_risk_flag: uc.values.high_risk_flag,
    channels: getUseCaseChannels(uc).join('/'),
    trigger: uc.values.message_trigger_conditions,
  }));
}

// Deterministic fallback scoring used when the LLM matcher is unavailable.
// Scores on channel overlap + line-of-business / keyword signals in the text.
export function heuristicScore(requirement: string, uc: ReferenceUseCaseFull): number {
  const req = requirement.toLowerCase();
  let score = 20;

  const channelKeywords: Record<string, string[]> = {
    PUSH: ['push', '推播', '推送'],
    SMS: ['sms', '短訊', '短信'],
    EMAIL: ['email', '電郵', '郵件', 'e-mail'],
    LETTER: ['letter', '信件', '信函'],
  };
  const reqChannels = Object.entries(channelKeywords)
    .filter(([, kws]) => kws.some(kw => req.includes(kw)))
    .map(([ch]) => ch);
  const ucChannels = getUseCaseChannels(uc);
  const channelOverlap = ucChannels.filter(c => reqChannels.includes(c)).length;
  score += channelOverlap * 18;

  const name = String(uc.values.use_case_name ?? '').toLowerCase();
  const words = name.split(/\s+/).filter(w => w.length > 3);
  if (words.some(w => req.includes(w))) score += 20;

  const lob = String(uc.values.line_of_business ?? '').toLowerCase();
  if (lob && req.includes(lob)) score += 10;

  const highRisk = String(uc.values.high_risk_flag ?? '') === 'Yes';
  if (highRisk && /high[\s-]?risk|高風險|fraud|otp|欺詐/.test(req)) score += 12;

  return Math.max(0, Math.min(100, score));
}

// Rank all reference use cases against a requirement using the heuristic.
export function heuristicRank(requirement: string) {
  return referenceUseCases
    .map(uc => ({ use_case_id: uc.use_case_id, score: heuristicScore(requirement, uc) }))
    .sort((a, b) => b.score - a.score);
}

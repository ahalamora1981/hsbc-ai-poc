import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/llm';
import { getUseCaseSummaries } from '@/lib/reference-matching';

interface MatchScore {
  use_case_id: string;
  score: number;
  rationale?: string;
}

// Extract a JSON array from an LLM response that may include prose/code fences.
function parseScores(content: string): MatchScore[] | null {
  if (!content) return null;
  const fenced = content.replace(/```json/gi, '').replace(/```/g, '');
  const start = fenced.indexOf('[');
  const end = fenced.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    const parsed = JSON.parse(fenced.slice(start, end + 1));
    if (!Array.isArray(parsed)) return null;
    return parsed
      .filter((m) => m && typeof m.use_case_id === 'string')
      .map((m) => ({
        use_case_id: m.use_case_id,
        score: Math.max(0, Math.min(100, Number(m.score) || 0)),
        rationale: typeof m.rationale === 'string' ? m.rationale : undefined,
      }));
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { requirement } = (await request.json()) as { requirement?: string };
    if (!requirement || !requirement.trim()) {
      return NextResponse.json({ error: 'Missing requirement' }, { status: 400 });
    }

    const summaries = getUseCaseSummaries();

    const systemPrompt =
      'You match a new campaign requirement against a catalogue of historical reference use cases. ' +
      'Score each reference use case from 0 to 100 for how well it matches the requirement, considering ' +
      'delivery channels, line of business, service line, risk level, and business purpose. ' +
      'Respond with ONLY a JSON array (no prose, no code fences), sorted by score descending, in the form: ' +
      '[{"use_case_id":"UC-001","score":85,"rationale":"short reason"}].';

    const userPrompt =
      `Requirement:\n"${requirement}"\n\nReference use cases:\n${JSON.stringify(summaries, null, 2)}`;

    const response = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.2 }
    );

    let content = '';
    if ('choices' in response) {
      content = response.choices[0]?.message?.content ?? '';
    }

    const matches = parseScores(content);
    if (!matches || matches.length === 0) {
      // Signal the client to fall back to its local heuristic ranking.
      return NextResponse.json({ matches: null, fallback: true });
    }

    matches.sort((a, b) => b.score - a.score);
    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Match API error:', error);
    return NextResponse.json({ matches: null, fallback: true });
  }
}

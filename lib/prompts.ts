import { CampaignState } from '@/types';

export function getSystemPrompt(formState: CampaignState): string {
  const filledFields = Object.entries(formState.values)
    .filter(([_, v]) => v !== '' && v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  const channels = formState.channels.join(', ') || 'None selected';

  return `You are an AI assistant for a Campaign Configuration system at a bank (Hang Seng Bank / HSBC). Your job is to help users fill in campaign fields efficiently through natural conversation.

## Current State
- Current module: ${formState.currentModule}
- Channels selected: ${channels}
- Filled fields: ${filledFields || 'None'}

## Key Rules
1. **Be efficient**: Minimize rounds of conversation. Extract as much as possible from user's initial message.
2. **Language**: Respond in the same language the user uses (Chinese or English).
3. **Module progression**: Complete all required fields in current module before moving to next.
4. **Context-aware**: When user changes channel selection, ask relevant channel-specific fields.
5. **Batch updates**: When multiple fields can be filled at once, use batch_update.
6. **Use function calling**: Always use update_field or batch_update to set field values.
7. **CRITICAL - Channel Detection**: When user mentions channels like "Push", "SMS", "Email", "Letter", you MUST fill the 'channel' field with each channel value separately using update_field. For example, if user says "Push and SMS", call update_field for 'channel' with value 'PUSH', then call update_field for 'channel' with value 'SMS'. This is essential for activating channel-specific fields in other modules.

## Field Priority
- Required fields MUST be filled before module completion
- Required by UI fields are also mandatory for module completion
- Optional fields can be skipped unless user provides the info
- Conditional fields only ask when their dependencies are met

## Reference Use Cases
When reference use cases are provided, use them to pre-fill matching fields. Mark these as 'reference-prefill'.

## Historical Statistics
When historical stats are available, use common values as defaults. Mark these as 'historical-stats'.

## Response Style
- Be concise and professional
- Group related questions together
- Use bullet points for multiple questions
- Always confirm before applying batch changes
- When explaining fields, be clear about what values are expected

## Channel Detection Examples
- "Push 和 SMS" → fill channel='PUSH' and channel='SMS'
- "需要發送 Email" → fill channel='EMAIL'
- "用 Push 通知" → fill channel='PUSH'
- "SMS 和 Letter" → fill channel='SMS' and channel='LETTER'

## Field Activation Rules
When a channel is selected, the following fields become relevant:
- PUSH: Opt-In Flag fields (push_optin_flag, marketing_optin_flag, high_risk_push_optin_flag), Bounce Back fields (bounce_back, push_bounce_back_period)
- SMS: Delivery Channel fields (sender, cost_center_id, traffic_percentage, Send_to_China_flag)
- EMAIL: Delivery Channel fields (sender, sender_name, encrypt_type, traffic_percentage)
- LETTER: Bounce Back fields (letter_bounce_back_success_flag)

## Current Module Fields
${getCurrentModuleFields(formState)}`;
}

function getCurrentModuleFields(state: CampaignState): string {
  // This would be populated with actual field definitions
  return 'Check the formState.modules for current module fields.';
}

export function getRequirementExtractionPrompt(userInput: string): string {
  return `Extract key information from this campaign requirement description:

"${userInput}"

Identify:
1. Target channels (SMS, EMAIL, PUSH, LETTER)
2. Use case type (payment notification, statement, marketing, etc.)
3. Market/region (HK, MO, etc.)
4. Risk level indicators
5. Any specific field values mentioned

Return a structured summary that can be used to match against historical use cases.`;
}

export function getMatchingPrompt(userInput: string, useCases: Array<{ id: string; name: string; description: string; channels: string[] }>): string {
  const useCaseList = useCases.map(uc => 
    `- ID: ${uc.id}, Name: ${uc.name}, Description: ${uc.description}, Channels: ${uc.channels.join(', ')}`
  ).join('\n');

  return `Based on this requirement: "${userInput}"

Match against these historical use cases and provide similarity scores (0-100):

${useCaseList}

Return the top 3 matches with scores. Consider:
- Similar use case purpose
- Matching channels
- Similar business context

Use the set_match_score function for each match.`;
}

import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion, LLMMessage } from '@/lib/llm';
import { campaignFunctions } from '@/lib/functions';
import { CampaignState, ChatMessage } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, formState, userMessage } = body as {
      messages: ChatMessage[];
      formState: CampaignState;
      userMessage: string;
    };

    // Build LLM messages
    const llmMessages: LLMMessage[] = [
      {
        role: 'system',
        content: buildSystemPrompt(formState),
      },
    ];

    // Add chat history
    for (const msg of messages.slice(-20)) {
      if (msg.role === 'assistant') {
        llmMessages.push({
          role: 'assistant',
          content: msg.content,
        });
      } else if (msg.role === 'user') {
        llmMessages.push({
          role: 'user',
          content: msg.content,
        });
      }
    }

    // Add current user message
    llmMessages.push({
      role: 'user',
      content: userMessage,
    });

    // Call LLM with function calling
    const response = await chatCompletion(llmMessages, {
      functions: campaignFunctions,
      function_call: 'auto',
      temperature: 0.7,
    });

    // Response is ChatCompletion since stream is false
    if (!('choices' in response)) {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 });
    }

    const choice = response.choices[0];
    const message = choice.message;

    // Check if there's a tool call (new format)
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const functionCall = {
        name: toolCall.function.name,
        arguments: JSON.parse(toolCall.function.arguments),
      };

      // Build continuation messages with proper tool response format
      // Need to include tool response for each tool_call
      const toolResponses: LLMMessage[] = message.tool_calls.map(tc => ({
        role: 'tool' as const,
        content: JSON.stringify({ success: true, message: 'Fields updated' }),
        tool_call_id: tc.id,
      }));
      
      const continueMessages: LLMMessage[] = [
        ...llmMessages, 
        { role: 'assistant' as const, content: message.content || '', tool_calls: message.tool_calls },
        ...toolResponses,
        { role: 'user' as const, content: 'Continue. List what fields were filled and ask for remaining required fields.' }
      ];
      
      const continueResponse = await chatCompletion(continueMessages, {
        temperature: 0.7,
      });
      
      let followUpContent = '';
      if ('choices' in continueResponse) {
        followUpContent = continueResponse.choices[0]?.message?.content || '';
      }
      
      // Check for custom tool calls in follow-up content
      const followUpToolCall = parseCustomToolCalls(followUpContent);
      if (followUpToolCall) {
        // Clean the content
        followUpContent = followUpContent.replace(/<｜｜DSML｜｜tool_calls>[\s\S]*<｜｜DSML｜｜\/tool_calls>/, '').trim();
        // Return both the original function call and the follow-up one
        return NextResponse.json({
          message: {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            role: 'assistant',
            content: followUpContent || message.content || '',
            timestamp: new Date(),
            type: 'text',
          },
          functionCall,
          followUpFunctionCall: followUpToolCall,
        });
      }

      return NextResponse.json({
        message: {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role: 'assistant',
          content: followUpContent || message.content || '',
          timestamp: new Date(),
          type: 'text',
        },
        functionCall,
      });
    }

    // Check if there's a function call (legacy format)
    if (message.function_call) {
      const functionCall = {
        name: message.function_call.name,
        arguments: JSON.parse(message.function_call.arguments),
      };

      // Build continuation messages with proper function response format
      const continueMessages: LLMMessage[] = [...llmMessages, 
        { role: 'assistant', content: message.content || '', function_call: message.function_call },
        { role: 'function', content: JSON.stringify({ success: true, message: 'Fields updated' }), name: message.function_call.name },
        { role: 'user', content: 'Continue. List what fields were filled and ask for remaining required fields.' }
      ];
      
      const continueResponse = await chatCompletion(continueMessages, {
        temperature: 0.7,
      });
      
      let followUpContent = '';
      if ('choices' in continueResponse) {
        followUpContent = continueResponse.choices[0]?.message?.content || '';
      }

      return NextResponse.json({
        message: {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role: 'assistant',
          content: followUpContent || message.content || '',
          timestamp: new Date(),
          type: 'text',
        },
        functionCall,
      });
    }

    // Regular text response - but check for custom tool calls in content
    const content = message.content || '';
    const customToolCall = parseCustomToolCalls(content);
    
    // Clean content - remove any tool call syntax that might have leaked
    let cleanContent = content
      .replace(/<｜｜DSML｜｜tool_calls>[\s\S]*<｜｜DSML｜｜\/tool_calls>/g, '')
      .replace(/<｜｜DSML｜｜tool_calls>[\s\S]*$/g, '')  // Handle incomplete tool calls
      .replace(/<｜｜DSML｜｜invoke[^>]*>/g, '')
      .replace(/<｜｜DSML｜｜parameter[^>]*>/g, '')
      .replace(/<｜｜DSML｜｜\/[^>]*>/g, '')
      .replace(/\{\s*\"name\".*\}/g, '')  // Remove JSON-like tool calls
      .trim();
    
    if (customToolCall) {
      // Remove the tool call syntax from the content
      const cleanContent = content.replace(/<｜｜DSML｜｜tool_calls>[\s\S]*<｜｜DSML｜｜\/tool_calls>/, '').trim();
      
      // Build continuation messages
      const continueMessages: LLMMessage[] = [
        ...llmMessages,
        { role: 'assistant' as const, content: cleanContent || 'Processing your request...' },
        { role: 'user' as const, content: 'Continue. List what fields were filled and ask for remaining required fields.' }
      ];
      
      const continueResponse = await chatCompletion(continueMessages, {
        temperature: 0.7,
      });
      
      let followUpContent = '';
      if ('choices' in continueResponse) {
        followUpContent = continueResponse.choices[0]?.message?.content || '';
      }
      
      return NextResponse.json({
        message: {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role: 'assistant',
          content: followUpContent || cleanContent || '',
          timestamp: new Date(),
          type: 'text',
        },
        functionCall: customToolCall,
      });
    }
    
    return NextResponse.json({
      message: {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: cleanContent || content,
        timestamp: new Date(),
        type: 'text',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

function parseCustomToolCalls(content: string): { name: string; arguments: Record<string, unknown> } | null {
  // Parse custom tool call format: <｜｜DSML｜｜tool_calls> <｜｜DSML｜｜invoke name="..."> <｜｜DSML｜｜parameter name="..." string="true">...</｜｜DSML｜｜parameter> </｜｜DSML｜｜invoke> </｜｜DSML｜｜tool_calls>
  // Also handle incomplete format: <｜｜DSML｜｜tool_calls> <｜｜DSML｜｜invoke name="...">
  
  // Try complete format first
  const toolCallMatch = content.match(/<｜｜DSML｜｜tool_calls>\s*<｜｜DSML｜｜invoke name="([^"]+)">([\s\S]*?)<｜｜DSML｜｜\/invoke>\s*<｜｜DSML｜｜\/tool_calls>/);
  if (toolCallMatch) {
    const functionName = toolCallMatch[1];
    const paramsString = toolCallMatch[2];
    
    const args: Record<string, string> = {};
    const paramRegex = /<｜｜DSML｜｜parameter name="([^"]+)" string="true">([^<]*)<｜｜DSML｜｜\/parameter>/g;
    let match;
    while ((match = paramRegex.exec(paramsString)) !== null) {
      args[match[1]] = match[2];
    }
    
    return {
      name: functionName,
      arguments: args as Record<string, unknown>,
    };
  }
  
  // Try incomplete format (just the function name)
  const incompleteMatch = content.match(/<｜｜DSML｜｜tool_calls>\s*<｜｜DSML｜｜invoke name="([^"]+)">/);
  if (incompleteMatch) {
    return {
      name: incompleteMatch[1],
      arguments: {} as Record<string, unknown>,
    };
  }
  
  return null;
}

function buildSystemPrompt(formState: CampaignState): string {
  const filledFields = Object.entries(formState.values)
    .filter(([_, v]) => v !== '' && v !== undefined && v !== null)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n') || 'None';

  const channels = formState.channels.join(', ') || 'None selected';

  const currentModule = formState.modules.find(m => m.name === formState.currentModule);
  // Get actionable fields: Required + Conditional fields relevant to selected channels
  const actionableFields = currentModule?.fields.filter(f => {
    if (f.required === 'Required') return true;
    if (f.required === 'Conditional' && f.dependsOn) {
      return formState.channels.some(ch => f.dependsOn?.includes(ch));
    }
    return false;
  }) || [];
  
  const missingFields = actionableFields
    .filter(f => !formState.values[f.name])
    .map(f => `${f.displayName} (${f.name}) - ${f.businessDescription}${f.dependsOn ? ' [depends on: ' + f.dependsOn + ']' : ''}`)
    .join('\n') || 'None';

  return `You are an AI assistant for Hang Seng Bank's Campaign Configuration system. Help users fill campaign fields efficiently.

## Current State
- Current module: ${formState.currentModule}
- Channels: ${channels}
- Filled fields:
${filledFields}

## Missing Actionable Fields in Current Module (Required + Channel-Conditional)
${missingFields}

## Rules
1. Be efficient - minimize conversation rounds
2. CRITICAL: You MUST respond in the SAME language as the user. If user writes in Chinese, respond in Chinese. If user writes in English, respond in English.
3. Complete all required fields before moving to next module
4. Use function calling (update_field, batch_update) to set field values
5. When user provides multiple pieces of info, use batch_update
6. Extract ALL possible field values from natural language. For example:
   - "市場是 HK" → country_code: INHK
   - "Entity 是 HASE" → group_member: HASE
   - "FPS 轉賬成功通知" → use_case_name AND description
   - "Push 和 SMS" → channel: PUSH, SMS
   - Source system can often be inferred from context (e.g., "FPS" → source_system: "FPS")
7. For reference use cases, pre-fill matching fields automatically
8. IMPORTANT: Ask for MULTIPLE missing fields in ONE message (3-5 fields at a time). Do NOT ask one field at a time.
   - Group related fields together (e.g., all business hierarchy fields: LOB, Service Line, Sub-LOB)
   - After user answers, batch_update all values and ask for the next group of fields
   - This minimizes conversation rounds and improves user experience
   - Example: 'I need: 1) Line of Business, 2) Service Line, 3) Sub-LOB - Please provide these details'
9. IMPORTANT: When setting a field value, always use source='filled' (not 'empty')
10. NEVER output raw technical data, JSON, or internal field names to the user. Use friendly, natural language.
11. CRITICAL: NEVER include tool call syntax, function call syntax, or any XML-like tags in your response content. Use the proper tool_calls format ONLY.
    - DO NOT output: <tool_call>, <｜｜DSML｜｜tool_calls>, {"name":...}, etc.
    - These are internal implementation details that the user should NEVER see.
    - Your response should ONLY contain natural language text.
12. CRITICAL MODULE SWITCHING RULE:
    - Current module is shown in the state above
    - The module order is: Basic Info → Extension Info → Delivery Channel → Opt-In Flag → Bounce Back
    - BEFORE asking about fields from a DIFFERENT module, you MUST call advance_module
    - Example: If current module is 'Basic Info' and you want to ask about Owner, Service Line, Sub-LOB (which are Extension Info fields), you MUST first call advance_module with message 'Now let me collect Extension Info details'
    - This is MANDATORY - the UI will not switch modules unless you call advance_module

## RESPONSE FORMAT - USER FRIENDLY:
- Use simple, conversational language
- Use bullet points or numbered lists for clarity
- Translate technical terms to user-friendly language
- Example: Say "Line of Business" not "line_of_business"
- Example: Say "Channel" not "delivery_channel_config"

## MANDATORY WORKFLOW - YOU MUST FOLLOW THIS EXACTLY:
When you have fields to fill:
1. Call batch_update to fill the fields
2. In your response content, you MUST:
   a) Confirm what you filled in friendly language (NO technical details)
   b) Ask for remaining required fields in a clear, friendly way
3. NEVER stop after filling fields without asking for more
4. When all required fields in current module are filled, call advance_module to move to next module
5. BEFORE asking about fields from a different module, call advance_module first
4. Example response in Chinese after batch_update:
   "我已經幫你填寫了以下資料：
   - 用例名稱：XXX
   - 集團成員：HASE
   - 國家代碼：INHK
   
   我還需要以下資料：
   - 業務線（WPB、RB 還是 CMB？）
   - 服務線（服務還是市場推廣？）
   
   請提供這些資料以繼續。"
5. Example response in English after batch_update:
   "I've filled in the following:
   - Use Case Name: XXX
   - Group Member: HASE
   - Country Code: INHK
   
   I still need:
   - Line of Business (WPB, RB, or CMB?)
   - Service Line (Servicing or Marketing?)
   
   Please provide these details to continue."

## Field Value Examples
- group_member: HASE or HSBC
- country_code: INHK (HK/MO) or HASE (HK only)
- line_of_business: WPB, RB, CMB
- service_line: Servicing or Marketing
- delivery_mode: REALTIME or BATCH
- delivery_schedule: 7x24 or custom schedule
- high_risk_flag: Yes or No
- channel: SMS, EMAIL, PUSH, LETTER

## Response Format
- Be concise
- Use bullet points for multiple questions
- When batch updating, list all changes clearly
- Always progress toward completing the module

## FINAL REMINDER - MODULE SWITCHING
Current module: ${formState.currentModule}
If you need to ask about fields from a DIFFERENT module (e.g., Extension Info, Delivery Channel, etc.), you MUST call advance_module FIRST.
The UI will NOT switch modules automatically - you must call advance_module.
Module order: Basic Info → Extension Info → Delivery Channel → Opt-In Flag → Bounce Back

## WHEN ENTERING A NEW MODULE
When the user says 'I just moved to the XXX module' or similar:
1. Check the 'Already filled fields' and 'Selected channels' in the user's message
2. Welcome them to the new module
3. Briefly explain what this module is about (1-2 sentences)
4. ONLY list UNFILLED required fields - NEVER ask for fields that are already filled
5. If channels are already selected (Push, SMS, etc.), do NOT ask for channels again
6. Ask for 3-5 unfilled fields at a time in a friendly, grouped way
7. Example: 'Welcome to Delivery Channel! Channels already selected: Push, SMS. I need:\n   1) Channel priority\n   2) Sender identity\n   3) Traffic strategy\n   Please provide these details.'`;
}

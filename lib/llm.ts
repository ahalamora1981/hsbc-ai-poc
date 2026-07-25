import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL,
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const model = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

export type LLMMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export interface LLMOptions {
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  functions?: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>;
  function_call?: 'auto' | 'none' | { name: string };
}

export async function chatCompletion(
  messages: LLMMessage[],
  options: LLMOptions = {}
) {
  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] | undefined = options.functions
    ? options.functions.map(fn => ({
        type: 'function' as const,
        function: {
          name: fn.name,
          description: fn.description,
          parameters: fn.parameters,
        },
      }))
    : undefined;

  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 4096,
    stream: options.stream ?? false,
    tools,
    tool_choice: options.function_call === 'auto' ? 'auto' : 
                 options.function_call === 'none' ? 'none' : 
                 options.function_call ? { type: 'function', function: { name: options.function_call.name } } : undefined,
  });

  return response;
}

export async function* chatCompletionStream(
  messages: LLMMessage[],
  options: Omit<LLMOptions, 'stream'> = {}
) {
  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] | undefined = options.functions
    ? options.functions.map(fn => ({
        type: 'function' as const,
        function: {
          name: fn.name,
          description: fn.description,
          parameters: fn.parameters,
        },
      }))
    : undefined;

  const stream = await client.chat.completions.create({
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 4096,
    stream: true,
    tools,
    tool_choice: options.function_call === 'auto' ? 'auto' : 
                 options.function_call === 'none' ? 'none' : 
                 options.function_call ? { type: 'function', function: { name: options.function_call.name } } : undefined,
  });

  for await (const chunk of stream) {
    yield chunk;
  }
}

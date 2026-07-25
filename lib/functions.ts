export const campaignFunctions = [
  {
    name: 'update_field',
    description: 'Update a single field value in the campaign form',
    parameters: {
      type: 'object',
      properties: {
        field_name: {
          type: 'string',
          description: 'The technical field name (e.g., use_case_name, channel, high_risk_flag)',
        },
        value: {
          type: 'string',
          description: 'The value to set for the field',
        },
        source: {
          type: 'string',
          enum: ['filled', 'empty', 'confirmed', 'modified'],
          description: 'Status: filled (value set), empty (clear value), confirmed (user confirmed), modified (user edited)',
        },
      },
      required: ['field_name', 'value', 'source'],
    },
  },
  {
    name: 'batch_update',
    description: 'Update multiple field values at once. After calling this, you MUST continue asking for remaining required fields in your response.',
    parameters: {
      type: 'object',
      properties: {
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field_name: { type: 'string' },
              value: { type: 'string' },
              source: {
                type: 'string',
                enum: ['filled', 'empty', 'confirmed', 'modified'],
              },
            },
            required: ['field_name', 'value', 'source'],
          },
          description: 'Array of field updates',
        },
      },
      required: ['fields'],
    },
  },
  {
    name: 'set_match_score',
    description: 'Set similarity score for a reference use case',
    parameters: {
      type: 'object',
      properties: {
        use_case_id: {
          type: 'string',
          description: 'The ID of the reference use case',
        },
        score: {
          type: 'number',
          description: 'Similarity score between 0 and 100',
        },
      },
      required: ['use_case_id', 'score'],
    },
  },
  {
    name: 'advance_module',
    description: 'Move to the next module when current module is complete',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Message to show the user about advancing',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'show_help',
    description: 'Display help information for a specific field',
    parameters: {
      type: 'object',
      properties: {
        field_name: {
          type: 'string',
          description: 'The technical field name to show help for',
        },
        explanation: {
          type: 'string',
          description: 'Detailed explanation of what this field is for',
        },
      },
      required: ['field_name', 'explanation'],
    },
  },
];

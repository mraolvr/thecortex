const AGENT_ENDPOINTS = {
  mentor: 'https://n8n.srv758866.hstgr.cloud/webhook/c9e2a340-b812-49c2-ae05-80aeadede4e7',
  summarizer: 'https://n8n.srv758866.hstgr.cloud/webhook/351f6670-e375-4568-ad95-b482e90fdbf1',
  emailEditor: 'https://n8n.srv758866.hstgr.cloud/webhook/dca01fcb-ed84-4a06-9afe-61575d8da1f3',
  agent: 'https://n8n.srv758866.hstgr.cloud/webhook/fe49e55c-b991-47d5-8a2c-3b0f1282e5c9'
};

export const processAgentResponse = async (agentType, message) => {
  try {
    const endpoint = AGENT_ENDPOINTS[agentType];
    if (!endpoint) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    let requestBody;
    switch (agentType) {
      case 'mentor':
        requestBody = {
          message: {
            content: message
          }
        };
        break;

      case 'summarizer':
        requestBody = {
          summary: message
        };
        break;

      case 'emailEditor':
        requestBody = {
          myField: message
        };
        break;

      case 'agent':
        requestBody = {
          answer: message
        };
        break;

      default:
        throw new Error(`Unsupported agent type: ${agentType}`);
    }

    console.log(`Sending request to ${agentType}:`, requestBody);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Raw response from ${agentType}:`, data);
    
    switch (agentType) {
      case 'mentor':
        return data.content;
      case 'summarizer':
        return data.summary;
      case 'emailEditor':
        // Extract just the text content from myField
        return data.myField ? data.myField.replace(/^"|"$/g, '') : '';
      case 'agent':
        return data.answer;
      default:
        return data;
    }
  } catch (error) {
    console.error(`Error processing ${agentType} response:`, error);
    throw error;
  }
}; 
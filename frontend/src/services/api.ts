import { ChatRequest, ChatResponse } from '../types/chat';

const API_BASE = '';

export const sendMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: request.message,
        conversation_id: request.conversationId,
        user_email: request.userEmail,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || 'Sorry, I\'m having trouble connecting to the AI service. Please try again.');
    }
    const data = await response.json();
    return {
      answer: data.answer,
      sources: data.sources?.map((s: any) => ({
        productName: s.product_name,
        productCategory: s.product_category,
        productSubCategory: s.product_sub_category,
        score: s.score,
        productId: s.product_id,
      })),
      conversationId: data.conversation_id,
      queryType: data.query_type,
    };
  } catch (error: any) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Unable to reach the server. Please check that the backend is running.');
    }
    throw new Error(error.message || 'Failed to send message');
  }
};

export const healthCheck = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Health check failed');
  }
};

export const getPolicy = async (policyName: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/api/policy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ policy_name: policyName }),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get policy');
  }
};

export const getServiceHistory = async (email: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/api/service-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_email: email }),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get service history');
  }
};

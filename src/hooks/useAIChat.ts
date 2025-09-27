import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string, userContext?: any) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('Sending message to AI chat:', message);

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: message,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          userContext: userContext
        }
      });

      if (error) {
        console.error('AI Chat error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (!data.success) {
        throw new Error(data.error || 'AI response was not successful');
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Chat Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const planTrip = async (destination: string, startDate: string, endDate: string, budget?: number, travelStyle?: string, travelers?: number, preferences?: string) => {
    setIsLoading(true);

    try {
      console.log('Planning trip:', { destination, startDate, endDate, budget, travelStyle });

      const { data, error } = await supabase.functions.invoke('ai-trip-planner', {
        body: {
          destination,
          startDate,
          endDate,
          budget,
          travelStyle,
          travelers,
          preferences,
          conversationHistory: messages.slice(-5).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }
      });

      if (error) {
        console.error('Trip planning error:', error);
        throw new Error(error.message || 'Failed to plan trip');
      }

      if (!data.success) {
        throw new Error(data.error || 'Trip planning was not successful');
      }

      // Add AI response about the planned trip
      const tripMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I've created a personalized itinerary for your trip to ${destination}! Here's what I've planned for you:

**${data.itinerary.title}**

${data.itinerary.summary}

Your trip has been saved and you can view the full itinerary in the Trips section. The detailed day-by-day plan includes activities, timing, estimated costs, and local recommendations.

Would you like me to help you with booking flights, hotels, or other travel arrangements?`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, tripMessage]);

      toast({
        title: "Trip Planned!",
        description: `Your ${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} day trip to ${destination} is ready.`,
      });

      return data.itinerary;

    } catch (error) {
      console.error('Error planning trip:', error);
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while planning your trip. Please try again with your travel details.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Planning Error",
        description: error instanceof Error ? error.message : "Failed to plan trip",
        variant: "destructive",
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    planTrip,
    clearChat
  };
};
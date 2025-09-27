import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Mic, 
  MicOff, 
  User, 
  Bot,
  Sparkles,
  MapPin,
  Plane,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Loading } from "@/components/ui/loading";
import { useAIChat } from "@/hooks/useAIChat";

interface Message {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatInterfaceProps {
  className?: string;
}

const quickSuggestions = [
  { text: "Plan a weekend trip", icon: Calendar },
  { text: "Budget travel options", icon: Plane },
  { text: "Find nearby attractions", icon: MapPin },
  { text: "Weather update", icon: Sparkles },
];

const ChatInterface = ({ className }: ChatInterfaceProps) => {
  const { messages: aiMessages, isLoading, sendMessage } = useAIChat();
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert AI messages to display format
  const messages = [
    {
      id: "welcome",
      type: "ai" as const,
      content: "Hi! I'm your AI travel assistant. I can help you plan trips, find the best deals, answer travel questions, and much more. How can I help you today?",
      timestamp: new Date(),
    },
    ...aiMessages.map(msg => ({
      id: msg.id,
      type: msg.role === 'user' ? 'user' as const : 'ai' as const,
      content: msg.content,
      timestamp: msg.timestamp,
    }))
  ];

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    console.log('Sending message to AI:', content);
    setInputValue("");
    await sendMessage(content);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Voice recognition logic will be implemented later
  };

  return (
    <Card className={cn("flex flex-col h-full border-0 shadow-none bg-transparent", className)}>
      <CardContent className="flex-1 flex flex-col p-0 space-y-4 min-h-0">
        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-1 min-h-0">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start space-x-3",
                  message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.type === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"
                )}>
                  {message.type === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={cn(
                  "flex-1 max-w-[80%]",
                  message.type === "user" ? "text-right" : "text-left"
                )}>
                  <div className={cn(
                    "inline-block p-3 rounded-2xl text-sm",
                    message.type === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-muted-foreground rounded-bl-md"
                  )}>
                    {message.content}
                  </div>
                  <div className={cn(
                    "text-xs text-muted-foreground mt-1",
                    message.type === "user" ? "text-right" : "text-left"
                  )}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted text-muted-foreground p-3 rounded-2xl rounded-bl-md">
                  <Loading size="sm" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Suggestions */}
        {aiMessages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => {
                const IconComponent = suggestion.icon;
                return (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-2 text-xs"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                  >
                    <IconComponent className="w-3 h-3 mr-1" />
                    {suggestion.text}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex-shrink-0 flex items-end space-x-2 bg-card/50 backdrop-blur rounded-2xl p-2 border">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your travel plans..."
              className="border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              disabled={isLoading}
            />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceToggle}
            className={cn(
              "h-8 w-8",
              isListening ? "text-destructive" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="h-8 w-8 bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
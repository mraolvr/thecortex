import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, HeartHandshake, Target, Send } from 'lucide-react';

interface PutToWorkBoxProps {
  selectedHabit: {
    id: string;
    name: string;
    description: string;
  };
  selectedValue: {
    id: string;
    name: string;
    definition: string;
    prompt: string;
  };
}

interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

const PutToWorkBox: React.FC<PutToWorkBoxProps> = ({ selectedHabit, selectedValue }) => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInput, setUserInput] = useState('');

  const handlePutToWork = async () => {
    try {
      setIsSubmitting(true);
      setActionItems([]); // Clear existing items while waiting for response

      const response = await fetch('https://n8n.srv758866.hstgr.cloud/webhook/c9e2a340-b812-49c2-ae05-80aeadede4e7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `Selected Habit: ${selectedHabit.name}
Description: ${selectedHabit.description}

Selected Value: ${selectedValue.name}
Description: ${selectedValue.definition}

Please give me a short and concise actionable step to utilize these today.`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send data to webhook');
      }

      // Parse the JSON response
      const data = await response.json();
      
      if (!data.content) {
        throw new Error('No content received from webhook');
      }

      // Split the content into lines and process them
      const lines = data.content.split('\n');
      const newActionItems: ActionItem[] = [];
      let currentSection = '';
      let currentSubsection = '';

      lines.forEach((line: string) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // Check if it's a numbered section (e.g., "1. **Identify Immediate Needs**:")
        if (/^\d+\.\s+\*\*/.test(trimmedLine)) {
          currentSection = trimmedLine.replace(/^\d+\.\s+\*\*|\*\*:$/g, '');
          newActionItems.push({
            id: String(newActionItems.length + 1),
            text: currentSection,
            completed: false
          });
        }
        // Check if it's a bullet point (e.g., " - **Reach Out**:")
        else if (trimmedLine.startsWith('-')) {
          const cleanText = trimmedLine
            .replace(/^-\s+\*\*|\*\*:$/g, '') // Remove bullet and bold markers
            .replace(/\*\*/g, '') // Remove any remaining bold markers
            .trim();
          
          if (cleanText) {
            newActionItems.push({
              id: String(newActionItems.length + 1),
              text: cleanText,
              completed: false
            });
          }
        }
        // Check if it's a subsection (e.g., "**Reach Out**:")
        else if (trimmedLine.startsWith('**')) {
          currentSubsection = trimmedLine.replace(/\*\*:$/g, '');
          newActionItems.push({
            id: String(newActionItems.length + 1),
            text: currentSubsection,
            completed: false
          });
        }
        // Regular text line
        else if (!trimmedLine.startsWith('By implementing') && !trimmedLine.startsWith('Which specific')) {
          newActionItems.push({
            id: String(newActionItems.length + 1),
            text: trimmedLine,
            completed: false
          });
        }
      });
      
      setActionItems(newActionItems);
    } catch (error) {
      console.error('Error sending data to webhook:', error);
      alert('Failed to get response from webhook. Please try again.');
      setActionItems([]); // Clear items on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActionItem = (id: string) => {
    setActionItems(items =>
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="bg-gradient-to-br from-violet-900/60 to-fuchsia-900/40 shadow-xl rounded-2xl border border-white/10 p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="w-6 h-6 text-violet-300" />
        <h3 className="text-2xl font-bold text-gray-100 tracking-tight">Put It To Work</h3>
      </div>

      {/* Selected Habit and Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Habit Card */}
        <div className="bg-white/5 border border-violet-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-violet-300" />
            <h4 className="text-lg font-semibold text-gray-100">Selected Habit</h4>
          </div>
          <h5 className="text-violet-300 font-medium mb-1">{selectedHabit.name}</h5>
          <p className="text-gray-300 text-sm">{selectedHabit.description}</p>
        </div>

        {/* Value Card */}
        <div className="bg-white/5 border border-violet-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <HeartHandshake className="w-5 h-5 text-violet-300" />
            <h4 className="text-lg font-semibold text-gray-100">Selected Value</h4>
          </div>
          <h5 className="text-violet-300 font-medium mb-1">{selectedValue.name}</h5>
          <p className="text-gray-300 text-sm">{selectedValue.definition}</p>
        </div>
      </div>

      {/* Thoughts Section */}
      <div className="mb-8">
        <div className="mb-2 text-base font-semibold text-gray-200 flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-violet-300" />
          Your Thoughts
        </div>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Share your thoughts on how you can combine these today..."
          className="w-full h-24 bg-white/10 border border-violet-500/20 rounded-lg p-3 text-base text-gray-100 placeholder-gray-400 focus:outline-none focus:border-violet-400/60 transition-colors shadow-inner"
        />
      </div>

      {/* Put to Work Button */}
      <div className="mb-8">
        <button
          onClick={handlePutToWork}
          disabled={isSubmitting}
          className={`w-full py-3 px-6 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all duration-300
            ${isSubmitting 
              ? 'bg-violet-500/50 cursor-not-allowed' 
              : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 hover:scale-[1.02] shadow-lg shadow-violet-500/20'
            }
          `}
        >
          <Send className="w-5 h-5" />
          {isSubmitting ? 'Waiting for Response...' : 'Generate Action Items'}
        </button>
      </div>

      {/* Action Items Checklist */}
      {actionItems.length > 0 && (
        <div>
          <div className="mb-4 text-base font-semibold text-gray-200 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-violet-300" />
            Action Items
          </div>
          <div className="grid gap-4">
            {actionItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors shadow-sm bg-white/5
                  ${item.completed ? 'border-violet-400/40 bg-violet-900/20' : 'border-white/10 hover:border-violet-400/30'}
                `}
              >
                <button
                  onClick={() => toggleActionItem(item.id)}
                  className={`flex-shrink-0 rounded-full border-2 w-7 h-7 flex items-center justify-center transition-colors
                    ${item.completed ? 'border-violet-400 bg-violet-500/20 text-violet-300' : 'border-gray-400/30 text-gray-400 hover:border-violet-400'}
                  `}
                  aria-label={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <span className={`text-base ${item.completed ? 'text-violet-200 line-through' : 'text-gray-100'}`}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PutToWorkBox; 
import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import GlowingEffect from '../ui/GlowingEffect';
import useSocialPosts from '../../hooks/useSocialPosts';

export default function TwitterPostCreator() {
  const [postContent, setPostContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');
  const [error, setError] = useState(null);
  const { addPost } = useSocialPosts();

  const handleGeneratePost = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Log the exact content being sent
      console.log('Sending prompt:', {
        prompt: postContent,
        length: postContent.length,
        timestamp: new Date().toISOString()
      });
      
      const requestBody = { 
        prompt: postContent,
        timestamp: new Date().toISOString()
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('https://n8n.srv758866.hstgr.cloud/webhook/14baeb2e-b460-4e31-904f-52eddec46745', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        mode: 'cors',
        credentials: 'omit',
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to generate tweet: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      // Handle the response data correctly
      if (data && typeof data === 'object' && 'myField' in data) {
        setGeneratedPost(data.myField);
      } else {
        setGeneratedPost(data.content || JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error generating tweet:', error);
      setError(`Failed to generate tweet: ${error.message}. Please check your internet connection and try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendPost = async () => {
    try {
      setIsSending(true);
      setError(null);
      
      // Log the exact content being sent
      console.log('Sending tweet:', {
        content: generatedPost,
        length: generatedPost.length,
        timestamp: new Date().toISOString()
      });
      
      const requestBody = { 
        content: generatedPost,
        timestamp: new Date().toISOString()
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('https://n8n.srv758866.hstgr.cloud/webhook/556f8327-4e04-49f3-a8be-9e9bafd2e875', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        mode: 'cors',
        credentials: 'omit',
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to send tweet: ${response.status} ${response.statusText}`);
      }

      // Save to Supabase
      await addPost('twitter', generatedPost);

      // Clear the form after successful post
      setPostContent('');
      setGeneratedPost('');
    } catch (error) {
      console.error('Error sending tweet:', error);
      setError(`Failed to send tweet: ${error.message}. Please check your internet connection and try again.`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <GlowingEffect className="bg-neutral-950 p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-4">Create Twitter Post</h2>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">What would you like to tweet about?</label>
          <textarea
            value={postContent}
            onChange={(e) => {
              console.log('Textarea changed:', e.target.value);
              setPostContent(e.target.value);
            }}
            placeholder="Describe what you want to tweet about..."
            className="w-full bg-neutral-950 px-4 py-2 rounded-lg border border-surface-light focus:outline-none focus:border-primary min-h-[100px] resize-none"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={handleGeneratePost}
            disabled={!postContent || isGenerating}
            className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Tweet'
            )}
          </button>
        </div>

        {generatedPost && (
          <div className="mt-6 space-y-4">
            <div className="bg-neutral-250 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Generated Tweet:</h3>
              <p className="whitespace-pre-wrap">{generatedPost}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSendPost}
                disabled={isSending}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Tweet
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </GlowingEffect>
  );
} 
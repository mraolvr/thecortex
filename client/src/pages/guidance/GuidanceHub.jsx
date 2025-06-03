import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { processAgentResponse } from '../../services/agents';
import GlowingEffect from '../../components/ui/GlowingEffect';
import { 
  MessageSquare, Brain, FileText, Mail, Plus, 
  Send, Upload, Mic, StopCircle, Loader2,
  Trash2, Edit2, Copy, Check, X, Search,
  Calendar, Clock, Star, Archive, ArchiveRestore,
  User, Lightbulb, Book, Target, Heart,
  ChevronRight, BookOpen, Users, Briefcase, Home, School,
  Webhook, Sparkles, Settings, Activity, Zap, CheckCircle2,
  AlertCircle, ExternalLink, Code, Database, Server, RefreshCw,
  File, FileUp, FileText as FileTextIcon, FileImage, FileArchive
} from 'lucide-react';
import Card from '../../components/ui/Card';

const AGENT_TYPES = {
  agent: {
    name: 'AI Agent',
    description: 'Your personal AI assistant for general guidance and support',
    icon: MessageSquare,
    color: '#6366f1'
  },
  mentor: {
    name: 'Mentor',
    description: 'Get advice and mentorship from AI-powered experts',
    icon: Brain,
    color: '#10b981'
  },
  summarizer: {
    name: 'Summarizer',
    description: 'Summarize long texts and documents quickly',
    icon: FileText,
    color: '#f59e0b'
  },
  emailEditor: {
    name: 'Email Editor',
    description: 'Craft professional emails with AI assistance',
    icon: Mail,
    color: '#ef4444'
  }
};

const USER_INFO = {
  name: 'Austin Oliver',
  avatar: 'https://avatars.githubusercontent.com/u/1234567' // Replace with actual avatar URL
};

// Sample guidance data
const guidanceCategories = [
  { id: 'all', name: 'All Guidance', icon: Lightbulb, color: '#6366f1' },
  { id: 'personal', name: 'Personal Growth', icon: Heart, color: '#ef4444' },
  { id: 'career', name: 'Career Development', icon: Briefcase, color: '#10b981' },
  { id: 'education', name: 'Learning & Education', icon: School, color: '#f59e0b' },
  { id: 'relationships', name: 'Relationships', icon: Users, color: '#8b5cf6' },
  { id: 'wellness', name: 'Wellness & Health', icon: Brain, color: '#ec4899' },
];

const sampleGuidance = [
  {
    id: '1',
    title: 'Morning Routine Optimization',
    category: 'personal',
    description: 'Learn how to create an effective morning routine that sets you up for success.',
    icon: Calendar,
    tags: ['productivity', 'habits'],
    priority: 'high',
    completed: false,
  },
  {
    id: '2',
    title: 'Career Path Planning',
    category: 'career',
    description: 'Strategic steps to advance your career and achieve your professional goals.',
    icon: Target,
    tags: ['career', 'planning'],
    priority: 'medium',
    completed: false,
  },
  {
    id: '3',
    title: 'Effective Reading Strategies',
    category: 'education',
    description: 'Techniques to improve reading comprehension and retention.',
    icon: BookOpen,
    tags: ['learning', 'skills'],
    priority: 'high',
    completed: false,
  },
  {
    id: '4',
    title: 'Work-Life Balance',
    category: 'wellness',
    description: 'Tips for maintaining a healthy balance between work and personal life.',
    icon: Home,
    tags: ['wellness', 'balance'],
    priority: 'medium',
    completed: false,
  },
];

const AI_APPS = {
  mentor: {
    name: 'Mentor',
    description: 'AI Mentor for guidance and advice',
    icon: Brain,
    color: '#10b981',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    hoverGradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    status: 'active',
    webhook: 'https://n8n.srv758866.hstgr.cloud/webhook/c9e2a340-b812-49c2-ae05-80aeadede4e7'
  },
  emailCurator: {
    name: 'Email Curator',
    description: 'AI Email Assistant',
    icon: Mail,
    color: '#6366f1',
    gradient: 'from-blue-500 via-indigo-500 to-violet-500',
    hoverGradient: 'from-blue-600 via-indigo-600 to-violet-600',
    status: 'active',
    webhook: 'https://n8n.srv758866.hstgr.cloud/webhook/dca01fcb-ed84-4a06-9afe-61575d8da1f3'
  },
  summarizer: {
    name: 'Summarizer',
    description: 'AI Text Summarization',
    icon: FileText,
    color: '#f59e0b',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    hoverGradient: 'from-amber-600 via-orange-600 to-red-600',
    status: 'active',
    webhook: 'https://n8n.srv758866.hstgr.cloud/webhook/351f6670-e375-4568-ad95-b482e90fdbf1'
  },
  bernard: {
    name: 'Bernard',
    description: 'AI Assistant Bernard',
    icon: MessageSquare,
    color: '#ef4444',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    hoverGradient: 'from-rose-600 via-pink-600 to-fuchsia-600',
    status: 'active',
    webhook: 'https://n8n.srv758866.hstgr.cloud/webhook/fe49e55c-b991-47d5-8a2c-3b0f1282e5c9'
  }
};

const sampleWebhooks = [
  {
    id: '1',
    name: 'Mentor Chat',
    endpoint: 'https://n8n.srv758866.hstgr.cloud/webhook/c9e2a340-b812-49c2-ae05-80aeadede4e7',
    app: 'mentor',
    status: 'active',
    lastTriggered: '2024-03-20T15:30:00Z',
    successRate: 99.8,
    method: 'POST',
    payload: {
      content: "{{ typeof $json.message.content === 'string' ? JSON.stringify($json.message.content) : JSON.stringify($json.message.content) }}"
    },
    responseFormat: {
      content: "string"
    }
  },
  {
    id: '2',
    name: 'Email Curator',
    endpoint: 'https://n8n.srv758866.hstgr.cloud/webhook/dca01fcb-ed84-4a06-9afe-61575d8da1f3',
    app: 'emailCurator',
    status: 'active',
    lastTriggered: '2024-03-20T15:25:00Z',
    successRate: 99.9,
    method: 'POST',
    payload: {
      myField: "{{ $json.summary }}"
    },
    responseFormat: {
      myField: "string"
    }
  },
  {
    id: '3',
    name: 'Summarizer',
    endpoint: 'https://n8n.srv758866.hstgr.cloud/webhook/351f6670-e375-4568-ad95-b482e90fdbf1',
    app: 'summarizer',
    status: 'active',
    lastTriggered: '2024-03-20T15:20:00Z',
    successRate: 99.7,
    method: 'POST',
    payload: {
      summary: "{{ $json.summary }}"
    },
    responseFormat: {
      summary: "string"
    }
  },
  {
    id: '4',
    name: 'Bernard',
    endpoint: 'https://n8n.srv758866.hstgr.cloud/webhook/fe49e55c-b991-47d5-8a2c-3b0f1282e5c9',
    app: 'bernard',
    status: 'active',
    lastTriggered: '2024-03-20T15:15:00Z',
    successRate: 99.9,
    method: 'POST',
    payload: {
      answer: "{{ JSON.stringify($('Bernard').item.json.output) }}"
    },
    responseFormat: {
      answer: "string"
    }
  }
];

const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return FileImage;
  if (fileType.includes('pdf')) return FileTextIcon;
  if (fileType.includes('word') || fileType.includes('document')) return FileText;
  if (fileType.includes('zip') || fileType.includes('archive')) return FileArchive;
  return File;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getAppGradient = (agentType) => {
  return AI_APPS[agentType]?.gradient || 'from-neutral-300 via-neutral-600 to-neutral-950';
};

const getAppIcon = (agentType) => {
  return AI_APPS[agentType]?.icon || MessageSquare;
};

const getAppColor = (agentType) => {
  return AI_APPS[agentType]?.color || '#6366f1';
};

export default function GuidanceHub() {
  const [activeTab, setActiveTab] = useState('agent');
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'oldest' | 'name'
  const [showFavorites, setShowFavorites] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [guidanceItems, setGuidanceItems] = useState(sampleGuidance);
  const [showAddModal, setShowAddModal] = useState(false);
  const [webhooks, setWebhooks] = useState(sampleWebhooks);
  const [selectedApp, setSelectedApp] = useState('mentor');
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [logs, setLogs] = useState([]);
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    fetchChats();
    // Initialize messages for each app if not exists
    Object.keys(AI_APPS).forEach(app => {
      if (!messages[app]) {
        setMessages(prev => ({
          ...prev,
          [app]: []
        }));
      }
    });
  }, [activeTab, selectedApp]);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, messages[selectedApp]]);

  const fetchChats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('guidance_chats')
        .select('*')
        .eq('user_id', user?.id)
        .eq('agent_type', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setFeedback({ message: 'Error loading chats', type: 'error' });
    }
  };

  const createNewChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('guidance_chats')
        .insert([{
          user_id: user?.id,
          agent_type: activeTab,
          title: `New ${AGENT_TYPES[activeTab].name} Chat`,
          messages: []
        }])
        .select()
        .single();

      if (error) throw error;
      setChats([data, ...chats]);
      setCurrentChat(data);
    } catch (error) {
      console.error('Error creating chat:', error);
      setFeedback({ message: 'Error creating new chat', type: 'error' });
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentChat) return;

    try {
      setIsLoading(true);
      const newMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };

      // Update local state immediately for better UX
      const updatedMessages = [...currentChat.messages, newMessage];
      setCurrentChat({ ...currentChat, messages: updatedMessages });
      setMessage('');

      // Send to backend
      const { error } = await supabase
        .from('guidance_chats')
        .update({ messages: updatedMessages })
        .eq('id', currentChat.id);

      if (error) throw error;

      // Get agent response
      try {
        const agentResponse = await processAgentResponse(activeTab, message);
        const aiMessage = {
          role: 'assistant',
          content: agentResponse,
          timestamp: new Date().toISOString()
        };

        const finalMessages = [...updatedMessages, aiMessage];
        setCurrentChat({ ...currentChat, messages: finalMessages });

        const { error: updateError } = await supabase
          .from('guidance_chats')
          .update({ messages: finalMessages })
          .eq('id', currentChat.id);

        if (updateError) throw updateError;
      } catch (agentError) {
        console.error('Error getting agent response:', agentError);
        setFeedback({ 
          message: `Error getting response from ${AGENT_TYPES[activeTab].name}`, 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setFeedback({ message: 'Error sending message', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    setUploadingFile(file);
    setUploadProgress(0);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    handleFileSelect(file);

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${currentChat.id}/${Date.now()}.${fileExt}`;

      // Upload with progress tracking
      const { error: uploadError } = await supabase.storage
        .from('guidance-files')
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(percent);
          }
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('guidance-files')
        .getPublicUrl(fileName);

      // Add file message to chat
      const fileMessage = {
        role: 'user',
        content: `Uploaded file: ${file.name}`,
        fileUrl: publicUrl,
        fileType: file.type,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => ({
        ...prev,
        [selectedApp]: [...(prev[selectedApp] || []), fileMessage]
      }));

      // Send file to AI service
      const payload = {
        fileUrl: publicUrl,
        fileName: file.name,
        fileType: file.type
      };

      const response = await fetch(AI_APPS[selectedApp].webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        content: data.content || data.myField || data.summary || data.answer || 'File processed successfully',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => ({
        ...prev,
        [selectedApp]: [...(prev[selectedApp] || []), aiMessage]
      }));

    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = {
        role: 'system',
        content: `Error processing file: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => ({
        ...prev,
        [selectedApp]: [...(prev[selectedApp] || []), errorMessage]
      }));
    } finally {
      setIsLoading(false);
      setUploadingFile(null);
      setUploadProgress(0);
      setFilePreview(null);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement voice recording functionality
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    setFeedback({ message: 'Message copied to clipboard', type: 'success' });
  };

  const deleteChat = async (chatId) => {
    try {
      const { error } = await supabase
        .from('guidance_chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;
      
      setChats(chats.filter(chat => chat.id !== chatId));
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }
      setFeedback({ message: 'Chat deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting chat:', error);
      setFeedback({ message: 'Error deleting chat', type: 'error' });
    }
  };

  const updateChatTitle = async (chatId, newTitle) => {
    try {
      const { error } = await supabase
        .from('guidance_chats')
        .update({ title: newTitle })
        .eq('id', chatId);

      if (error) throw error;
      
      setChats(chats.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      ));
      if (currentChat?.id === chatId) {
        setCurrentChat({ ...currentChat, title: newTitle });
      }
    } catch (error) {
      console.error('Error updating chat title:', error);
      setFeedback({ message: 'Error updating chat title', type: 'error' });
    }
  };

  const toggleFavorite = async (chatId) => {
    try {
      const chat = chats.find(c => c.id === chatId);
      const newFavorite = !chat.favorite;
      
      const { error } = await supabase
        .from('guidance_chats')
        .update({ favorite: newFavorite })
        .eq('id', chatId);

      if (error) throw error;
      
      setChats(chats.map(chat => 
        chat.id === chatId ? { ...chat, favorite: newFavorite } : chat
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setFeedback({ message: 'Error updating favorite status', type: 'error' });
    }
  };

  const toggleArchive = async (chatId) => {
    try {
      const chat = chats.find(c => c.id === chatId);
      const newArchived = !chat.archived;
      
      const { error } = await supabase
        .from('guidance_chats')
        .update({ 
          archived: newArchived,
          archived_at: newArchived ? new Date().toISOString() : null
        })
        .eq('id', chatId);

      if (error) throw error;
      
      setChats(chats.map(chat => 
        chat.id === chatId ? { 
          ...chat, 
          archived: newArchived,
          archived_at: newArchived ? new Date().toISOString() : null
        } : chat
      ));

      if (currentChat?.id === chatId && newArchived) {
        setCurrentChat(null);
      }

      setFeedback({ 
        message: newArchived ? 'Chat archived' : 'Chat restored', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error toggling archive:', error);
      setFeedback({ message: 'Error updating archive status', type: 'error' });
    }
  };

  const filteredAndSortedChats = chats
    .filter(chat => {
      const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFavorite = !showFavorites || chat.favorite;
      const matchesArchive = chat.archived === showArchived;
      return matchesSearch && matchesFavorite && matchesArchive;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'name':
          return a.title.localeCompare(b.title);
        case 'recent':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const handleTabChange = async (newTab) => {
    if (newTab === activeTab) return;
    
    setActiveTab(newTab);
    setCurrentChat(null); // Clear current chat
    await fetchChats(); // Fetch chats for new agent type
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey) {
        // Insert new line at cursor position
        const cursorPosition = e.target.selectionStart;
        const newMessage = inputMessage.slice(0, cursorPosition) + '\n' + inputMessage.slice(cursorPosition);
        setInputMessage(newMessage);
        // Move cursor after the new line
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = cursorPosition + 1;
        }, 0);
      } else {
        e.preventDefault(); // Prevent default Enter behavior
        handleSendMessage();
      }
    }
  };

  const filteredGuidance = guidanceItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleComplete = (id) => {
    setGuidanceItems(items =>
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-neutral';
    }
  };

  const filteredWebhooks = webhooks.filter((webhook) => {
    const matchesApp = selectedApp === 'all' || webhook.app === selectedApp;
    const matchesSearch = webhook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webhook.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesApp && matchesSearch;
  });

  const handleTestWebhook = async (webhook) => {
    setSelectedWebhook(webhook);
    setShowTestModal(true);
  };

  const handleCopyEndpoint = (endpoint) => {
    navigator.clipboard.writeText(endpoint);
    // Show success toast
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'inactive':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-neutral';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const app = AI_APPS[selectedApp];
    const newMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    // Update local state immediately
    setMessages(prev => ({
      ...prev,
      [selectedApp]: [...(prev[selectedApp] || []), newMessage]
    }));
    setInputMessage('');
    setIsLoading(true);

    try {
      let payload;
      switch (selectedApp) {
        case 'mentor':
          payload = {
            content: inputMessage
          };
          break;
        case 'emailCurator':
          payload = {
            myField: inputMessage
          };
          break;
        case 'summarizer':
          payload = {
            summary: inputMessage
          };
          break;
        case 'bernard':
          payload = {
            answer: inputMessage
          };
          break;
      }

      console.log('Sending payload:', payload); // Debug log

      const response = await fetch(app.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Try to parse the response as JSON
      let data;
      const text = await response.text(); // Get response as text first
      console.log('Raw response:', text); // Debug log

      try {
        // Try to clean the response text if it's malformed
        let cleanedText = text;
        if (text.includes('""')) {
          // Replace double quotes with single quotes
          cleanedText = text.replace(/""/g, '"');
        }
        console.log('Cleaned response:', cleanedText); // Debug log
        
        data = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Failed to parse response:', text);
        // If JSON parsing fails, try to extract content directly
        if (text.includes('myField')) {
          const match = text.match(/"myField"\s*:\s*"([^"]*)"/);
          if (match) {
            data = { myField: match[1] };
          } else {
            throw new Error('Invalid JSON response from server');
          }
        } else {
          throw new Error('Invalid JSON response from server');
        }
      }

      // Extract the response content based on the service
      let responseContent;
      switch (selectedApp) {
        case 'mentor':
          responseContent = data.content;
          break;
        case 'emailCurator':
          // Handle the case where myField might be a string with extra quotes
          responseContent = typeof data.myField === 'string' 
            ? data.myField.replace(/^"|"$/g, '') // Remove surrounding quotes if present
            : data.myField;
          break;
        case 'summarizer':
          responseContent = data.summary;
          break;
        case 'bernard':
          responseContent = data.answer;
          break;
        default:
          responseContent = text; // Fallback to raw text if no specific field found
      }

      if (!responseContent) {
        throw new Error('No response content found in the response');
      }
      
      // Add AI response to messages
      const aiMessage = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => ({
        ...prev,
        [selectedApp]: [...(prev[selectedApp] || []), aiMessage]
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message with more details
      const errorMessage = {
        role: 'system',
        content: `Error: ${error.message || 'Failed to get response from AI service'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => ({
        ...prev,
        [selectedApp]: [...(prev[selectedApp] || []), errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <GlowingEffect className="bg-neutral-950 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-surface-light/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
                Communication Center
              </h1>
              <p className="text-neutral/80 mt-2 text-lg">Chat with your assistants</p>
            </div>
          </div>

          <div className="flex space-x-4 border-b border-surface-light/20">
            {Object.entries(AI_APPS).map(([id, app]) => {
              const Icon = app.icon;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedApp(id)}
                  className={`flex items-center gap-2 px-6 py-3 -mb-px transition-all duration-300 rounded-t-lg ${
                    selectedApp === id
                      ? `bg-gradient-to-r ${app.gradient} text-white scale-105 shadow-lg hover:${app.hoverGradient}`
                      : 'text-neutral/70 hover:text-white hover:scale-105 hover:bg-background/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{app.name}</span>
                </button>
              );
            })}
          </div>
        </GlowingEffect>

        {/* Main Content Area */}
        <div className="flex gap-6">
          {/* Chat Area */}
          <div className="flex-1">
            <GlowingEffect className={`bg-gradient-to-br ${getAppGradient(selectedApp)} bg-opacity-10 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-surface-light/20 h-[calc(100vh-300px)]`}>
              <div className="flex flex-col h-full">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                  {messages[selectedApp]?.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-4 animate-fade-in ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-surface-light/20 bg-gradient-to-r ${getAppGradient(selectedApp)}`}
                          style={{ 
                            boxShadow: `0 0 20px ${getAppColor(selectedApp)}40`
                          }}
                        >
                          {React.createElement(getAppIcon(selectedApp), {
                            className: 'w-5 h-5 text-white'
                          })}
                        </div>
                      )}
                      <div className={`max-w-[70%] ${
                        message.role === 'user' 
                          ? 'bg-white/10 hover:bg-white/20 backdrop-blur-sm' 
                          : message.role === 'system'
                            ? 'bg-red-500/10 hover:bg-red-500/20 backdrop-blur-sm'
                            : 'bg-white/5 hover:bg-white/10 backdrop-blur-sm'
                      } rounded-2xl p-4 shadow-lg transition-all duration-200 border border-white/10`}>
                        <p className="whitespace-pre-wrap text-base leading-relaxed text-white">{message.content}</p>
                        <p className="text-xs text-white/60 mt-2">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getAppGradient(selectedApp)} flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-surface-light/20`}>
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex flex-col gap-4">
                  {/* Message Input Area */}
                  <div className="flex gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => document.getElementById('fileInput').click()}
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 hover:bg-primary/80 text-primary hover:text-white flex items-center justify-center transition-colors duration-200 mr-2"
                      tabIndex={-1}
                      aria-label="Attach file"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={`${AI_APPS[selectedApp]?.name || 'AI'} is here to assist`}
                      className="flex-1 bg-white/10 px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all duration-200 resize-none min-h-[40px] max-h-[200px] shadow-sm text-base text-white placeholder-white/50"
                      rows={1}
                      style={{ height: 'auto' }}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className={`bg-gradient-to-r ${getAppGradient(selectedApp)} hover:${AI_APPS[selectedApp]?.hoverGradient || 'from-gray-600 via-gray-700 to-gray-800'} text-white px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none`}
                      style={{
                        boxShadow: `0 0 20px ${getAppColor(selectedApp)}40`
                      }}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </GlowingEffect>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-neutral-950 backdrop-blur-sm rounded-xl shadow-lg border border-surface-light/20 p-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 pl-10 text-white placeholder-white/50 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all duration-200"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-white/50" />
            </div>

            {/* Filters */}
            <div className="flex gap-2 p-2 bg-white/5 rounded-xl">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  showFavorites 
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Star className={`w-4 h-4 ${showFavorites ? 'fill-amber-500' : ''}`} />
              </button>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  showArchived 
                    ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Archive className={`w-4 h-4 ${showArchived ? 'fill-blue-500' : ''}`} />
              </button>
              <button
                onClick={() => setSortBy(sortBy === 'recent' ? 'oldest' : 'recent')}
                className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  sortBy === 'recent' 
                    ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Clock className={`w-4 h-4 ${sortBy === 'recent' ? 'fill-violet-500' : ''}`} />
              </button>
            </div>

            {/* Chat List */}
            <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar">
              {filteredAndSortedChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    currentChat?.id === chat.id
                      ? `bg-gradient-to-r ${getAppGradient(chat.agent_type)} bg-opacity-20`
                      : 'hover:bg-white/5'
                  }`}
                  onClick={() => setCurrentChat(chat)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-surface-light/20 bg-gradient-to-r ${getAppGradient(chat.agent_type)}`}>
                      {React.createElement(getAppIcon(chat.agent_type), {
                        className: 'w-5 h-5 text-white'
                      })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">{chat.title}</h3>
                      <p className="text-xs text-white/60 truncate">
                        {chat.messages[chat.messages.length - 1]?.content || 'No messages yet'}
                      </p>
                    </div>
                    {chat.favorite && (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(chat.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-200"
                    >
                      <Star className={`w-4 h-4 ${chat.favorite ? 'text-amber-500 fill-amber-500' : 'text-white/60'}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleArchive(chat.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-200"
                    >
                      <Archive className={`w-4 h-4 ${chat.archived ? 'text-blue-500 fill-blue-500' : 'text-white/60'}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* New Chat Button */}
            <button
              onClick={createNewChat}
              className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${getAppGradient(activeTab)} text-white font-medium flex items-center justify-center gap-2 hover:scale-105 transition-all duration-200 shadow-lg`}
              style={{
                boxShadow: `0 0 20px ${getAppColor(activeTab)}40`
              }}
            >
              <Plus className="w-5 h-5" />
              New Chat
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .hover\:pulse:hover {
          animation: pulse 1s infinite;
        }
      `}</style>
    </div>
  );
} 
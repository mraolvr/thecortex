import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function useSocialPosts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    platform: null,
    status: null,
    dateRange: null,
    searchQuery: '',
    sortOrder: 'desc',
    engagement: null,
    contentType: null,
    hashtags: [],
    mentions: [],
    performance: null
  });

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let query = supabase
        .from('social_posts')
        .select('*, metadata')
        .eq('user_id', user.id);

      // Apply platform filter
      if (filters.platform) {
        query = query.eq('platform', filters.platform);
      }

      // Apply status filter
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Apply date range filter
      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        if (start) {
          query = query.gte('created_at', start);
        }
        if (end) {
          query = query.lte('created_at', end);
        }
      }

      // Apply search query
      if (filters.searchQuery) {
        query = query.ilike('content', `%${filters.searchQuery}%`);
      }

      // Apply engagement filter
      if (filters.engagement) {
        const { metric, threshold } = filters.engagement;
        query = query.gte(`metadata->${metric}`, threshold);
      }

      // Apply content type filter
      if (filters.contentType) {
        query = query.eq('metadata->type', filters.contentType);
      }

      // Apply hashtags filter
      if (filters.hashtags.length > 0) {
        query = query.contains('metadata->hashtags', filters.hashtags);
      }

      // Apply mentions filter
      if (filters.mentions.length > 0) {
        query = query.contains('metadata->mentions', filters.mentions);
      }

      // Apply performance filter
      if (filters.performance) {
        const { metric, threshold } = filters.performance;
        query = query.gte(`metadata->${metric}`, threshold);
      }

      // Apply sorting
      if (filters.sortOrder === 'engagement') {
        query = query.order('metadata->engagement_rate', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: filters.sortOrder === 'asc' });
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addPost = async (platform, content, metadata = {}) => {
    try {
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('social_posts')
        .insert([
          {
            user_id: user.id,
            platform,
            content,
            status: 'published',
            published_at: new Date().toISOString(),
            metadata: {
              type: 'text',
              hashtags: [],
              mentions: [],
              likes: 0,
              shares: 0,
              comments: 0,
              engagement_rate: 0,
              ...metadata
            }
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setPosts((prevPosts) => [data, ...prevPosts]);
      return data;
    } catch (error) {
      console.error('Error adding post:', error);
      setError(error.message);
      throw error;
    }
  };

  const deletePost = async (postId) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      setError(error.message);
      throw error;
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      platform: null,
      status: null,
      dateRange: null,
      searchQuery: '',
      sortOrder: 'desc',
      engagement: null,
      contentType: null,
      hashtags: [],
      mentions: [],
      performance: null
    });
  };

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  return {
    posts,
    isLoading,
    error,
    filters,
    addPost,
    deletePost,
    updateFilters,
    resetFilters,
    refreshPosts: fetchPosts,
  };
} 
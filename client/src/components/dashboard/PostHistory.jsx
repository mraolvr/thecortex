import { Twitter, Linkedin, Calendar, Clock, Trash2, Search, Filter, X, Users } from 'lucide-react';
import GlowingEffect from '../ui/GlowingEffect';
import useSocialPosts from '../../hooks/useSocialPosts';
import { useState } from 'react';

export default function PostHistory() {
  const { posts, isLoading, error, deletePost, filters, updateFilters, resetFilters } = useSocialPosts();
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleDateRangeChange = (range) => {
    updateFilters({ dateRange: range });
  };

  const handleSearchChange = (e) => {
    updateFilters({ searchQuery: e.target.value });
  };

  const handlePlatformChange = (platform) => {
    updateFilters({ platform: platform === filters.platform ? null : platform });
  };

  const handleStatusChange = (status) => {
    updateFilters({ status: status === filters.status ? null : status });
  };

  const handleSortChange = (order) => {
    updateFilters({ sortOrder: order });
  };

  const handleEngagementChange = (metric, threshold) => {
    updateFilters({ engagement: { metric, threshold } });
  };

  const handleContentTypeChange = (type) => {
    updateFilters({ contentType: type === filters.contentType ? null : type });
  };

  const handleHashtagChange = (hashtag) => {
    const currentHashtags = filters.hashtags || [];
    const newHashtags = currentHashtags.includes(hashtag)
      ? currentHashtags.filter(h => h !== hashtag)
      : [...currentHashtags, hashtag];
    updateFilters({ hashtags: newHashtags });
  };

  const handleMentionChange = (mention) => {
    const currentMentions = filters.mentions || [];
    const newMentions = currentMentions.includes(mention)
      ? currentMentions.filter(m => m !== mention)
      : [...currentMentions, mention];
    updateFilters({ mentions: newMentions });
  };

  const handlePerformanceChange = (metric, threshold) => {
    updateFilters({ performance: { metric, threshold } });
  };

  return (
    <div className="p-8 rounded-2xl shadow-xl bg-gradient-to-br from-white/80 via-blue-50/80 to-pink-100/80 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-pink-900/80 border-l-8 border-blue-400 dark:border-pink-500 backdrop-blur-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2 drop-shadow">
          <Users className="w-7 h-7 text-blue-500" /> Social Activity
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1.5 bg-background-light rounded-lg hover:bg-background-lighter transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          {(filters.platform || filters.status || filters.dateRange || filters.searchQuery) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-3 py-1.5 bg-background-light rounded-lg hover:bg-background-lighter transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 p-4 bg-background-light rounded-lg space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral" />
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search posts..."
                  className="w-full pl-9 pr-3 py-2 bg-background rounded-lg border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 bg-background rounded-lg border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Platform</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePlatformChange('twitter')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    filters.platform === 'twitter'
                      ? 'bg-blue-500 text-white'
                      : 'bg-background hover:bg-background-lighter'
                  }`}
                >
                  Twitter
                </button>
                <button
                  onClick={() => handlePlatformChange('linkedin')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    filters.platform === 'linkedin'
                      ? 'bg-blue-600 text-white'
                      : 'bg-background hover:bg-background-lighter'
                  }`}
                >
                  LinkedIn
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange('published')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    filters.status === 'published'
                      ? 'bg-green-500 text-white'
                      : 'bg-background hover:bg-background-lighter'
                  }`}
                >
                  Published
                </button>
                <button
                  onClick={() => handleStatusChange('draft')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    filters.status === 'draft'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-background hover:bg-background-lighter'
                  }`}
                >
                  Draft
                </button>
                <button
                  onClick={() => handleStatusChange('failed')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    filters.status === 'failed'
                      ? 'bg-red-500 text-white'
                      : 'bg-background hover:bg-background-lighter'
                  }`}
                >
                  Failed
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleDateRangeChange({ start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() })}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filters.dateRange?.start === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                    ? 'bg-primary text-white'
                    : 'bg-background hover:bg-background-lighter'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => handleDateRangeChange({ start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() })}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filters.dateRange?.start === new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                    ? 'bg-primary text-white'
                    : 'bg-background hover:bg-background-lighter'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => handleDateRangeChange(null)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  !filters.dateRange
                    ? 'bg-primary text-white'
                    : 'bg-background hover:bg-background-lighter'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-light">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 text-sm text-neutral hover:text-white transition-colors"
            >
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
            </button>
          </div>

          {showAdvancedFilters && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Engagement</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <select
                      value={filters.engagement?.metric || ''}
                      onChange={(e) => handleEngagementChange(e.target.value, filters.engagement?.threshold || 0)}
                      className="w-full px-3 py-2 bg-background rounded-lg border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Metric</option>
                      <option value="likes">Likes</option>
                      <option value="shares">Shares</option>
                      <option value="comments">Comments</option>
                      <option value="engagement_rate">Engagement Rate</option>
                    </select>
                  </div>
                  {filters.engagement?.metric && (
                    <div className="w-32">
                      <input
                        type="number"
                        value={filters.engagement?.threshold || 0}
                        onChange={(e) => handleEngagementChange(filters.engagement.metric, parseInt(e.target.value))}
                        placeholder="Min value"
                        className="w-full px-3 py-2 bg-background rounded-lg border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleContentTypeChange('text')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      filters.contentType === 'text'
                        ? 'bg-primary text-white'
                        : 'bg-background hover:bg-background-lighter'
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => handleContentTypeChange('image')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      filters.contentType === 'image'
                        ? 'bg-primary text-white'
                        : 'bg-background hover:bg-background-lighter'
                    }`}
                  >
                    Image
                  </button>
                  <button
                    onClick={() => handleContentTypeChange('video')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      filters.contentType === 'video'
                        ? 'bg-primary text-white'
                        : 'bg-background hover:bg-background-lighter'
                    }`}
                  >
                    Video
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Performance</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <select
                      value={filters.performance?.metric || ''}
                      onChange={(e) => handlePerformanceChange(e.target.value, filters.performance?.threshold || 0)}
                      className="w-full px-3 py-2 bg-background rounded-lg border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Metric</option>
                      <option value="engagement_rate">Engagement Rate</option>
                      <option value="reach">Reach</option>
                      <option value="impressions">Impressions</option>
                    </select>
                  </div>
                  {filters.performance?.metric && (
                    <div className="w-32">
                      <input
                        type="number"
                        value={filters.performance?.threshold || 0}
                        onChange={(e) => handlePerformanceChange(filters.performance.metric, parseInt(e.target.value))}
                        placeholder="Min value"
                        className="w-full px-3 py-2 bg-background rounded-lg border border-surface-light focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-4 text-neutral">
          No posts found. {filters.platform || filters.status || filters.dateRange || filters.searchQuery ? 'Try adjusting your filters.' : 'Create your first post above!'}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-background-light p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {post.platform === 'twitter' ? (
                    <Twitter className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Linkedin className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="font-medium">
                    {post.platform === 'twitter' ? 'Twitter' : 'LinkedIn'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-neutral">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.created_at)}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{formatTime(post.created_at)}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap">{post.content}</p>
              {post.metadata && Object.keys(post.metadata).length > 0 && (
                <div className="mt-2 pt-2 border-t border-surface-light">
                  <p className="text-sm text-neutral">
                    Status: {post.status}
                    {post.published_at && ` • Published: ${formatDate(post.published_at)}`}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
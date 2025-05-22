import { useState } from 'react';
import { Twitter, Linkedin, BarChart2, TrendingUp, Users, Share2, MessageCircle, Calendar } from 'lucide-react';
import GlowingEffect from '../components/ui/GlowingEffect';
import useSocialPosts from '../hooks/useSocialPosts';

export default function Analytics() {
  const { posts, isLoading, error, filters, updateFilters } = useSocialPosts();
  const [timeRange, setTimeRange] = useState('7d');

  const calculateMetrics = () => {
    if (!posts.length) return null;

    const metrics = {
      totalPosts: posts.length,
      totalEngagement: 0,
      averageEngagement: 0,
      bestPerformingPost: null,
      platformBreakdown: {
        twitter: 0,
        linkedin: 0
      },
      contentTypeBreakdown: {
        text: 0,
        image: 0,
        video: 0
      },
      engagementByDay: {},
      topHashtags: {},
      topMentions: {}
    };

    posts.forEach(post => {
      // Platform breakdown
      metrics.platformBreakdown[post.platform]++;

      // Content type breakdown
      const contentType = post.metadata?.type || 'text';
      metrics.contentTypeBreakdown[contentType]++;

      // Engagement metrics
      const engagement = (post.metadata?.likes || 0) + 
                        (post.metadata?.shares || 0) + 
                        (post.metadata?.comments || 0);
      metrics.totalEngagement += engagement;

      // Best performing post
      if (!metrics.bestPerformingPost || engagement > metrics.bestPerformingPost.engagement) {
        metrics.bestPerformingPost = {
          ...post,
          engagement
        };
      }

      // Engagement by day
      const date = new Date(post.created_at).toLocaleDateString();
      metrics.engagementByDay[date] = (metrics.engagementByDay[date] || 0) + engagement;

      // Hashtags
      post.metadata?.hashtags?.forEach(tag => {
        metrics.topHashtags[tag] = (metrics.topHashtags[tag] || 0) + 1;
      });

      // Mentions
      post.metadata?.mentions?.forEach(mention => {
        metrics.topMentions[mention] = (metrics.topMentions[mention] || 0) + 1;
      });
    });

    metrics.averageEngagement = metrics.totalEngagement / metrics.totalPosts;

    return metrics;
  };

  const metrics = calculateMetrics();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Social Media Analytics</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading analytics...</div>
      ) : !metrics ? (
        <div className="text-center py-8 text-neutral">
          No data available. Start creating posts to see analytics.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Time Range Selector */}
          <div className="flex justify-end">
            <div className="flex gap-2 bg-background-light p-1 rounded-lg">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeRange === '7d' ? 'bg-primary text-white' : 'hover:bg-background-lighter'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeRange === '30d' ? 'bg-primary text-white' : 'hover:bg-background-lighter'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setTimeRange('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeRange === 'all' ? 'bg-primary text-white' : 'hover:bg-background-lighter'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlowingEffect className="bg-surface p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Total Posts</h3>
              </div>
              <p className="text-2xl font-bold">{metrics.totalPosts}</p>
            </GlowingEffect>

            <GlowingEffect className="bg-surface p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Total Engagement</h3>
              </div>
              <p className="text-2xl font-bold">{metrics.totalEngagement}</p>
            </GlowingEffect>

            <GlowingEffect className="bg-surface p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Avg. Engagement</h3>
              </div>
              <p className="text-2xl font-bold">{metrics.averageEngagement.toFixed(1)}</p>
            </GlowingEffect>

            <GlowingEffect className="bg-surface p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Share2 className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Best Post</h3>
              </div>
              <p className="text-lg font-medium truncate">
                {metrics.bestPerformingPost.content.substring(0, 30)}...
              </p>
              <p className="text-sm text-neutral">
                {metrics.bestPerformingPost.engagement} engagements
              </p>
            </GlowingEffect>
          </div>

          {/* Platform Breakdown */}
          <GlowingEffect className="bg-surface p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Platform Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-background-light rounded-lg">
                <Twitter className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="font-medium">Twitter</p>
                  <p className="text-2xl font-bold">{metrics.platformBreakdown.twitter}</p>
                  <p className="text-sm text-neutral">
                    {((metrics.platformBreakdown.twitter / metrics.totalPosts) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-background-light rounded-lg">
                <Linkedin className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium">LinkedIn</p>
                  <p className="text-2xl font-bold">{metrics.platformBreakdown.linkedin}</p>
                  <p className="text-sm text-neutral">
                    {((metrics.platformBreakdown.linkedin / metrics.totalPosts) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            </div>
          </GlowingEffect>

          {/* Content Type Breakdown */}
          <GlowingEffect className="bg-surface p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Content Type Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(metrics.contentTypeBreakdown).map(([type, count]) => (
                <div key={type} className="p-4 bg-background-light rounded-lg">
                  <p className="font-medium capitalize">{type}</p>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-neutral">
                    {((count / metrics.totalPosts) * 100).toFixed(1)}% of total
                  </p>
                </div>
              ))}
            </div>
          </GlowingEffect>

          {/* Top Hashtags and Mentions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlowingEffect className="bg-surface p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Top Hashtags</h2>
              <div className="space-y-2">
                {Object.entries(metrics.topHashtags)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([tag, count]) => (
                    <div key={tag} className="flex justify-between items-center p-2 bg-background-light rounded-lg">
                      <span className="font-medium">#{tag}</span>
                      <span className="text-neutral">{count} uses</span>
                    </div>
                  ))}
              </div>
            </GlowingEffect>

            <GlowingEffect className="bg-surface p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Top Mentions</h2>
              <div className="space-y-2">
                {Object.entries(metrics.topMentions)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([mention, count]) => (
                    <div key={mention} className="flex justify-between items-center p-2 bg-background-light rounded-lg">
                      <span className="font-medium">@{mention}</span>
                      <span className="text-neutral">{count} mentions</span>
                    </div>
                  ))}
              </div>
            </GlowingEffect>
          </div>

          {/* Engagement Over Time */}
          <GlowingEffect className="bg-surface p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Engagement Over Time</h2>
            <div className="h-64 bg-background-light rounded-lg p-4">
              {/* TODO: Add a proper chart library like Chart.js or Recharts */}
              <div className="h-full flex items-end gap-2">
                {Object.entries(metrics.engagementByDay)
                  .sort(([a], [b]) => new Date(a) - new Date(b))
                  .map(([date, engagement]) => (
                    <div
                      key={date}
                      className="flex-1 bg-primary/20 hover:bg-primary/30 transition-colors rounded-t"
                      style={{
                        height: `${(engagement / Math.max(...Object.values(metrics.engagementByDay))) * 100}%`
                      }}
                      title={`${date}: ${engagement} engagements`}
                    />
                  ))}
              </div>
            </div>
          </GlowingEffect>
        </div>
      )}
    </div>
  );
} 
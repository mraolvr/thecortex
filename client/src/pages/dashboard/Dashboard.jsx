import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import GoalsList from '../../components/dashboard/GoalsList';
import TasksList from '../../components/dashboard/TasksList';
import CurrentReading from '../../components/dashboard/CurrentReading';
import LinkedInPostCreator from '../../components/dashboard/LinkedInPostCreator';
import TwitterPostCreator from '../../components/dashboard/TwitterPostCreator';
import PostHistory from '../../components/dashboard/PostHistory';
import { Calendar } from 'lucide-react';
import TodayAgenda from '../../components/dashboard/TodayAgenda';
import NotificationCard from '../../components/dashboard/NotificationCard';
import useTaskStore from '../../stores/taskStore';
import useGoalsStore from '../../stores/goalsStore';
import useBookStore from '../../stores/bookStore';
import useReadingStore from '../../stores/readingStore';
import { useEffect } from 'react';
import GradientCard from '../../components/dashboard/GradientCard';

// Sample data
const sampleGoals = [
  { id: '1', title: 'Complete Project Milestone', progress: 75 },
  { id: '2', title: 'Learn New Technology', progress: 45 },
  { id: '3', title: 'Exercise Routine', progress: 60 },
];

const sampleBook = {
  title: 'The Pragmatic Programmer',
  author: 'David Thomas, Andrew Hunt',
  coverUrl: 'https://images-na.ssl-images-amazon.com/images/P/020161622X.01.L.jpg',
  currentPage: 145,
  totalPages: 352,
};

const sampleQuote = {
  text: "The only way to do great work is to love what you do.",
  author: "Steve Jobs"
};

export default function Dashboard() {
  const { allTasks, fetchSupabaseTasks, updateTask } = useTaskStore();
  const { goals, fetchGoals } = useGoalsStore();
  const { books } = useBookStore();
  const { readingStats } = useReadingStore();

  useEffect(() => {
    fetchSupabaseTasks();
    fetchGoals();
  }, [fetchSupabaseTasks, fetchGoals]);

  // Quick Stats
  const completedTasks = allTasks.filter(t => t.status === 'done').length;
  const totalTasks = allTasks.length;
  const activeGoals = goals.filter(g => g.status !== 'completed');
  const avgGoalProgress = activeGoals.length > 0 ? Math.round(activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length) : 0;
  const booksRead = books.filter(b => b.status === 'completed').length;
  const pagesRead = readingStats?.totalPagesRead || books.reduce((sum, b) => sum + (b.current_page || 0), 0);

  // Latest Updates (last 3 events)
  const recentTaskEvents = allTasks
    .filter(t => t.status === 'done' && t.updated_at)
    .map(t => ({
      type: 'task',
      title: t.title,
      time: t.updated_at,
      message: 'Task completed'
    }));
  const recentGoalEvents = goals
    .filter(g => g.created_at)
    .map(g => ({
      type: 'goal',
      title: g.title,
      time: g.created_at,
      message: 'Goal added'
    }));
  const recentReadingEvents = books
    .filter(b => b.updated_at)
    .map(b => ({
      type: 'reading',
      title: b.title,
      time: b.updated_at,
      message: 'Reading progress updated'
    }));
  const allUpdates = [...recentTaskEvents, ...recentGoalEvents, ...recentReadingEvents]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-neutral-950  p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Goals, Tasks, Reading */}
          <div className="col-span-3 space-y-6">
            <GradientCard>
              <div className="bg-neutral-900/90 rounded-xl p-4 shadow-inner overflow-hidden relative">
                <GoalsList />
              </div>
            </GradientCard>
            <GradientCard>
              <div className="bg-neutral-900/90 rounded-xl p-4 shadow-inner overflow-hidden relative">
                <TasksList tasks={allTasks} updateTask={updateTask} />
              </div>
            </GradientCard>
            <GradientCard>
              <div className="">
                <CurrentReading />
              </div>
            </GradientCard>
          </div>

          {/* Middle Column - Welcome, Social, Updates */}
          <div className="col-span-6 space-y-6">
            <GradientCard>
              <div className="bg-neutral-900/90 rounded-xl p-4 shadow-inner overflow-hidden relative">
                <WelcomeBanner />
              </div>
            </GradientCard>
            
            {/* Social Media Section */}
            <div className="grid grid-cols-2 gap-6">
              <GradientCard>
                <div className="bg-gradient-to-br from-white/80 via-blue-100/80 to-blue-400/80 dark:from-gray-900/80 dark:via-blue-900/80 dark:to-blue-800/80 border-l-8 border-blue-500 dark:border-blue-400 backdrop-blur-md rounded-xl p-4 shadow-inner overflow-hidden relative">
                  <LinkedInPostCreator />
                </div>
              </GradientCard>
              <GradientCard>
                <div className="bg-gradient-to-br from-white/80 via-blue-50/80 to-emerald-100/80 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-emerald-900/80 border-l-8 border-emerald-400 dark:border-emerald-500 backdrop-blur-md rounded-xl p-4 shadow-inner overflow-hidden relative">
                  <TwitterPostCreator />
                </div>
              </GradientCard>
            </div>
            <GradientCard>
              <div className="bg-neutral-900/90 rounded-xl p-4 shadow-inner overflow-hidden relative">
                <PostHistory />
              </div>
            </GradientCard>
            
            {/* Updates and Stats Section */}
            <div className="grid grid-cols-2 gap-6">
              <GradientCard>
                <div className="bg-gradient-to-br from-white/80 via-orange-100/80 to-pink-200/80 dark:from-gray-900/80 dark:via-orange-900/80 dark:to-pink-900/80 border-l-8 border-orange-400 dark:border-pink-500 backdrop-blur-md rounded-xl p-4 shadow-inner overflow-hidden relative">
                  <h2 className="text-xl font-semibold mb-4 text-orange-700 dark:text-pink-200">Latest Updates</h2>
                  <div className="space-y-4">
                    {allUpdates.length === 0 ? (
                      <div className="text-orange-900 dark:text-pink-100">No recent updates</div>
                    ) : (
                      allUpdates.map((update, idx) => (
                        <div key={idx} className="bg-white/10 p-4 rounded-lg flex flex-col">
                          <span className="text-xs text-orange-400 dark:text-pink-200 mb-1">{new Date(update.time).toLocaleString()}</span>
                          <span className="font-semibold text-orange-900 dark:text-pink-100">{update.title}</span>
                          <span className="text-sm text-orange-900 dark:text-pink-100">{update.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </GradientCard>

              <GradientCard>
                <div className="bg-gradient-to-br from-white/80 via-green-100/80 to-blue-200/80 dark:from-gray-900/80 dark:via-green-900/80 dark:to-blue-900/80 border-l-8 border-green-400 dark:border-blue-500 backdrop-blur-md rounded-xl p-4 shadow-inner overflow-hidden relative">
                  <h2 className="text-xl font-semibold mb-4 text-green-700 dark:text-blue-200">Quick Stats</h2>
                  <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-lg">
                      <p className="text-2xl font-semibold text-green-900 dark:text-blue-100">{avgGoalProgress}%</p>
                      <p className="text-sm text-green-700 dark:text-blue-200">Weekly Goal Progress</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <p className="text-2xl font-semibold text-green-900 dark:text-blue-100">{completedTasks}</p>
                      <p className="text-sm text-green-700 dark:text-blue-200">Tasks Completed</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <p className="text-2xl font-semibold text-green-900 dark:text-blue-100">{booksRead}</p>
                      <p className="text-sm text-green-700 dark:text-blue-200">Books Read</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <p className="text-2xl font-semibold text-green-900 dark:text-blue-100">{pagesRead}</p>
                      <p className="text-sm text-green-700 dark:text-blue-200">Pages Read</p>
                    </div>
                  </div>
                </div>
              </GradientCard>
            </div>
          </div>

          {/* Right Column - Agenda and Notifications */}
          <div className="col-span-3 space-y-6">
            <div className="sticky top-24 space-y-6">
              <GradientCard>
                <div className="bg-neutral-900/90 rounded-xl p-4 shadow-inner overflow-hidden relative">
                  <NotificationCard />
                </div>
              </GradientCard>
              <GradientCard>
                <div className="bg-neutral-900/90 rounded-xl p-4 shadow-inner overflow-hidden relative">
                  <TodayAgenda />
                </div>
              </GradientCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
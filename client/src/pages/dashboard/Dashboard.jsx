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
    <div className="p-8">
      <div className="mx-auto">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Column - Goals, Tasks, Reading */}
          <div className="col-span-3 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-4 text-white">
              <GoalsList />
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-4 text-white">
              <TasksList tasks={allTasks} updateTask={updateTask} />
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-4 text-white">
              <CurrentReading />
            </div>
          </div>
          {/* Middle Column - Welcome, Social, Updates */}
          <div className="col-span-6 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-4 text-white">
              <WelcomeBanner />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-4 text-white">
                <LinkedInPostCreator />
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-4 text-white">
                <TwitterPostCreator />
              </div>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-4 text-white">
              <PostHistory />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-4 text-white">
                <h2 className="text-xl font-bold mb-4">Latest Updates</h2>
                <div className="space-y-4">
                  {allUpdates.length === 0 ? (
                    <div className="text-neutral-400">No recent updates</div>
                  ) : (
                    allUpdates.map((update, idx) => (
                      <div key={idx} className="bg-neutral-800 p-4 rounded-lg flex flex-col">
                        <span className="text-xs text-neutral-400 mb-1">{new Date(update.time).toLocaleString()}</span>
                        <span className="font-semibold text-white">{update.title}</span>
                        <span className="text-sm text-neutral-200">{update.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-4 text-white">
                <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div className="bg-neutral-800 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-white">{avgGoalProgress}%</p>
                    <p className="text-sm text-neutral-400">Weekly Goal Progress</p>
                  </div>
                  <div className="bg-neutral-800 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-white">{completedTasks}</p>
                    <p className="text-sm text-neutral-400">Tasks Completed</p>
                  </div>
                  <div className="bg-neutral-800 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-white">{booksRead}</p>
                    <p className="text-sm text-neutral-400">Books Read</p>
                  </div>
                  <div className="bg-neutral-800 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-white">{pagesRead}</p>
                    <p className="text-sm text-neutral-400">Pages Read</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right Column - Agenda and Notifications */}
          <div className="col-span-3 space-y-6">
            <div className="space-y-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-4 text-white">
                <NotificationCard />
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-4 text-white">
                <TodayAgenda />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
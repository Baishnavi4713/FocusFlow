import React, { useState, useEffect } from 'react';
import { 
  Focus, Plus, Trash2, Clock, Calendar, BarChart3, TrendingUp, Target, Coffee, 
  Moon, Sun, AlertCircle, Award, Brain, Zap, Timer, Activity, Eye, 
  CheckCircle, XCircle, ArrowUp, ArrowDown, Minus
} from 'lucide-react';

// Utility functions
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const isToday = (dateString) => {
  return dateString === getCurrentDate();
};

const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
};

const getWeekDates = () => {
  const weekStart = new Date(getWeekStart());
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const getDayName = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' });
};

// Storage functions
const saveDistractions = (distractions) => {
  try {
    localStorage.setItem('focusflow_distractions', JSON.stringify(distractions));
  } catch (error) {
    console.error('Failed to save distractions to localStorage:', error);
  }
};

const loadDistractions = () => {
  try {
    const stored = localStorage.getItem('focusflow_distractions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load distractions from localStorage:', error);
    return [];
  }
};

const saveTheme = (theme) => {
  try {
    localStorage.setItem('focusflow_theme', theme);
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
};

const loadTheme = () => {
  try {
    return localStorage.getItem('focusflow_theme') || 'light';
  } catch (error) {
    console.error('Failed to load theme from localStorage:', error);
    return 'light';
  }
};

const saveFocusSessions = (sessions) => {
  try {
    localStorage.setItem('focusflow_sessions', JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save focus sessions to localStorage:', error);
  }
};

const loadFocusSessions = () => {
  try {
    const stored = localStorage.getItem('focusflow_sessions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load focus sessions from localStorage:', error);
    return [];
  }
};

// Constants
const CATEGORY_COLORS = {
  'Social Media': '#FF6B6B',
  'Food / Hunger': '#FFD93D',
  'Environment': '#6BCB77',
  'Mind Wandering': '#4D96FF',
  'Other': '#A66DD4'
};

const CATEGORIES = [
  'Social Media',
  'Food / Hunger',
  'Environment',
  'Mind Wandering',
  'Other'
];

// Theme Toggle Component
const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-500" />
      )}
    </button>
  );
};

// Focus Timer Component
const FocusTimer = ({ onSessionComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [sessionType, setSessionType] = useState('focus'); // 'focus' or 'break'
  const [sessionStartTime, setSessionStartTime] = useState(null);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (sessionType === 'focus' && sessionStartTime) {
        onSessionComplete({
          id: crypto.randomUUID(),
          startTime: sessionStartTime,
          endTime: new Date().toISOString(),
          duration: 25 * 60,
          type: 'focus',
          date: getCurrentDate()
        });
      }
      // Auto-switch to break
      if (sessionType === 'focus') {
        setSessionType('break');
        setTimeLeft(5 * 60); // 5 minute break
      } else {
        setSessionType('focus');
        setTimeLeft(25 * 60); // 25 minute focus
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, sessionType, sessionStartTime, onSessionComplete]);

  const toggleTimer = () => {
    if (!isActive && sessionType === 'focus') {
      setSessionStartTime(new Date().toISOString());
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionType === 'focus' ? 25 * 60 : 5 * 60);
    setSessionStartTime(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = sessionType === 'focus' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${sessionType === 'focus' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
          <Timer className={`w-5 h-5 ${sessionType === 'focus' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {sessionType === 'focus' ? 'Focus Session' : 'Break Time'}
        </h2>
      </div>

      <div className="text-center mb-6">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className={sessionType === 'focus' ? 'text-green-500' : 'text-blue-500'}
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={toggleTimer}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
              isActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : sessionType === 'focus'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

// Weekly Focus Chart Component
const WeeklyFocusChart = ({ distractions, focusSessions }) => {
  const weekDates = getWeekDates();
  
  const weeklyData = weekDates.map(date => {
    const dayDistractions = distractions.filter(d => d.date === date).length;
    const daySessions = focusSessions.filter(s => s.date === date).length;
    const focusScore = Math.max(0, 100 - (dayDistractions * 10));
    
    return {
      date,
      day: getDayName(date),
      distractions: dayDistractions,
      sessions: daySessions,
      focusScore,
      isToday: isToday(date)
    };
  });

  const maxDistractions = Math.max(...weeklyData.map(d => d.distractions), 1);
  const maxSessions = Math.max(...weeklyData.map(d => d.sessions), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Weekly Focus Overview
      </h3>
      
      <div className="space-y-4">
        {weeklyData.map((day) => (
          <div key={day.date} className={`p-4 rounded-lg border ${day.isToday ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-900 dark:text-white">
                  {day.day}
                </span>
                {day.isToday && (
                  <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                    Today
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">{day.sessions}</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600 dark:text-gray-400">{day.distractions}</span>
                </div>
                <div className={`font-medium ${day.focusScore >= 80 ? 'text-green-600' : day.focusScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {day.focusScore}%
                </div>
              </div>
            </div>
            
            {/* Visual bars */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">Sessions</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${(day.sessions / maxSessions) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">Distractions</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${(day.distractions / maxDistractions) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Focus Insights Component
const FocusInsights = ({ distractions, focusSessions }) => {
  const todayDistractions = distractions.filter(d => isToday(d.date));
  const todaySessions = focusSessions.filter(s => isToday(s.date));
  
  // Calculate trends
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split('T')[0];
  
  const yesterdayDistractions = distractions.filter(d => d.date === yesterdayDate).length;
  const distractionTrend = todayDistractions.length - yesterdayDistractions;
  
  const yesterdaySessions = focusSessions.filter(s => s.date === yesterdayDate).length;
  const sessionTrend = todaySessions.length - yesterdaySessions;

  // Peak distraction times
  const hourlyDistractions = {};
  todayDistractions.forEach(d => {
    const hour = new Date(d.timestamp).getHours();
    hourlyDistractions[hour] = (hourlyDistractions[hour] || 0) + 1;
  });
  
  const peakHour = Object.entries(hourlyDistractions).reduce((a, b) => 
    hourlyDistractions[a[0]] > hourlyDistractions[b[0]] ? a : b, [0, 0]
  )[0];

  // Most common distraction category
  const categoryCount = {};
  todayDistractions.forEach(d => {
    categoryCount[d.category] = (categoryCount[d.category] || 0) + 1;
  });
  
  const topCategory = Object.entries(categoryCount).reduce((a, b) => 
    categoryCount[a[0]] > categoryCount[b[0]] ? a : b, ['None', 0]
  )[0];

  const insights = [
    {
      icon: TrendingUp,
      title: 'Distraction Trend',
      value: distractionTrend === 0 ? 'Same as yesterday' : 
             distractionTrend > 0 ? `+${distractionTrend} vs yesterday` : 
             `${distractionTrend} vs yesterday`,
      color: distractionTrend <= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: distractionTrend <= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
    },
    {
      icon: Activity,
      title: 'Focus Sessions',
      value: sessionTrend === 0 ? 'Same as yesterday' : 
             sessionTrend > 0 ? `+${sessionTrend} vs yesterday` : 
             `${sessionTrend} vs yesterday`,
      color: sessionTrend >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: sessionTrend >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
    },
    {
      icon: Clock,
      title: 'Peak Distraction Time',
      value: todayDistractions.length > 0 ? `${peakHour}:00 - ${parseInt(peakHour) + 1}:00` : 'No data',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: Eye,
      title: 'Top Distraction',
      value: topCategory !== 'None' ? topCategory : 'No distractions',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
          <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Focus Insights
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <div key={index} className={`p-4 rounded-lg ${insight.bgColor}`}>
              <div className="flex items-center gap-3">
                <IconComponent className={`w-5 h-5 ${insight.color}`} />
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {insight.title}
                  </div>
                  <div className={`text-sm font-semibold ${insight.color}`}>
                    {insight.value}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Distraction Form Component
const DistractionForm = ({ onAddDistraction }) => {
  const [category, setCategory] = useState('Social Media');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) return;

    setIsSubmitting(true);

    const newDistraction = {
      id: crypto.randomUUID(),
      category,
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
      date: getCurrentDate()
    };

    setTimeout(() => {
      onAddDistraction(newDistraction);
      setReason('');
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Log Distraction
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => (
              <label
                key={cat}
                className={`
                  relative flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${category === cat
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md scale-105'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={category === cat}
                  onChange={(e) => setCategory(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {cat}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reason for distraction
          </label>
          <div className="relative">
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={100}
              placeholder="What caused you to lose focus?"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-colors duration-200"
              required
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {reason.length}/100
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!reason.trim() || isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Log Distraction
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// Distraction List Component
const DistractionList = ({ distractions, onDeleteDistraction }) => {
  if (distractions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No distractions logged today
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Great focus! Keep up the productive momentum.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Today's Distractions ({distractions.length})
          </h2>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {distractions.map((distraction, index) => (
            <div
              key={distraction.id}
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 group animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[distraction.category] }}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-sm font-medium px-2 py-1 rounded-full text-white"
                        style={{ backgroundColor: CATEGORY_COLORS[distraction.category] }}
                      >
                        {distraction.category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTime(distraction.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
                      {distraction.reason}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => onDeleteDistraction(distraction.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    aria-label="Delete distraction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Category Chart Component
const CategoryChart = ({ stats }) => {
  const maxCount = Math.max(...stats.map(s => s.count), 1);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Distraction Breakdown
      </h3>
      
      {stats.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No data to display yet
        </p>
      ) : (
        <div className="space-y-3">
          {stats.map((stat) => (
            <div key={stat.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stat.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.count} ({stat.percentage.toFixed(0)}%)
                  </span>
                </div>
              </div>
              
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    backgroundColor: stat.color,
                    width: `${(stat.count / maxCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Enhanced Distraction Stats Component
const DistractionStats = ({ distractions, focusSessions, onResetToday }) => {
  const totalToday = distractions.length;
  const sessionsToday = focusSessions.length;
  const focusScore = Math.max(0, 100 - (totalToday * 10));

  const categoryStats = Object.entries(CATEGORY_COLORS).map(
    ([category, color]) => {
      const count = distractions.filter((d) => d.category === category).length;
      const percentage = totalToday > 0 ? (count / totalToday) * 100 : 0;
      return {
        category,
        count,
        percentage,
        color,
      };
    }
  ).filter(stat => stat.count > 0);

  const getMotivationalMessage = () => {
    if (totalToday === 0) {
      return {
        icon: Target,
        message: "Perfect focus today! You're in the zone.",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-900/20"
      };
    } else if (totalToday <= 2) {
      return {
        icon: TrendingUp,
        message: "Good focus with minimal distractions. Keep it up!",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-900/20"
      };
    } else if (totalToday <= 5) {
      return {
        icon: Coffee,
        message: "Consider taking a short break to refocus your mind.",
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
      };
    } else {
      return {
        icon: Coffee,
        message: "High distraction day. Time for a mindful break!",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-900/20"
      };
    }
  };

  const motivation = getMotivationalMessage();
  const IconComponent = motivation.icon;

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Focus Analytics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {totalToday}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Distractions Today
            </div>
          </div>

          <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {sessionsToday}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Focus Sessions
            </div>
          </div>

          <div className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className={`text-3xl font-bold mb-2 ${focusScore >= 80 ? 'text-green-600' : focusScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {focusScore}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Focus Score
            </div>
          </div>
        </div>

        <div className={`mt-6 p-4 rounded-lg ${motivation.bgColor}`}>
          <div className="flex items-center gap-3">
            <IconComponent className={`w-5 h-5 ${motivation.color}`} />
            <span className={`text-sm font-medium ${motivation.color}`}>
              {motivation.message}
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <CategoryChart stats={categoryStats} />
      </div>

      {/* Reset Button */}
      {totalToday > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Fresh Start
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Clear today's distractions and begin with a clean slate
            </p>
            <button
              onClick={onResetToday}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Reset Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  const [distractions, setDistractions] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [theme, setTheme] = useState('light');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedDistractions = loadDistractions();
    const savedFocusSessions = loadFocusSessions();
    const savedTheme = loadTheme();
    
    setDistractions(savedDistractions);
    setFocusSessions(savedFocusSessions);
    setTheme(savedTheme);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Save data to localStorage whenever they change
  useEffect(() => {
    saveDistractions(distractions);
  }, [distractions]);

  useEffect(() => {
    saveFocusSessions(focusSessions);
  }, [focusSessions]);

  const handleAddDistraction = (newDistraction) => {
    setDistractions(prev => [...prev, newDistraction]);
  };

  const handleDeleteDistraction = (id) => {
    setDistractions(prev => prev.filter(d => d.id !== id));
  };

  const handleSessionComplete = (session) => {
    setFocusSessions(prev => [...prev, session]);
  };

  const handleResetToday = () => {
    if (window.confirm('Are you sure you want to clear all of today\'s distractions?')) {
      setDistractions(prev => prev.filter(d => !isToday(d.date)));
    }
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  // Filter data for today only
  const todaysDistractions = distractions.filter(d => isToday(d.date));
  const todaysFocusSessions = focusSessions.filter(s => isToday(s.date));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Focus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  FocusFlow
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Track distractions, improve focus
                </p>
              </div>
            </div>
            <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Form, Timer, and List */}
          <div className="xl:col-span-2 space-y-8">
            <DistractionForm onAddDistraction={handleAddDistraction} />
            <FocusTimer onSessionComplete={handleSessionComplete} />
            <DistractionList
              distractions={todaysDistractions}
              onDeleteDistraction={handleDeleteDistraction}
            />
          </div>

          {/* Right Column - Analytics */}
          <div className="xl:col-span-2 space-y-8">
            <DistractionStats
              distractions={todaysDistractions}
              focusSessions={todaysFocusSessions}
              onResetToday={handleResetToday}
            />
            <FocusInsights
              distractions={distractions}
              focusSessions={focusSessions}
            />
            <WeeklyFocusChart
              distractions={distractions}
              focusSessions={focusSessions}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Built for better focus and productivity</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
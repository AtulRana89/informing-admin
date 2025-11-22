import { BookOpen, Calendar, Presentation, UserCheck, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { apiService } from "../services";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgColor: string;
  iconColor: string;
}


interface DashboardStats {
  data: any;

  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  deletedUsers: number;
  totalJournal: number;
  totalConference: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  bgColor,
  iconColor
}) => {

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center">
      <div className="flex items-center justify-between mb-4">
        <div className={`${bgColor} p-3 rounded-lg`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

// interface ActivityItem {
//   id: number;
//   user: string;
//   action: string;
//   timestamp: string;
//   type: 'user' | 'journal' | 'review' | 'conference';
// }

const Dashboard: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'weekly' | 'monthly' | 'yearly'>('all');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  // const [isLoading, setIsLoading] = useState(false);
  // Fetch journals from API
  const fetchDashboardData = async () => {
    try {
      // setIsLoading(true);

      const response = await apiService.get<DashboardStats>('/dashboard/admin', {
        params: { period: selectedFilter }
      });
      const data = response?.data?.response;
      const parsedData = (data as any).display || data;
      console.log("response :", JSON.stringify(parsedData));
      setStats(parsedData);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      // setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedFilter]);
  // Mock data - replace with actual API calls
  const dashboardData = {
    all: {
      totalUsers: 1234,
      activeJournals: 15,
      upcomingConferences: 3,
      activeReviewers: 89,
      memberships:77,
      submissions:65,
      trends: {
        users: { value: 5.2, isPositive: true },
        journals: { value: 2.1, isPositive: true },
        conferences: { value: 1.5, isPositive: false },
        reviewers: { value: 3.8, isPositive: true },
      }
    },
    weekly: {
      totalUsers: 1234,
      activeJournals: 15,
      upcomingConferences: 3,
      activeReviewers: 89,
      memberships:77,
      submissions:65,
      trends: {
        users: { value: 5.2, isPositive: true },
        journals: { value: 2.1, isPositive: true },
        conferences: { value: 1.5, isPositive: false },
        reviewers: { value: 3.8, isPositive: true },
      }
    },
    monthly: {
      totalUsers: 5678,
      activeJournals: 15,
      upcomingConferences: 7,
      activeReviewers: 234,
      memberships:77,
      submissions:65,
      trends: {
        users: { value: 12.3, isPositive: true },
        journals: { value: 0, isPositive: true },
        conferences: { value: 3.2, isPositive: true },
        reviewers: { value: 8.5, isPositive: true },
      }
    },
    yearly: {
      totalUsers: 23376,
      activeJournals: 15,
      upcomingConferences: 24,
      activeReviewers: 1567,
      memberships:77,
      submissions:65,
      trends: {
        users: { value: 45.8, isPositive: true },
        journals: { value: 6.7, isPositive: false },
        conferences: { value: 15.3, isPositive: true },
        reviewers: { value: 23.4, isPositive: true },
      }
    }
  };

  // const recentActivities: ActivityItem[] = [
  //   {
  //     id: 1,
  //     user: 'Hemant Kumar',
  //     action: 'submitted a new article to JITE:Research',
  //     timestamp: '2 hours ago',
  //     type: 'journal'
  //   },
  //   {
  //     id: 2,
  //     user: 'Jennifer Ymbong',
  //     action: 'completed review for article #1234',
  //     timestamp: '3 hours ago',
  //     type: 'review'
  //   },
  //   {
  //     id: 3,
  //     user: 'Novian Anggis',
  //     action: 'registered as a new user',
  //     timestamp: '5 hours ago',
  //     type: 'user'
  //   },
  //   {
  //     id: 4,
  //     user: 'Hazar Hedi Ayadi',
  //     action: 'registered for InSITE Conference 2024',
  //     timestamp: '6 hours ago',
  //     type: 'conference'
  //   },
  //   {
  //     id: 5,
  //     user: 'System',
  //     action: 'Published new volume of InformingSciJ',
  //     timestamp: '1 day ago',
  //     type: 'journal'
  //   }
  // ];

  const currentData = dashboardData[selectedFilter];

  // const getActivityIcon = (type: string) => {
  //   switch (type) {
  //     case 'user':
  //       return <Users size={16} className="text-blue-600" />;
  //     case 'journal':
  //       return <BookOpen size={16} className="text-green-600" />;
  //     case 'review':
  //       return <UserCheck size={16} className="text-purple-600" />;
  //     case 'conference':
  //       return <Calendar size={16} className="text-orange-600" />;
  //     default:
  //       return <Activity size={16} className="text-gray-600" />;
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-aut">
        {/* Header */}
        <div className="mb-8">
          <div className="text-2xl font-light text-gray-600">
            Dashboard
          </div>
          {/* <span className="text-4xl font-normal text-gray-800">DASHBOARD</span> */}
          <p className="text-gray-600">Welcome back! Here's what's happening.</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6">
          <div
            onClick={() => setSelectedFilter('all')}
            className={`px-6 py-2 cursor-pointer rounded-lg font-medium transition-all ${selectedFilter === 'all'
              ? 'bg-[#4282c8] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
          >
            All
          </div>
          <div
            onClick={() => setSelectedFilter('weekly')}
            className={`px-6 py-2 cursor-pointer rounded-lg font-medium transition-all ${selectedFilter === 'weekly'
              ? 'bg-[#4282c8] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
          >
            Weekly
          </div>
          <div
            onClick={() => setSelectedFilter('monthly')}
            className={`px-6 py-2 cursor-pointer rounded-lg font-medium transition-all ${selectedFilter === 'monthly'
              ? 'bg-[#4282c8] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
          >
            Monthly
          </div>
          <div
            onClick={() => setSelectedFilter('yearly')}
            className={`px-6 py-2 cursor-pointer rounded-lg font-medium transition-all ${selectedFilter === 'yearly'
              ? 'bg-[#4282c8] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
          >
            Yearly
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Users"
            value={stats?.totalUsers ?? 0}
            icon={<Users size={24} />}
            trend={currentData.trends.users}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />

          <DashboardCard
            title="Inactive Users"
            value={stats?.inactiveUsers ?? 0}
            icon={<UserCheck size={24} />}
            trend={currentData.trends.reviewers}
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
          <DashboardCard
            title="Total Journals"
            value={stats?.totalJournal ?? 0}
            icon={<BookOpen size={24} />}
            trend={currentData.trends.journals}
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <DashboardCard
            title="Memberships"
            value={stats?.totalConference ?? 0}
            icon={<Users  size={24} />}
            trend={currentData.trends.conferences}
            bgColor="bg-orange-100"
            iconColor="text-orange-600"
          />

           <DashboardCard
            title="Submissions"
            value={stats?.totalConference ?? 0}
            icon={<Calendar size={24} />}
            trend={currentData.trends.conferences}
            bgColor="bg-yellow-100"
            iconColor="text-orange-600"
          />
           <DashboardCard
            title="Total Conferences"
            value={stats?.totalConference ?? 0}
            icon={<Presentation  size={24} />}
            trend={currentData.trends.conferences}
            bgColor="bg-gray-100"
            iconColor="text-orange-600"
          />
        </div>

        {/* Recent Activity */}
        {/* <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Activity size={24} className="text-gray-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">
                    <span className="font-semibold">{activity.user}</span>{' '}
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button className="text-[#4282c8] hover:text-blue-700 font-medium text-sm">
              View All Activities →
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
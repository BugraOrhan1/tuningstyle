import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { mockNews } from '../mock';
import { Coins, Upload, FileText, BookOpen, ChevronRight, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  in_progress: { color: 'bg-blue-100 text-blue-800', icon: Clock },
  completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  rejected: { color: 'bg-red-100 text-red-800', icon: Clock },
};

export const Dashboard = () => {
  const { user, files, t } = useApp();
  const recentFiles = files.slice(0, 5);
  const completedCount = files.filter(f => f.status === 'completed').length;
  const pendingCount = files.filter(f => f.status === 'pending' || f.status === 'in_progress').length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-fct-dark">{t('welcomeBack')}, {user?.firstName}!</h1>
          <p className="text-fct-muted mt-1">{t('overview')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-fct-muted">{t('yourCredits')}</span>
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                <Coins className="w-5 h-5 text-fct-orange" />
              </div>
            </div>
            <div className="text-3xl font-bold text-fct-dark">{user?.credits || 0}</div>
            <p className="text-xs text-fct-muted mt-1">{t('creditsAvailable')}</p>
            <Link to="/credits" className="mt-3 inline-flex items-center gap-1 text-sm text-fct-orange hover:underline font-medium">
              {t('buyCredits')}<ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-white rounded p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-fct-muted">{t('completed')}</span>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-fct-dark">{completedCount}</div>
            <p className="text-xs text-fct-muted mt-1">files tuned</p>
          </div>
          <div className="bg-white rounded p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-fct-muted">{t('in_progress')}</span>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-fct-dark">{pendingCount}</div>
            <p className="text-xs text-fct-muted mt-1">awaiting tuning</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-fct-dark mb-4">{t('quickActions')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/upload" className="bg-white p-5 rounded shadow-sm border border-gray-100 hover:border-fct-orange hover:shadow-md group">
              <Upload className="w-6 h-6 text-fct-orange mb-2" />
              <div className="font-semibold text-fct-dark text-sm">{t('uploadFile')}</div>
            </Link>
            <Link to="/files" className="bg-white p-5 rounded shadow-sm border border-gray-100 hover:border-fct-orange hover:shadow-md group">
              <FileText className="w-6 h-6 text-fct-orange mb-2" />
              <div className="font-semibold text-fct-dark text-sm">{t('myFiles')}</div>
            </Link>
            <Link to="/credits" className="bg-white p-5 rounded shadow-sm border border-gray-100 hover:border-fct-orange hover:shadow-md group">
              <Coins className="w-6 h-6 text-fct-orange mb-2" />
              <div className="font-semibold text-fct-dark text-sm">{t('buyCredits')}</div>
            </Link>
            <Link to="/tuning-specs" className="bg-white p-5 rounded shadow-sm border border-gray-100 hover:border-fct-orange hover:shadow-md group">
              <BookOpen className="w-6 h-6 text-fct-orange mb-2" />
              <div className="font-semibold text-fct-dark text-sm">{t('tuningSpecs')}</div>
            </Link>
          </div>
        </div>

        {/* Recent files & news */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-fct-dark">{t('recentFiles')}</h2>
              <Link to="/files" className="text-sm text-fct-orange hover:underline">{t('viewAll')}</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentFiles.length === 0 && (
                <div className="px-6 py-12 text-center text-sm text-fct-muted">
                  No files yet. <Link to="/upload" className="text-fct-orange hover:underline">Upload your first file</Link>
                </div>
              )}
              {recentFiles.map(f => {
                const sc = statusConfig[f.status] || statusConfig.pending;
                return (
                  <div key={f.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-fct-dark truncate">{f.fileName}</div>
                      <div className="text-xs text-fct-muted truncate">{f.vehicle}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap ${sc.color}`}>
                      {t(f.status)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white rounded shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-fct-dark flex items-center gap-2"><TrendingUp className="w-4 h-4 text-fct-orange" />{t('news')}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {mockNews.map(n => (
                <div key={n.id} className="px-6 py-4">
                  <div className="text-xs text-fct-muted mb-1">{new Date(n.date).toLocaleDateString()}</div>
                  <div className="font-medium text-sm text-fct-dark mb-1">{n.title}</div>
                  <div className="text-xs text-fct-muted line-clamp-2">{n.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

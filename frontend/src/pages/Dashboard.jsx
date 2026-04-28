import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { mockNews } from '../mock';
import {
  Coins, Upload, FileText, BookOpen, ChevronRight, TrendingUp,
  Clock, CheckCircle2, ArrowUpRight, Sparkles, ShieldCheck, Zap,
} from 'lucide-react';

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  in_progress: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
  completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: Clock },
};

export const Dashboard = () => {
  const { user, files, t } = useApp();
  const recentFiles = files.slice(0, 5);
  const completedCount = files.filter(f => f.status === 'completed').length;
  const pendingCount = files.filter(f => f.status === 'pending' || f.status === 'in_progress').length;
  const totalSpent = files.reduce((s, f) => s + (f.credits || 0), 0);

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        {/* Welcome banner */}
        <div className="bg-white rounded shadow-sm border border-gray-100 p-6 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-fct-dark">
              {t('welcomeBack')}, {user?.firstName}!
            </h1>
            <p className="text-fct-muted mt-1 text-sm">{t('overview')} — Manage your tuning files and credits.</p>
          </div>
          <Link to="/upload" className="bg-fct-orange hover:bg-[#D45F25] text-white font-semibold px-5 py-2.5 rounded flex items-center gap-2">
            <Upload className="w-4 h-4" />{t('uploadFile')}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded bg-orange-50 flex items-center justify-center">
                <Coins className="w-5 h-5 text-fct-orange" />
              </div>
              <Link to="/credits" className="text-fct-orange hover:text-[#D45F25]">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="text-3xl font-bold text-fct-dark">{user?.credits || 0}</div>
            <p className="text-xs text-fct-muted mt-1">{t('creditsAvailable')}</p>
          </div>
          <div className="bg-white rounded p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-fct-dark">{completedCount}</div>
            <p className="text-xs text-fct-muted mt-1">Completed files</p>
          </div>
          <div className="bg-white rounded p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-fct-dark">{pendingCount}</div>
            <p className="text-xs text-fct-muted mt-1">Awaiting tuning</p>
          </div>
          <div className="bg-white rounded p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded bg-purple-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-fct-dark">{totalSpent}</div>
            <p className="text-xs text-fct-muted mt-1">Credits spent</p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded p-5 shadow-sm border border-gray-100 flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-fct-orange" />
            </div>
            <div>
              <div className="font-semibold text-sm text-fct-dark">5-10 min delivery</div>
              <p className="text-xs text-fct-muted mt-1">During business hours</p>
            </div>
          </div>
          <div className="bg-white rounded p-5 shadow-sm border border-gray-100 flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-green-50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-sm text-fct-dark">Dyno-tested files</div>
              <p className="text-xs text-fct-muted mt-1">Quality and safety guaranteed</p>
            </div>
          </div>
          <div className="bg-white rounded p-5 shadow-sm border border-gray-100 flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-sm text-fct-dark">Custom tuning</div>
              <p className="text-xs text-fct-muted mt-1">Tailored to your vehicle</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-sm font-semibold text-fct-dark uppercase tracking-wide mb-3">{t('quickActions')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/upload" className="bg-white p-5 rounded shadow-sm border border-gray-100 hover:border-fct-orange hover:shadow-md group transition-all">
            <div className="w-10 h-10 rounded bg-orange-50 flex items-center justify-center mb-3 group-hover:bg-fct-orange group-hover:text-white transition-colors">
              <Upload className="w-5 h-5 text-fct-orange group-hover:text-white" />
            </div>
            <div className="font-semibold text-fct-dark text-sm">{t('uploadFile')}</div>
            <p className="text-xs text-fct-muted mt-1">Submit a new tuning request</p>
          </Link>
          <Link to="/files" className="bg-white p-5 rounded shadow-sm border border-gray-100 hover:border-fct-orange hover:shadow-md group transition-all">
            <div className="w-10 h-10 rounded bg-orange-50 flex items-center justify-center mb-3 group-hover:bg-fct-orange transition-colors">
              <FileText className="w-5 h-5 text-fct-orange group-hover:text-white" />
            </div>
            <div className="font-semibold text-fct-dark text-sm">{t('myFiles')}</div>
            <p className="text-xs text-fct-muted mt-1">View your tuning history</p>
          </Link>
          <Link to="/credits" className="bg-white p-5 rounded shadow-sm border border-gray-100 hover:border-fct-orange hover:shadow-md group transition-all">
            <div className="w-10 h-10 rounded bg-orange-50 flex items-center justify-center mb-3 group-hover:bg-fct-orange transition-colors">
              <Coins className="w-5 h-5 text-fct-orange group-hover:text-white" />
            </div>
            <div className="font-semibold text-fct-dark text-sm">{t('buyCredits')}</div>
            <p className="text-xs text-fct-muted mt-1">Top up your balance</p>
          </Link>
          <Link to="/tuning-specs" className="bg-white p-5 rounded shadow-sm border border-gray-100 hover:border-fct-orange hover:shadow-md group transition-all">
            <div className="w-10 h-10 rounded bg-orange-50 flex items-center justify-center mb-3 group-hover:bg-fct-orange transition-colors">
              <BookOpen className="w-5 h-5 text-fct-orange group-hover:text-white" />
            </div>
            <div className="font-semibold text-fct-dark text-sm">{t('tuningSpecs')}</div>
            <p className="text-xs text-fct-muted mt-1">Browse expected gains</p>
          </Link>
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
                <div className="px-6 py-12 text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-orange-50 flex items-center justify-center mb-3">
                    <FileText className="w-7 h-7 text-fct-orange" />
                  </div>
                  <p className="text-sm text-fct-dark font-medium mb-1">No files yet</p>
                  <Link to="/upload" className="text-sm text-fct-orange hover:underline">Upload your first file →</Link>
                </div>
              )}
              {recentFiles.map(f => {
                const sc = statusConfig[f.status] || statusConfig.pending;
                return (
                  <Link key={f.id} to={`/files/${f.id}`} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-fct-dark truncate">{f.fileName}</div>
                      <div className="text-xs text-fct-muted truncate">{f.vehicle}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap border ${sc.color}`}>
                      {t(f.status)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="bg-white rounded shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-fct-dark flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-fct-orange" />{t('news')}
              </h2>
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

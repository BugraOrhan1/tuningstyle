import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { FileChat } from '../components/FileChat';
import { filesApi, downloadProtected } from '../api/client';
import { Download, ArrowLeft, Clock, CheckCircle2, X, FileText } from 'lucide-react';

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  in_progress: { color: 'bg-blue-100 text-blue-800', icon: Clock },
  completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  rejected: { color: 'bg-red-100 text-red-800', icon: X },
};

export const FileDetail = () => {
  const { id } = useParams();
  const { t } = useApp();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    filesApi.get(id).then(setFile).finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async (kind) => {
    const url = filesApi.downloadUrl(file.id, kind);
    const name = kind === 'tuned' ? (file.tunedFileName || 'tuned.bin') : file.fileName;
    await downloadProtected(url, name);
  };

  if (loading) return <DashboardLayout><div className="text-center py-12">Loading...</div></DashboardLayout>;
  if (!file) return <DashboardLayout><div>File not found</div></DashboardLayout>;

  const sc = statusConfig[file.status] || statusConfig.pending;

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <Link to="/files" className="inline-flex items-center gap-2 text-sm text-fct-orange hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" />Back to my files
        </Link>
        <div className="bg-white rounded shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-fct-dark flex items-center gap-2">
                <FileText className="w-5 h-5 text-fct-orange" />{file.fileName}
              </h1>
              <p className="text-sm text-fct-muted mt-1">{file.vehicle}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded font-medium ${sc.color}`}>{t(file.status)}</span>
          </div>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><dt className="text-fct-muted text-xs">ECU</dt><dd className="font-medium">{file.ecu}</dd></div>
            <div><dt className="text-fct-muted text-xs">Credits</dt><dd className="font-medium text-fct-orange">{file.credits}</dd></div>
            <div><dt className="text-fct-muted text-xs">Uploaded</dt><dd className="font-medium">{new Date(file.uploadedAt).toLocaleString()}</dd></div>
            <div><dt className="text-fct-muted text-xs">Completed</dt><dd className="font-medium">{file.completedAt ? new Date(file.completedAt).toLocaleString() : '-'}</dd></div>
          </dl>
          {file.tuningOptions?.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-fct-muted mb-1">Options</div>
              <div className="flex flex-wrap gap-1">
                {file.tuningOptions.map(o => <span key={o} className="text-xs px-2 py-0.5 bg-gray-100 rounded">{o}</span>)}
              </div>
            </div>
          )}
          {file.note && (
            <div className="mt-4">
              <div className="text-xs text-fct-muted mb-1">Note</div>
              <p className="text-sm bg-gray-50 p-3 rounded border border-gray-100">{file.note}</p>
            </div>
          )}
          <div className="mt-6 flex gap-3 flex-wrap">
            {file.hasOriginal && (
              <button onClick={() => handleDownload('original')} className="px-4 py-2 border border-gray-300 hover:border-fct-orange text-sm rounded flex items-center gap-2">
                <Download className="w-4 h-4" />Download original
              </button>
            )}
            {file.hasTuned && (
              <button onClick={() => handleDownload('tuned')} className="px-4 py-2 bg-fct-orange hover:bg-[#D45F25] text-white text-sm font-semibold rounded flex items-center gap-2">
                <Download className="w-4 h-4" />Download tuned file
              </button>
            )}
          </div>
        </div>
        <div className="bg-white rounded shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-fct-dark mb-4">Conversation with support</h2>
          <FileChat fileId={file.id} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FileDetail;

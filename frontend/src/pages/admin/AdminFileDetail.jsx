import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { FileChat } from '../../components/FileChat';
import { filesApi, adminApi, downloadProtected } from '../../api/client';
import { ArrowLeft, Download, Upload, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

export const AdminFileDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [uploading, setUploading] = useState(false);
  const tunedFileRef = useRef(null);

  const load = async () => {
    try { setFile(await filesApi.get(id)); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const handleDownload = async (kind) => {
    const url = filesApi.downloadUrl(file.id, kind);
    const name = kind === 'tuned' ? (file.tunedFileName || 'tuned.bin') : file.fileName;
    await downloadProtected(url, name);
  };

  const handleStatus = async (newStatus) => {
    setSavingStatus(true);
    try {
      const updated = await adminApi.updateStatus(id, newStatus);
      setFile(updated);
      toast({ title: `Status updated to ${newStatus}` });
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
    setSavingStatus(false);
  };

  const handleUploadTuned = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setUploading(true);
    try {
      const updated = await adminApi.uploadTuned(id, f);
      setFile(updated);
      toast({ title: 'Tuned file uploaded', description: 'Customer has been notified.' });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.response?.data?.detail || '', variant: 'destructive' });
    }
    setUploading(false);
    e.target.value = '';
  };

  if (loading) return <DashboardLayout><div className="p-12 text-center">Loading...</div></DashboardLayout>;
  if (!file) return <DashboardLayout><div>File not found</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <Link to="/admin/files" className="inline-flex items-center gap-2 text-sm text-fct-orange hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" />Back to all files
        </Link>
        <div className="bg-white rounded shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-fct-dark">{file.fileName}</h1>
              <p className="text-sm text-fct-muted">{file.vehicle} • ECU: {file.ecu}</p>
              <p className="text-sm text-fct-muted mt-1">Customer: <span className="font-medium text-fct-dark">{file.userName} ({file.userEmail})</span></p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded font-medium bg-gray-100">{file.status}</span>
          </div>
          {file.tuningOptions?.length > 0 && (
            <div className="mb-3"><div className="text-xs text-fct-muted mb-1">Options</div>
              <div className="flex flex-wrap gap-1">{file.tuningOptions.map(o => <span key={o} className="text-xs px-2 py-0.5 bg-gray-100 rounded">{o}</span>)}</div>
            </div>
          )}
          {file.note && <div className="mb-3"><div className="text-xs text-fct-muted mb-1">Customer note</div><p className="text-sm bg-gray-50 p-3 rounded">{file.note}</p></div>}
          <div className="mt-4 flex gap-3 flex-wrap">
            {file.hasOriginal && (
              <button onClick={() => handleDownload('original')} className="px-4 py-2 border border-gray-300 hover:border-fct-orange text-sm rounded flex items-center gap-2">
                <Download className="w-4 h-4" />Download original
              </button>
            )}
            {file.hasTuned && (
              <button onClick={() => handleDownload('tuned')} className="px-4 py-2 border border-green-300 hover:border-green-500 text-green-700 text-sm rounded flex items-center gap-2">
                <Download className="w-4 h-4" />Download tuned ({file.tunedFileName})
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-fct-dark mb-3">Update status</h2>
            <div className="flex flex-wrap gap-2">
              {['pending', 'in_progress', 'completed', 'rejected'].map(s => (
                <button key={s} onClick={() => handleStatus(s)} disabled={savingStatus || file.status === s}
                  className={`px-3 py-2 text-xs font-medium rounded border ${file.status === s ? 'bg-fct-orange text-white border-fct-orange' : 'border-gray-300 hover:border-fct-orange'} disabled:opacity-60`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-fct-dark mb-3">Upload tuned file</h2>
            <p className="text-xs text-fct-muted mb-3">This marks the file as completed and notifies the customer.</p>
            <input ref={tunedFileRef} type="file" className="hidden" onChange={handleUploadTuned} />
            <button onClick={() => tunedFileRef.current?.click()} disabled={uploading}
              className="w-full bg-fct-orange hover:bg-[#D45F25] text-white font-semibold py-2.5 rounded flex items-center justify-center gap-2 disabled:opacity-60">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4" />{file.hasTuned ? 'Replace tuned file' : 'Upload tuned file'}</>}
            </button>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-fct-dark mb-4">Conversation</h2>
          <FileChat fileId={file.id} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminFileDetail;

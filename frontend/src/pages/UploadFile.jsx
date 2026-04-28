import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { mockBrands, mockEcuOptions, mockTuningServices } from '../mock';
import { Upload, FileUp, X, Coins, AlertCircle, ChevronRight } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export const UploadFile = () => {
  const { user, t, submitFile } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    brand: '', model: '', engine: '', year: '', ecu: '', note: '',
  });
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const baseStage1Cost = 6;
  const totalCredits = baseStage1Cost + selectedOptions.reduce((s, id) => {
    const opt = mockTuningServices.find(o => o.id === id);
    return s + (opt?.credits || 0);
  }, 0);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const toggleOption = (id) => {
    setSelectedOptions(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      toast({ title: 'Please select a file', variant: 'destructive' });
      return;
    }
    if (user.credits < totalCredits) {
      toast({ title: t('notEnoughCredits'), variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const result = submitFile({
        fileName: file.name,
        vehicle: `${form.brand} ${form.model} ${form.engine} (${form.year})`,
        ecu: form.ecu,
        tuningOptions: selectedOptions.map(id => mockTuningServices.find(o => o.id === id)?.name).filter(Boolean),
        credits: totalCredits,
        note: form.note,
      });
      if (result.success) {
        toast({ title: 'File submitted!', description: 'Our engineers will process it shortly.' });
        navigate('/files');
      } else {
        toast({ title: 'Submission failed', description: result.error, variant: 'destructive' });
      }
      setSubmitting(false);
    }, 800);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-2xl lg:text-3xl font-bold text-fct-dark mb-2">{t('uploadFile')}</h1>
        <p className="text-fct-muted mb-8">Upload your original ECU file and select tuning options.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File drop zone */}
          <div className="bg-white rounded p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-fct-dark mb-4">Original file</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded p-10 text-center cursor-pointer ${dragOver ? 'border-fct-orange bg-orange-50' : 'border-gray-300 hover:border-fct-orange'}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".bin,.ori,.frf,.kess,.sgo,.mpc,.zip"
                onChange={(e) => setFile(e.target.files[0])}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileUp className="w-8 h-8 text-fct-orange" />
                  <div>
                    <div className="font-medium text-fct-dark">{file.name}</div>
                    <div className="text-xs text-fct-muted">{(file.size / 1024).toFixed(1)} KB • {t('fileSelected')}</div>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="ml-4 p-1 hover:bg-gray-100 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-fct-muted mx-auto mb-3" />
                  <p className="text-sm text-fct-dark font-medium">{t('dragDropFile')}</p>
                  <p className="text-xs text-fct-muted mt-1">.bin, .ori, .frf, .kess, .sgo, .mpc, .zip</p>
                </>
              )}
            </div>
          </div>

          {/* Vehicle */}
          <div className="bg-white rounded p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-fct-dark mb-4">{t('selectVehicle')}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-fct-dark mb-1.5">{t('brand')}</label>
                <select required value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange bg-white">
                  <option value="">-- Select --</option>
                  {mockBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-fct-dark mb-1.5">{t('model')}</label>
                <input required value={form.model} onChange={(e) => setForm({...form, model: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange" />
              </div>
              <div>
                <label className="block text-sm font-medium text-fct-dark mb-1.5">{t('engine')}</label>
                <input required value={form.engine} onChange={(e) => setForm({...form, engine: e.target.value})} placeholder="e.g. 2.0 TDI 150hp" className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange" />
              </div>
              <div>
                <label className="block text-sm font-medium text-fct-dark mb-1.5">{t('year')}</label>
                <input required type="number" min="1990" max="2026" value={form.year} onChange={(e) => setForm({...form, year: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-fct-dark mb-1.5">{t('selectEcu')}</label>
                <select required value={form.ecu} onChange={(e) => setForm({...form, ecu: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange bg-white">
                  <option value="">-- Select ECU --</option>
                  {mockEcuOptions.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Tuning options */}
          <div className="bg-white rounded p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-fct-dark mb-4">{t('tuningOptions')}</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {mockTuningServices.map(s => (
                <label key={s.id} className={`flex items-start gap-3 p-3 border rounded cursor-pointer ${selectedOptions.includes(s.id) ? 'border-fct-orange bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="checkbox" checked={selectedOptions.includes(s.id)} onChange={() => toggleOption(s.id)} className="mt-1 accent-[#ED6E2E]" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-fct-dark">{s.name}</span>
                      {s.credits > 0 && <span className="text-xs font-semibold text-fct-orange">+{s.credits}</span>}
                    </div>
                    <div className="text-xs text-fct-muted mt-0.5">{s.description}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-fct-dark mb-1.5">{t('additionalNotes')}</label>
              <textarea value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} rows={3} className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange" />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Coins className="w-6 h-6 text-fct-orange" />
              <div>
                <div className="text-sm text-fct-muted">{t('totalCredits')}</div>
                <div className="text-2xl font-bold text-fct-dark">{totalCredits}</div>
              </div>
              {user?.credits < totalCredits && (
                <div className="flex items-center gap-2 text-red-600 text-sm ml-4">
                  <AlertCircle className="w-4 h-4" />{t('notEnoughCredits')}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting || !file}
              className="bg-fct-orange hover:bg-[#D45F25] text-white font-semibold px-6 py-3 rounded flex items-center gap-2 disabled:opacity-60"
            >
              {submitting ? '...' : t('submitFile')}<ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default UploadFile;

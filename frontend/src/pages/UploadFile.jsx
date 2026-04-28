import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { vehiclesApi, optionsApi } from '../api/client';
import { Upload, FileUp, X, Coins, AlertCircle, Clock, ChevronRight, Plus } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const OTHER = 'Otherwise, namely';

const Section = ({ title, children }) => (
  <div className="bg-white rounded shadow-sm border border-gray-100 mb-4">
    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
      <h2 className="text-sm font-semibold text-fct-dark uppercase tracking-wide">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Field = ({ label, optional, children, span = '' }) => (
  <div className={span}>
    <label className="block text-xs font-medium text-fct-dark mb-1.5">
      {label} {optional && <span className="text-fct-muted font-normal">(optional)</span>}
    </label>
    {children}
  </div>
);

const Select = ({ value, onChange, disabled, children, ...rest }) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    {...rest}
    className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange bg-white disabled:bg-gray-50 disabled:text-gray-400"
  >
    {children}
  </select>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange"
  />
);

// Cascading select with "Otherwise, namely" custom text fallback
const CascadeSelect = ({ value, customValue, onChange, onCustomChange, options, disabled, placeholder = 'Make your choice', getLabel = (o) => o, getKey = (o) => o }) => {
  const isOther = value === OTHER;
  return (
    <div className="space-y-2">
      <Select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={getKey(o)} value={getKey(o)}>{getLabel(o)}</option>)}
      </Select>
      {isOther && (
        <Input
          value={customValue || ''}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="Specify..."
        />
      )}
    </div>
  );
};

export const UploadFile = () => {
  const { user, t, submitFile } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const tcuFileInputRef = useRef(null);
  const attachInputRef = useRef(null);

  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [generations, setGenerations] = useState([]);
  const [engines, setEngines] = useState([]);
  const [ecus, setEcus] = useState([]);
  const [tuningTypes, setTuningTypes] = useState([]);
  const [additionalOptions, setAdditionalOptions] = useState([]);
  const [tools, setTools] = useState({
    toolTypes: [], readMethods: [], gearboxes: [], octaneRatings: [],
    vehicleTypes: [], timeFrames: [],
  });

  const [form, setForm] = useState({
    vehicleType: 'Car',
    brand: '', brandCustom: '',
    model: '', modelCustom: '',
    generation: '', generationCustom: '',
    engine: '', engineCustom: '',
    ecu: '', ecuCustom: '',
    engineHp: '', engineKw: '', year: '', gearbox: '',
    licensePlate: '', vin: '', octane: '',
    toolType: '', readMethod: '', readMethodCustom: '',
    hardwareNumber: '', softwareNumber: '',
    tuningType: '', tuningOptions: [],
    modifiedParts: '', modifiedPartsDetails: '',
    timeFrame: 'asap', note: '',
    acceptTerms: false, acceptRefund: false,
  });
  const [file, setFile] = useState(null);
  const [tcuFile, setTcuFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    vehiclesApi.brands().then(setBrands).catch(() => {});
    optionsApi.tuningTypes().then(setTuningTypes).catch(() => {});
    optionsApi.additional().then(setAdditionalOptions).catch(() => {});
    optionsApi.tools().then(setTools).catch(() => {});
  }, []);

  // Cascading
  useEffect(() => {
    if (form.brand && form.brand !== OTHER) {
      vehiclesApi.models(form.brand).then(setModels);
    } else if (form.brand === OTHER) {
      setModels([OTHER]);
    } else {
      setModels([]);
    }
    setForm(prev => ({ ...prev, model: '', modelCustom: '', generation: '', engine: '', ecu: '', engineHp: '', engineKw: '' }));
    // eslint-disable-next-line
  }, [form.brand]);

  useEffect(() => {
    const brandToUse = form.brand === OTHER ? form.brandCustom : form.brand;
    if (form.model && form.model !== OTHER && brandToUse) {
      vehiclesApi.generations(brandToUse, form.model).then(setGenerations);
    } else if (form.model === OTHER) {
      setGenerations([OTHER]);
    } else {
      setGenerations([]);
    }
    setForm(prev => ({ ...prev, generation: '', generationCustom: '', engine: '', ecu: '', engineHp: '', engineKw: '' }));
    // eslint-disable-next-line
  }, [form.model]);

  useEffect(() => {
    const brandToUse = form.brand === OTHER ? form.brandCustom : form.brand;
    const modelToUse = form.model === OTHER ? form.modelCustom : form.model;
    if (form.generation && form.generation !== OTHER && brandToUse && modelToUse) {
      vehiclesApi.engines(brandToUse, modelToUse, form.generation).then(setEngines);
    } else if (form.generation === OTHER) {
      setEngines([{ name: OTHER, hp: 0, kw: 0, fuel: 'Other', ecus: [] }]);
    } else {
      setEngines([]);
    }
    setForm(prev => ({ ...prev, engine: '', engineCustom: '', ecu: '', engineHp: '', engineKw: '' }));
    // eslint-disable-next-line
  }, [form.generation]);

  useEffect(() => {
    const found = engines.find(e => e.name === form.engine);
    if (found && found.name !== OTHER) {
      setEcus(found.ecus.length ? [...found.ecus, OTHER] : [OTHER]);
      setForm(prev => ({
        ...prev,
        engineHp: String(found.hp || ''),
        engineKw: String(found.kw || ''),
        ecu: found.ecus[0] || '',
      }));
    } else if (form.engine === OTHER) {
      setEcus([OTHER]);
      setForm(prev => ({ ...prev, engineHp: '', engineKw: '', ecu: '' }));
    } else {
      setEcus([]);
    }
    // eslint-disable-next-line
  }, [form.engine, engines]);

  const update = (k) => (e) => setForm(prev => ({ ...prev, [k]: e?.target ? e.target.value : e }));

  const baseCredits = (() => {
    const tt = tuningTypes.find(t => t.id === form.tuningType);
    return tt ? tt.credits : 0;
  })();
  const optionsCredits = form.tuningOptions.reduce((s, id) => {
    const o = additionalOptions.find(t => t.id === id);
    return s + (o ? o.credits : 0);
  }, 0);
  const totalCreditsFloat = baseCredits + optionsCredits;
  const totalCredits = Math.ceil(totalCreditsFloat);

  const toggleAdditional = (id) => {
    setForm(prev => ({
      ...prev,
      tuningOptions: prev.tuningOptions.includes(id)
        ? prev.tuningOptions.filter(o => o !== id)
        : [...prev.tuningOptions, id],
    }));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const addAttachment = (f) => {
    setAttachments(prev => [...prev, { file: f, title: f.name }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast({ title: 'Please select your file to modify', variant: 'destructive' }); return; }
    if (!form.tuningType) { toast({ title: 'Please select a tuning type', variant: 'destructive' }); return; }
    if (!form.acceptTerms || !form.acceptRefund) { toast({ title: 'Please accept terms and refund policy', variant: 'destructive' }); return; }
    if ((user.credits || 0) < totalCredits) { toast({ title: t('notEnoughCredits'), variant: 'destructive' }); return; }

    const resolve = (val, custom) => val === OTHER ? custom : val;
    const finalBrand = resolve(form.brand, form.brandCustom);
    const finalModel = resolve(form.model, form.modelCustom);
    const finalGen = resolve(form.generation, form.generationCustom);
    const finalEngine = resolve(form.engine, form.engineCustom);
    const finalEcu = resolve(form.ecu, form.ecuCustom);
    const finalReadMethod = form.readMethod === OTHER ? form.readMethodCustom : form.readMethod;

    setSubmitting(true);
    const tuningTypeName = tuningTypes.find(t => t.id === form.tuningType)?.name || '';
    const optionNames = form.tuningOptions.map(id => additionalOptions.find(t => t.id === id)?.name).filter(Boolean);
    const result = await submitFile({
      file,
      vehicle: `${form.vehicleType}: ${finalBrand} ${finalModel} ${finalGen} ${finalEngine}`.trim(),
      brand: finalBrand,
      model: finalModel,
      generation: finalGen,
      engine: finalEngine,
      engineHp: form.engineHp,
      engineKw: form.engineKw,
      year: form.year,
      gearbox: form.gearbox,
      licensePlate: form.licensePlate,
      vin: form.vin,
      octane: form.octane,
      ecu: finalEcu,
      toolType: form.toolType,
      readMethod: finalReadMethod,
      hardwareNumber: form.hardwareNumber,
      softwareNumber: form.softwareNumber,
      tuningType: tuningTypeName,
      tuningOptions: optionNames,
      modifiedParts: form.modifiedParts,
      modifiedPartsDetails: form.modifiedPartsDetails,
      timeFrame: form.timeFrame,
      credits: totalCredits,
      note: form.note,
    });
    setSubmitting(false);
    if (result.success) {
      toast({ title: 'File submitted!', description: 'Our engineers will process it shortly.' });
      navigate('/files');
    } else {
      toast({ title: 'Submission failed', description: result.error, variant: 'destructive' });
    }
  };

  const yearOptions = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => 2026 - i);
  const insufficient = (user?.credits || 0) < totalCredits;

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        {insufficient && totalCredits > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            You do not have sufficient credits to submit a new file service. <a href="/credits" className="underline font-semibold ml-1">Please buy more credits first</a>.
          </div>
        )}

        <div className="mb-6 bg-fct-orange text-white rounded p-4 flex items-center gap-3">
          <Clock className="w-6 h-6 flex-shrink-0" />
          <div>
            <div className="text-xs uppercase tracking-wide opacity-90">The estimated delivery time is</div>
            <div className="text-base font-semibold">5 minutes - 10 minutes</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Vehicle */}
          <Section title="Vehicle">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <Field label="Make">
                <CascadeSelect
                  value={form.brand}
                  customValue={form.brandCustom}
                  onChange={(v) => setForm(prev => ({ ...prev, brand: v }))}
                  onCustomChange={(v) => setForm(prev => ({ ...prev, brandCustom: v }))}
                  options={brands}
                />
              </Field>
              <Field label="Model">
                <CascadeSelect
                  value={form.model}
                  customValue={form.modelCustom}
                  onChange={(v) => setForm(prev => ({ ...prev, model: v }))}
                  onCustomChange={(v) => setForm(prev => ({ ...prev, modelCustom: v }))}
                  options={models}
                  disabled={!form.brand}
                />
              </Field>
              <Field label="Generation">
                <CascadeSelect
                  value={form.generation}
                  customValue={form.generationCustom}
                  onChange={(v) => setForm(prev => ({ ...prev, generation: v }))}
                  onCustomChange={(v) => setForm(prev => ({ ...prev, generationCustom: v }))}
                  options={generations}
                  disabled={!form.model}
                />
              </Field>
              <Field label="Engine">
                <CascadeSelect
                  value={form.engine}
                  customValue={form.engineCustom}
                  onChange={(v) => setForm(prev => ({ ...prev, engine: v }))}
                  onCustomChange={(v) => setForm(prev => ({ ...prev, engineCustom: v }))}
                  options={engines}
                  disabled={!form.generation}
                  getKey={(o) => o.name}
                  getLabel={(o) => o.name === OTHER ? OTHER : `${o.name} (${o.hp}hp / ${o.fuel})`}
                />
              </Field>
              <Field label="ECU">
                <CascadeSelect
                  value={form.ecu}
                  customValue={form.ecuCustom}
                  onChange={(v) => setForm(prev => ({ ...prev, ecu: v }))}
                  onCustomChange={(v) => setForm(prev => ({ ...prev, ecuCustom: v }))}
                  options={ecus}
                  disabled={!form.engine}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Field label="Vehicle type" optional>
                <Select value={form.vehicleType} onChange={update('vehicleType')}>
                  {tools.vehicleTypes.map(v => <option key={v} value={v}>{v}</option>)}
                </Select>
              </Field>
              <Field label="Engine HP" optional>
                <Input type="number" value={form.engineHp} onChange={update('engineHp')} placeholder="e.g. 184" />
              </Field>
              <Field label="Engine kW" optional>
                <Input type="number" value={form.engineKw} onChange={update('engineKw')} placeholder="e.g. 135" />
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Field label="Year">
                <Select value={form.year} onChange={update('year')} required>
                  <option value="">Make your choice</option>
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </Select>
              </Field>
              <Field label="Gearbox">
                <Select value={form.gearbox} onChange={update('gearbox')}>
                  <option value="">Make your choice</option>
                  {tools.gearboxes.map(g => <option key={g} value={g}>{g}</option>)}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Field label="License plate" optional>
                <Input value={form.licensePlate} onChange={update('licensePlate')} />
              </Field>
              <Field label="VIN" optional>
                <Input value={form.vin} onChange={update('vin')} maxLength={17} />
              </Field>
            </div>
            <Field label="Octane rating" optional>
              <Select value={form.octane} onChange={update('octane')}>
                <option value="">Make your choice</option>
                {tools.octaneRatings.map(o => <option key={o} value={o}>{o}</option>)}
              </Select>
            </Field>
          </Section>

          {/* ECU details */}
          <Section title="ECU details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Field label="Tool type">
                <Select value={form.toolType} onChange={update('toolType')} required>
                  <option value="">Make your choice</option>
                  {tools.toolTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Read method">
                <CascadeSelect
                  value={form.readMethod}
                  customValue={form.readMethodCustom}
                  onChange={(v) => setForm(prev => ({ ...prev, readMethod: v }))}
                  onCustomChange={(v) => setForm(prev => ({ ...prev, readMethodCustom: v }))}
                  options={tools.readMethods}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Hardware number" optional>
                <Input value={form.hardwareNumber} onChange={update('hardwareNumber')} />
              </Field>
              <Field label="Software number" optional>
                <Input value={form.softwareNumber} onChange={update('softwareNumber')} />
              </Field>
            </div>
          </Section>

          {/* Tuning type */}
          <Section title="Tuning type">
            <div className="space-y-2">
              {tuningTypes.map(tt => (
                <label key={tt.id} className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-50 ${form.tuningType === tt.id ? 'bg-orange-50' : ''}`}>
                  <input
                    type="radio"
                    name="tuningType"
                    checked={form.tuningType === tt.id}
                    onChange={() => setForm(prev => ({ ...prev, tuningType: tt.id }))}
                    className="accent-[#ED6E2E]"
                  />
                  <span className="text-sm text-fct-dark flex-1">
                    <strong>{tt.name}</strong>
                    {tt.description && <span className="text-fct-muted"> ({tt.description})</span>}
                    <span className="text-fct-muted ml-1">({tt.credits.toFixed(2)} credit{tt.credits !== 1 ? 's' : ''})</span>
                  </span>
                </label>
              ))}
            </div>
          </Section>

          {/* Optional tuning options */}
          {form.tuningType && (
            <Section title="Optional tuning options">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {additionalOptions.map(opt => (
                  <label key={opt.id} className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${form.tuningOptions.includes(opt.id) ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                    <input
                      type="checkbox"
                      checked={form.tuningOptions.includes(opt.id)}
                      onChange={() => toggleAdditional(opt.id)}
                      className="accent-[#ED6E2E]"
                    />
                    <span className="flex-1">{opt.name}</span>
                    <span className="text-xs text-fct-orange font-semibold">{opt.credits === 0 ? 'free' : `+${opt.credits.toFixed(2)}`}</span>
                  </label>
                ))}
              </div>
            </Section>
          )}

          {/* File to modify */}
          <Section title="File to modify">
            <p className="text-xs text-fct-muted mb-2">Only files smaller than 20 MB</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-fct-orange bg-orange-50' : file ? 'border-green-400 bg-green-50/30' : 'border-fct-orange/60 bg-orange-50/30 hover:border-fct-orange'}`}
            >
              <input ref={fileInputRef} type="file" className="hidden"
                accept=".bin,.ori,.frf,.kess,.sgo,.mpc,.zip,.hex"
                onChange={(e) => setFile(e.target.files[0])} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileUp className="w-8 h-8 text-fct-orange" />
                  <div>
                    <div className="font-medium text-fct-dark">{file.name}</div>
                    <div className="text-xs text-fct-muted">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="ml-2 p-1 hover:bg-white rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-fct-orange rounded flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-fct-dark">Drop your file(s) here or click to browse</span>
                </div>
              )}
            </div>

            {/* TCU file */}
            <div className="mt-4">
              <p className="text-xs text-fct-muted mb-2">TCU file (optional - only files smaller than 20 MB)</p>
              <input ref={tcuFileInputRef} type="file" className="hidden" onChange={(e) => setTcuFile(e.target.files[0])} />
              <button type="button" onClick={() => tcuFileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded p-4 text-sm flex items-center justify-center gap-2 ${tcuFile ? 'border-green-400 text-green-700 bg-green-50/30' : 'border-gray-300 hover:border-fct-orange text-fct-muted hover:text-fct-orange'}`}>
                {tcuFile ? <><FileUp className="w-4 h-4" />{tcuFile.name}</> : <><Plus className="w-4 h-4" />Drop TCU file here or click to browse</>}
              </button>
            </div>
          </Section>

          {/* Optional attachments */}
          <Section title="Optional attachments">
            <p className="text-xs text-fct-muted mb-2">Only files smaller than 20 MB</p>
            <input ref={attachInputRef} type="file" className="hidden" onChange={(e) => { if (e.target.files[0]) addAttachment(e.target.files[0]); e.target.value = ''; }} />
            {attachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {attachments.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 border border-gray-200 rounded">
                    <FileUp className="w-4 h-4 text-fct-muted" />
                    <input
                      value={a.title}
                      onChange={(e) => setAttachments(prev => prev.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                      placeholder="Title"
                      className="flex-1 px-2 py-1 border-b border-transparent hover:border-gray-200 text-sm focus:outline-none focus:border-fct-orange"
                    />
                    <span className="text-xs text-fct-muted">{(a.file.size / 1024).toFixed(1)} KB</span>
                    <button type="button" onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="p-1 hover:bg-gray-100 rounded">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => attachInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 hover:border-fct-orange rounded p-4 text-sm text-fct-muted hover:text-fct-orange flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />Drop your file(s) here or click to browse
            </button>
          </Section>

          {/* Modified parts */}
          <Section title="Modified parts">
            <Field label="Does the car have modified parts?">
              <Select value={form.modifiedParts} onChange={update('modifiedParts')}>
                <option value="">Make your choice</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Select>
            </Field>
            {form.modifiedParts === 'yes' && (
              <div className="mt-3">
                <p className="text-xs text-fct-muted mb-2">In order to provide you with the best possible service, please describe the modifications.</p>
                <Field label="Modified parts installed" optional>
                  <textarea
                    rows={3}
                    value={form.modifiedPartsDetails}
                    onChange={update('modifiedPartsDetails')}
                    placeholder="e.g. Downpipe, intake, intercooler, exhaust..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange"
                  />
                </Field>
              </div>
            )}
          </Section>

          {/* Service */}
          <Section title="Service">
            <Field label="Time frame">
              <Select value={form.timeFrame} onChange={update('timeFrame')}>
                <option value="">Make your choice</option>
                {tools.timeFrames.map(tf => <option key={tf.id} value={tf.id}>{tf.name}</option>)}
              </Select>
            </Field>
            <div className="mt-4">
              <Field label="Info" optional>
                <textarea
                  rows={4}
                  value={form.note}
                  onChange={update('note')}
                  placeholder="Any additional information for our engineers..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange"
                />
              </Field>
            </div>
          </Section>

          {/* Terms */}
          <div className="bg-white rounded shadow-sm border border-gray-100 p-5 mb-4 space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.acceptTerms} onChange={(e) => setForm(prev => ({ ...prev, acceptTerms: e.target.checked }))} className="accent-[#ED6E2E]" />
              I have read and agree to the <a href="#" className="text-fct-orange hover:underline">Terms and conditions</a>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.acceptRefund} onChange={(e) => setForm(prev => ({ ...prev, acceptRefund: e.target.checked }))} className="accent-[#ED6E2E]" />
              I have read and agree to the <a href="#" className="text-fct-orange hover:underline">Refund policy</a>
            </label>
          </div>

          {/* Submit bar */}
          <div className="bg-white rounded shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0">
            <div className="flex items-center gap-3">
              <Coins className="w-6 h-6 text-fct-orange" />
              <div>
                <div className="text-xs text-fct-muted">{t('totalCredits')}</div>
                <div className="text-2xl font-bold text-fct-dark">{totalCreditsFloat.toFixed(2)}</div>
              </div>
              {insufficient && totalCredits > 0 && (
                <div className="flex items-center gap-2 text-red-600 text-sm ml-4">
                  <AlertCircle className="w-4 h-4" />{t('notEnoughCredits')}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting || !file || insufficient || !form.tuningType}
              className="bg-fct-orange hover:bg-[#D45F25] text-white font-semibold px-6 py-3 rounded flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Uploading...' : t('submitFile')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default UploadFile;

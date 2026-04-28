// Mock data for Fast Chiptuningfiles dashboard

export const mockUser = {
  id: 'usr_001',
  email: 'demo@fast-chiptuningfiles.com',
  firstName: 'John',
  lastName: 'Doe',
  company: 'Demo Tuning B.V.',
  phone: '+31 6 12345678',
  country: 'Netherlands',
  vatNumber: 'NL123456789B01',
  credits: 25,
  language: 'en',
  createdAt: '2024-01-15T10:00:00Z',
};

export const mockFiles = [
  {
    id: 'file_001',
    fileName: 'BMW_F30_320d_original.bin',
    vehicle: 'BMW 3 Series F30 320d (2015)',
    ecu: 'Bosch EDC17C50',
    tuningOptions: ['Stage 1', 'EGR Off', 'DPF Off'],
    status: 'completed',
    credits: 8,
    uploadedAt: '2025-06-20T14:30:00Z',
    completedAt: '2025-06-20T14:35:00Z',
    note: 'Standard Stage 1 with EGR removal please.',
    tunedFile: 'BMW_F30_320d_stage1.bin',
  },
  {
    id: 'file_002',
    fileName: 'AUDI_A4_B8_20TDI.bin',
    vehicle: 'Audi A4 B8 2.0 TDI (2012)',
    ecu: 'Bosch EDC17C46',
    tuningOptions: ['Stage 1'],
    status: 'in_progress',
    credits: 6,
    uploadedAt: '2025-07-08T09:15:00Z',
    completedAt: null,
    note: '',
    tunedFile: null,
  },
  {
    id: 'file_003',
    fileName: 'VW_GOLF_GTI_MK7.bin',
    vehicle: 'Volkswagen Golf 7 GTI 2.0 TSI (2018)',
    ecu: 'Bosch MED17.5',
    tuningOptions: ['Stage 2', 'Pop & Bang'],
    status: 'pending',
    credits: 10,
    uploadedAt: '2025-07-09T16:45:00Z',
    completedAt: null,
    note: 'Customer has downpipe and intake.',
    tunedFile: null,
  },
];

export const mockBrands = [
  { id: 'audi', name: 'Audi', logo: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=80&h=80&fit=crop' },
  { id: 'bmw', name: 'BMW' },
  { id: 'mercedes', name: 'Mercedes-Benz' },
  { id: 'vw', name: 'Volkswagen' },
  { id: 'porsche', name: 'Porsche' },
  { id: 'toyota', name: 'Toyota' },
  { id: 'honda', name: 'Honda' },
  { id: 'ford', name: 'Ford' },
  { id: 'volvo', name: 'Volvo' },
  { id: 'opel', name: 'Opel' },
  { id: 'peugeot', name: 'Peugeot' },
  { id: 'renault', name: 'Renault' },
];

export const mockTuningSpecs = [
  { brand: 'BMW', model: '3 Series F30', engine: '320d 184hp', stage1Hp: '+35 hp', stage1Nm: '+70 Nm', credits: 8 },
  { brand: 'BMW', model: '3 Series F30', engine: '335i 306hp', stage1Hp: '+60 hp', stage1Nm: '+90 Nm', credits: 10 },
  { brand: 'Audi', model: 'A4 B8', engine: '2.0 TDI 143hp', stage1Hp: '+30 hp', stage1Nm: '+60 Nm', credits: 6 },
  { brand: 'Audi', model: 'A4 B8', engine: '2.0 TFSI 211hp', stage1Hp: '+45 hp', stage1Nm: '+80 Nm', credits: 8 },
  { brand: 'Volkswagen', model: 'Golf 7 GTI', engine: '2.0 TSI 220hp', stage1Hp: '+50 hp', stage1Nm: '+100 Nm', credits: 10 },
  { brand: 'Volkswagen', model: 'Passat B8', engine: '2.0 TDI 150hp', stage1Hp: '+35 hp', stage1Nm: '+75 Nm', credits: 7 },
  { brand: 'Mercedes-Benz', model: 'C-Class W205', engine: 'C220d 170hp', stage1Hp: '+40 hp', stage1Nm: '+80 Nm', credits: 9 },
  { brand: 'Mercedes-Benz', model: 'E-Class W213', engine: 'E350d 258hp', stage1Hp: '+55 hp', stage1Nm: '+90 Nm', credits: 11 },
  { brand: 'Porsche', model: '911 991', engine: 'Carrera 350hp', stage1Hp: '+40 hp', stage1Nm: '+50 Nm', credits: 14 },
  { brand: 'Ford', model: 'Focus ST', engine: '2.3 EcoBoost 280hp', stage1Hp: '+50 hp', stage1Nm: '+90 Nm', credits: 10 },
];

export const mockCreditPackages = [
  { id: 'pkg_5', credits: 5, price: 50, popular: false },
  { id: 'pkg_10', credits: 10, price: 95, popular: false, discount: '5%' },
  { id: 'pkg_25', credits: 25, price: 225, popular: true, discount: '10%' },
  { id: 'pkg_50', credits: 50, price: 425, popular: false, discount: '15%' },
  { id: 'pkg_100', credits: 100, price: 800, popular: false, discount: '20%' },
];

export const mockTransactions = [
  { id: 'tx_001', type: 'purchase', amount: 25, price: 225, date: '2025-06-15T10:00:00Z', method: 'Multisafepay' },
  { id: 'tx_002', type: 'usage', amount: -8, fileId: 'file_001', date: '2025-06-20T14:35:00Z' },
  { id: 'tx_003', type: 'usage', amount: -6, fileId: 'file_002', date: '2025-07-08T09:15:00Z' },
  { id: 'tx_004', type: 'usage', amount: -10, fileId: 'file_003', date: '2025-07-09T16:45:00Z' },
];

export const mockEcuOptions = [
  'Bosch EDC17C46', 'Bosch EDC17C50', 'Bosch EDC17C64', 'Bosch MED17.5',
  'Bosch MED17.1', 'Continental SID208', 'Delphi DCM3.5', 'Siemens SIM2K',
  'Marelli MJD8F3', 'Denso 175800', 'Visteon DCU102',
];

export const mockTuningServices = [
  { id: 'stage1', name: 'Stage 1', description: 'Performance increase using stock hardware', credits: 0 },
  { id: 'stage2', name: 'Stage 2', description: 'Requires hardware modifications (downpipe etc.)', credits: 2 },
  { id: 'egr', name: 'EGR Off', description: 'Disable Exhaust Gas Recirculation', credits: 1 },
  { id: 'dpf', name: 'DPF Off', description: 'Disable Diesel Particulate Filter', credits: 1 },
  { id: 'adblue', name: 'AdBlue Off', description: 'Disable AdBlue / SCR system', credits: 2 },
  { id: 'popbang', name: 'Pop & Bang', description: 'Aggressive exhaust crackles on overrun', credits: 1 },
  { id: 'hardcut', name: 'Hardcut Limiter', description: 'Hard rev cut for sportier feel', credits: 1 },
  { id: 'speed', name: 'Speed Limiter Off', description: 'Remove top speed limiter', credits: 0 },
  { id: 'startstop', name: 'Start/Stop Off', description: 'Disable automatic start/stop', credits: 0 },
];

export const mockNews = [
  { id: 1, title: 'New ECU support added: Bosch EDC17C81', date: '2025-07-01', body: 'We have added full read/write support for Bosch EDC17C81 ECUs found in newer VAG vehicles.' },
  { id: 2, title: 'Summer credit promotion: 20% off on 100 credit pack', date: '2025-06-15', body: 'For a limited time, get 20% extra credits when purchasing the 100-credit package.' },
  { id: 3, title: 'Faster turnaround time achieved', date: '2025-05-20', body: 'Our average file processing time is now under 5 minutes during business hours.' },
];

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { vehiclesApi } from '../api/client';
import { Search, TrendingUp, Coins, Loader2, ChevronDown, ChevronRight, Car } from 'lucide-react';

export const TuningSpecs = () => {
  const { t } = useApp();
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [models, setModels] = useState([]);
  const [expandedModel, setExpandedModel] = useState(null);
  const [generations, setGenerations] = useState({});
  const [enginesByGen, setEnginesByGen] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    vehiclesApi.brands().then(setBrands).catch(() => {});
  }, []);

  const filteredBrands = brands.filter(b =>
    !search || b.toLowerCase().includes(search.toLowerCase())
  );

  const selectBrand = async (brand) => {
    setSelectedBrand(brand);
    setExpandedModel(null);
    setGenerations({});
    setEnginesByGen({});
    setLoading(true);
    try {
      const m = await vehiclesApi.models(brand);
      setModels(m.filter(x => x !== 'Otherwise, namely'));
    } catch {}
    setLoading(false);
  };

  const expandModel = async (model) => {
    if (expandedModel === model) {
      setExpandedModel(null);
      return;
    }
    setExpandedModel(model);
    if (!generations[model]) {
      try {
        const gens = await vehiclesApi.generations(selectedBrand, model);
        const filtered = gens.filter(g => g !== 'Otherwise, namely');
        setGenerations(prev => ({ ...prev, [model]: filtered }));
        // Load engines for each generation
        for (const gen of filtered) {
          const engs = await vehiclesApi.engines(selectedBrand, model, gen);
          setEnginesByGen(prev => ({ ...prev, [`${model}::${gen}`]: engs.filter(e => e.name !== 'Otherwise, namely') }));
        }
      } catch {}
    }
  };

  // Estimated tuning gains (heuristics)
  const estimateGain = (engine) => {
    const fuel = engine.fuel;
    const hp = engine.hp || 0;
    if (fuel === 'Diesel') return { hp: `+${Math.round(hp * 0.20)}`, nm: `+${Math.round(hp * 1.5)} Nm`, credits: hp > 250 ? 10 : hp > 150 ? 8 : 6 };
    if (fuel === 'Petrol') return { hp: `+${Math.round(hp * 0.15)}`, nm: `+${Math.round(hp * 1.2)} Nm`, credits: hp > 300 ? 12 : hp > 200 ? 10 : 8 };
    if (fuel === 'Hybrid') return { hp: `+${Math.round(hp * 0.10)}`, nm: `+${Math.round(hp * 1.0)} Nm`, credits: 10 };
    return { hp: 'N/A', nm: 'N/A', credits: 0 };
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <h1 className="text-2xl lg:text-3xl font-bold text-fct-dark mb-2">{t('tuningSpecs')}</h1>
        <p className="text-fct-muted mb-6">Browse our database to see expected gains for your vehicle.</p>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Brand sidebar */}
          <div className="bg-white rounded shadow-sm border border-gray-100 lg:max-h-[700px] lg:overflow-y-auto">
            <div className="p-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fct-muted" />
                <input
                  placeholder="Search brand..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-fct-orange focus:ring-1 focus:ring-fct-orange"
                />
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredBrands.map(brand => (
                <button
                  key={brand}
                  onClick={() => selectBrand(brand)}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 ${selectedBrand === brand ? 'bg-orange-50 text-fct-orange font-semibold' : 'text-fct-dark'}`}
                >
                  <Car className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{brand}</span>
                  {selectedBrand === brand && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-3 bg-white rounded shadow-sm border border-gray-100 min-h-[400px]">
            {!selectedBrand && (
              <div className="p-12 text-center">
                <Car className="w-12 h-12 text-fct-muted mx-auto mb-3" />
                <p className="text-fct-muted">Select a brand from the list to see tuning specs.</p>
              </div>
            )}
            {loading && <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-fct-orange mx-auto" /></div>}
            {selectedBrand && !loading && (
              <div>
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="font-semibold text-fct-dark text-lg">{selectedBrand}</h2>
                  <p className="text-xs text-fct-muted">{models.length} model{models.length !== 1 ? 's' : ''} available</p>
                </div>
                {models.length === 0 ? (
                  <div className="p-8 text-center text-sm text-fct-muted">
                    No detailed specs for this brand yet. Use "Otherwise, namely" when uploading a file.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {models.map(model => (
                      <div key={model}>
                        <button
                          onClick={() => expandModel(model)}
                          className="w-full px-6 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                        >
                          <span className="font-medium text-sm text-fct-dark">{model}</span>
                          <ChevronDown className={`w-4 h-4 text-fct-muted transition-transform ${expandedModel === model ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedModel === model && (
                          <div className="px-6 pb-4 bg-gray-50/50">
                            {(generations[model] || []).map(gen => (
                              <div key={gen} className="mb-4 last:mb-0">
                                <h3 className="text-xs font-semibold text-fct-muted uppercase tracking-wide mb-2 mt-2">{gen}</h3>
                                <div className="bg-white rounded border border-gray-100 overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="text-left text-[10px] font-semibold text-fct-muted uppercase border-b border-gray-100">
                                        <th className="px-3 py-2">Engine</th>
                                        <th className="px-3 py-2">Stock</th>
                                        <th className="px-3 py-2">Stage 1 HP</th>
                                        <th className="px-3 py-2">Stage 1 Nm</th>
                                        <th className="px-3 py-2">Credits</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(enginesByGen[`${model}::${gen}`] || []).map((eng, i) => {
                                        const g = estimateGain(eng);
                                        return (
                                          <tr key={i} className="border-t border-gray-100 hover:bg-orange-50/30">
                                            <td className="px-3 py-2 font-medium">{eng.name}</td>
                                            <td className="px-3 py-2 text-fct-muted">{eng.hp} hp / {eng.kw} kW</td>
                                            <td className="px-3 py-2"><span className="inline-flex items-center gap-1 text-green-700 font-semibold"><TrendingUp className="w-3 h-3" />{g.hp}</span></td>
                                            <td className="px-3 py-2 text-green-700 font-semibold">{g.nm}</td>
                                            <td className="px-3 py-2"><span className="inline-flex items-center gap-1 text-fct-orange font-semibold"><Coins className="w-3 h-3" />{g.credits}</span></td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ))}
                            {(!generations[model] || generations[model].length === 0) && (
                              <div className="text-xs text-fct-muted italic py-2">Loading...</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TuningSpecs;

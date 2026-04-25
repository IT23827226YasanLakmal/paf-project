import React, { useState, useEffect } from 'react';
import {
  Building2, Thermometer, Users, Zap, Shield, Sparkles, BookOpen,
  MapPin, CheckCircle, AlertCircle, XCircle, Layout, ArrowRight,
  Wind, Lightbulb, VolumeX, Eye
} from 'lucide-react';

const SpaceCadView = ({ resources = [], onBookResource, isAdmin }) => {
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [activeFloor, setActiveFloor] = useState('1'); 
  const [simulationMetrics, setSimulationMetrics] = useState({
    temp: 21.5,
    humidity: 45,
    occupancyLoad: 0,
    noiseLevel: 32
  });

  // Map resources to custom high-fidelity layouts
  const spaces = resources.map((r, index) => {
    const layouts = [
      { id: 'LH-101', x: '8%', y: '12%', w: '28%', h: '34%', defaultTemp: 21.2, defaultHumidity: 44, noise: 45, light: 85 },
      { id: 'LH-102', x: '40%', y: '12%', w: '24%', h: '34%', defaultTemp: 22.0, defaultHumidity: 41, noise: 50, light: 90 },
      { id: 'LAB-01', x: '68%', y: '12%', w: '26%', h: '50%', defaultTemp: 19.8, defaultHumidity: 48, noise: 30, light: 75 },
      { id: 'CONF-A', x: '8%', y: '52%', w: '32%', h: '38%', defaultTemp: 23.1, defaultHumidity: 40, noise: 25, light: 80 },
      { id: 'STUDY-1', x: '45%', y: '52%', w: '18%', h: '38%', defaultTemp: 20.5, defaultHumidity: 42, noise: 15, light: 65 },
    ];
    const layout = layouts[index % layouts.length];
    return {
      ...r,
      cadId: layout.id,
      x: layout.x,
      y: layout.y,
      w: layout.w,
      h: layout.h,
      baseTemp: layout.defaultTemp,
      baseHumidity: layout.defaultHumidity,
      baseNoise: layout.noise,
      baseLight: layout.light
    };
  });

  const handleSpaceClick = (space) => {
    setSelectedSpace(space);
    // Trigger live randomized environment simulation
    setSimulationMetrics({
      temp: (space.baseTemp + (Math.random() * 1.2 - 0.6)).toFixed(1),
      humidity: Math.floor(space.baseHumidity + (Math.random() * 6 - 3)),
      occupancyLoad: Math.floor(Math.random() * 35 + 20),
      noiseLevel: Math.floor(space.baseNoise + (Math.random() * 10 - 5))
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-canvas text-primary animate-in fade-in duration-500 mt-6">
      
      {/* ── Floorplan Blueprint (2/3rds width) ── */}
      <div className="lg:col-span-2 flex flex-col gap-5">
        
        {/* Command Toggle Panel */}
        <div className="flex justify-between items-center bg-surface border border-subtle p-4 rounded-3xl shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-primary block">Blueprint Mapping</span>
              <span className="text-[10px] text-muted font-medium">Interactive environmental tracking node</span>
            </div>
          </div>

          <div className="flex bg-raised border border-subtle p-1 rounded-xl">
            {['1', '2'].map(floor => (
              <button
                key={floor}
                onClick={() => {
                  setActiveFloor(floor);
                  setSelectedSpace(null);
                }}
                className={`px-5 py-2 text-xs font-black rounded-lg cursor-pointer transition-all border-none flex items-center gap-1.5 ${
                  activeFloor === floor
                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                    : 'text-muted hover:text-primary bg-transparent'
                }`}
              >
                Floor {floor}
              </button>
            ))}
          </div>
        </div>

        {/* CAD Render Area */}
        <div className="relative aspect-[16/10] bg-[#0b0c0e] border border-[#1f2023] rounded-[32px] overflow-hidden shadow-2xl group flex items-center justify-center">
          
          {/* Blueprint Grid Lines */}
          <div 
            className="absolute inset-0 opacity-[0.04]" 
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px, 48px 48px, 48px 48px'
            }}
          />

          {/* Map Frame */}
          <div className="absolute inset-6 border border-[#26272b] rounded-2xl overflow-hidden flex items-center justify-center bg-[#0e0f12]/80">
            {activeFloor === '1' ? (
              <div className="relative w-full h-full p-4">
                
                {/* Structural Outer Boundary walls */}
                <div className="absolute inset-4 border border-accent/10 rounded-2xl bg-accent/[0.01] pointer-events-none" />

                {/* Nodes rendering */}
                {spaces.map(space => {
                  const isSelected = selectedSpace?.id === space.id;
                  const isOutOfOrder = space.status === 'OUT_OF_ORDER';
                  const isMaintenance = space.status === 'MAINTENANCE';

                  return (
                    <div
                      key={space.id}
                      onClick={() => handleSpaceClick(space)}
                      className={`absolute rounded-2xl border transition-all duration-500 cursor-pointer flex flex-col justify-between p-4 select-none ${
                        isSelected 
                          ? 'bg-accent/15 border-accent shadow-[0_0_25px_rgba(59,130,246,0.35)] z-20 scale-[1.01]' 
                          : isOutOfOrder 
                          ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/60 shadow-lg' 
                          : isMaintenance 
                          ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60 shadow-lg'
                          : 'bg-surface/5 border-[#282a2e] hover:bg-surface/10 hover:border-accent/40 hover:shadow-xl'
                      }`}
                      style={{
                        left: space.x,
                        top: space.y,
                        width: space.w,
                        height: space.h
                      }}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black tracking-widest uppercase ${
                            isOutOfOrder ? 'text-red-400' : isMaintenance ? 'text-amber-400' : 'text-accent'
                          }`}>
                            {space.cadId}
                          </span>
                          <span className="text-[9px] font-bold text-white/30">{space.baseTemp.toFixed(0)}°C</span>
                        </div>
                        <span className="text-sm font-black text-white tracking-tight mt-1 truncate">{space.name}</span>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                        <span className="text-[10px] font-bold text-white/40 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-accent/70" /> {space.capacity || '45'}
                        </span>
                        
                        {/* Status beacon indicator */}
                        <div className="relative flex items-center justify-center">
                          <div className={`absolute w-3 h-3 rounded-full opacity-40 animate-ping ${
                            isOutOfOrder ? 'bg-red-500' : isMaintenance ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            isOutOfOrder ? 'bg-red-500' : isMaintenance ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-muted select-none">
                <div className="w-16 h-16 bg-surface rounded-3xl flex items-center justify-center shadow-md">
                  <Building2 className="w-8 h-8 opacity-40 text-accent" />
                </div>
                <p className="text-sm font-black text-primary">Spatial Layout Unavailable</p>
                <p className="text-xs text-muted max-w-xs text-center">Floor 2 architecture schemas are waiting administrative mapping routines.</p>
              </div>
            )}
          </div>

          <div className="absolute bottom-6 left-6 bg-[#16171a]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-[10px] text-white/70 font-semibold shadow-xl flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Live Space Operations Telemetry active.
          </div>
        </div>
      </div>

      {/* ── Environmental Data Hub (1/3rd width) ── */}
      <div className="flex flex-col gap-5">
        {selectedSpace ? (
          <div className="bg-surface border border-subtle rounded-[32px] p-6 shadow-xl hover:border-accent/40 transition-all duration-300 flex flex-col gap-6 relative group overflow-hidden animate-in slide-in-from-right-5">
            
            {/* Space Header Tag */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-accent/10 text-accent uppercase tracking-widest border border-accent/20">
                {selectedSpace.type}
              </span>
              <div className="flex items-center gap-2 px-3 py-1 bg-surface border border-subtle rounded-xl shadow-sm">
                <div className={`w-2 h-2 rounded-full ${
                  selectedSpace.status === 'ACTIVE' ? 'bg-emerald-500' :
                  selectedSpace.status === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <span className="text-[10px] font-black uppercase tracking-wide text-primary">
                  {selectedSpace.status}
                </span>
              </div>
            </div>

            {/* Title block */}
            <div>
              <h3 className="text-2xl font-black tracking-tight text-primary leading-none">{selectedSpace.name}</h3>
              <p className="text-xs font-semibold text-muted flex items-center gap-1.5 mt-2">
                <MapPin className="w-4 h-4 text-accent" /> {selectedSpace.location || 'Central Campus'}
              </p>
            </div>

            {/* Smart Sensor Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Temp Sensor */}
              <div className="bg-raised/60 border border-subtle p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-black uppercase text-muted flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-accent" /> Temperature
                </span>
                <div className="mt-3">
                  <span className="text-2xl font-black text-primary tracking-tight">{simulationMetrics.temp}°C</span>
                  <div className="w-full bg-canvas h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-accent h-full rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>

              {/* Humidity */}
              <div className="bg-raised/60 border border-subtle p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-black uppercase text-muted flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-sky-500" /> Humidity
                </span>
                <div className="mt-3">
                  <span className="text-2xl font-black text-primary tracking-tight">{simulationMetrics.humidity}%</span>
                  <div className="w-full bg-canvas h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: `${simulationMetrics.humidity}%` }} />
                  </div>
                </div>
              </div>

              {/* Noise Index */}
              <div className="bg-raised/60 border border-subtle p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-black uppercase text-muted flex items-center gap-1.5">
                  <VolumeX className="w-4 h-4 text-amber-500" /> Noise Level
                </span>
                <div className="mt-3">
                  <span className="text-xl font-black text-primary tracking-tight">{simulationMetrics.noiseLevel} dB</span>
                  <span className="text-[9px] font-bold text-muted block mt-1 uppercase tracking-wide">
                    {simulationMetrics.noiseLevel > 40 ? 'Moderate' : 'Whisper Quiet'}
                  </span>
                </div>
              </div>

              {/* Light state */}
              <div className="bg-raised/60 border border-subtle p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-black uppercase text-muted flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-yellow-500" /> Illumination
                </span>
                <div className="mt-3">
                  <span className="text-xl font-black text-primary tracking-tight">{selectedSpace.baseLight || 80} lx</span>
                  <span className="text-[9px] font-bold text-emerald-500 block mt-1 uppercase tracking-wide">Standard</span>
                </div>
              </div>
            </div>

            {/* Occupancy metrics */}
            <div className="bg-raised/60 border border-subtle p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-primary">Live Crowd Density</span>
              </div>
              <span className="text-sm font-black text-accent">{simulationMetrics.occupancyLoad}% utilized</span>
            </div>

            {/* Booking action */}
            {selectedSpace.status === 'ACTIVE' ? (
              <button
                onClick={() => onBookResource(selectedSpace)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-accent hover:bg-accent-hover font-black text-sm text-white rounded-2xl shadow-lg transition-all cursor-pointer border-none mt-2 group"
              >
                <BookOpen className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Reserve Selection
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <div className="w-full text-center p-3 text-xs font-bold bg-canvas border border-subtle text-muted rounded-2xl mt-2 select-none flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-muted/50" /> Allocation offline
              </div>
            )}
          </div>
        ) : (
          <div className="bg-surface border border-dashed border-subtle rounded-[32px] p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[300px]">
            <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-base font-black text-primary">Telemetry Matrix Pending</h4>
            <p className="text-xs text-muted max-w-xs leading-relaxed">
              Click any designated spatial floor sector to initialize interactive Google-grade workspace modeling.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceCadView;

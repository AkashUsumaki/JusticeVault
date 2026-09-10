import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Camera,
  Radio,
  FileText,
  Maximize2,
  Navigation,
  Globe,
  Crosshair,
  Filter,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { EvidenceItem, FIRDetails } from '../types';

// Controller component to dynamically pan/zoom and resize Leaflet map
interface MapControllerProps {
  center: [number, number];
  zoom: number;
}

const MapController: React.FC<MapControllerProps> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
    // Invalidate size in case tab or flexbox layout shifted
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);

  return null;
};

// Custom Leaflet DivIcon generator for Crime Scene and Evidence types
const createCustomIcon = (type: string, category?: string) => {
  let bgColor = '#059669'; // Emerald default
  let borderColor = '#34d399';
  let labelIcon = '📍';

  if (type === 'CRIME_SCENE') {
    bgColor = '#DC2626'; // Red
    borderColor = '#f87171';
    labelIcon = '🚨';
  } else {
    switch (category) {
      case 'IMAGE':
      case 'VIDEO':
        bgColor = '#2563EB'; // Blue
        borderColor = '#60a5fa';
        labelIcon = '📸';
        break;
      case 'DIGITAL_RECORD':
        bgColor = '#D97706'; // Amber
        borderColor = '#fbbf24';
        labelIcon = '📡';
        break;
      case 'DOCUMENT':
      case 'FORENSIC_REPORT':
        bgColor = '#7C3AED'; // Purple
        borderColor = '#c084fc';
        labelIcon = '📑';
        break;
      default:
        bgColor = '#059669';
        borderColor = '#34d399';
        labelIcon = '⚖️';
    }
  }

  const isCrime = type === 'CRIME_SCENE';
  const size = isCrime ? 38 : 32;

  return L.divIcon({
    className: 'custom-osm-marker-wrapper',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${size}px;
        height: ${size}px;
      ">
        ${isCrime ? `
          <div style="
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background-color: rgba(220, 38, 38, 0.4);
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ''}
        <div style="
          position: relative;
          background: ${bgColor};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 2px solid ${borderColor};
          box-shadow: 0 4px 12px rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isCrime ? '16px' : '14px'};
          cursor: pointer;
        ">
          ${labelIcon}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 6)],
  });
};

export interface OSMEvidenceMapProps {
  selectedCase: FIRDetails | null;
  evidenceList: EvidenceItem[];
  onSelectEvidence?: (evidence: EvidenceItem) => void;
  onSelectLocation?: (lat: number, lng: number, address: string) => void;
}

export const OSMEvidenceMap: React.FC<OSMEvidenceMapProps> = ({
  selectedCase,
  evidenceList,
  onSelectEvidence,
  onSelectLocation,
}) => {
  // Tile layer style: Dark Tactical (CartoDB Dark via OSM data), Standard OSM, or Topo OSM
  const [tileLayerType, setTileLayerType] = useState<'osm_dark' | 'osm_standard' | 'osm_topo'>('osm_dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showGeofence, setShowGeofence] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(14);

  // Default coordinate: Chennai T. Nagar (from case or fallback)
  const defaultCenter: [number, number] = selectedCase?.gpsCoordinates
    ? [selectedCase.gpsCoordinates.lat, selectedCase.gpsCoordinates.lng]
    : [13.0418, 80.2342];

  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [focusedMarkerId, setFocusedMarkerId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCase?.gpsCoordinates) {
      setMapCenter([selectedCase.gpsCoordinates.lat, selectedCase.gpsCoordinates.lng]);
    }
  }, [selectedCase]);

  // Aggregate markers: Primary crime scene + Geo-tagged physical/digital evidence
  interface MapMarkerItem {
    id: string;
    title: string;
    category: string;
    lat: number;
    lng: number;
    address: string;
    type: 'CRIME_SCENE' | 'EVIDENCE';
    evidenceItem?: EvidenceItem;
  }

  const allMarkers: MapMarkerItem[] = [];

  if (selectedCase?.gpsCoordinates) {
    allMarkers.push({
      id: 'CRIME_SCENE_' + selectedCase.caseId,
      title: `Crime Scene: ${selectedCase.incidentLocation}`,
      category: 'PRIMARY_SCENE',
      lat: selectedCase.gpsCoordinates.lat,
      lng: selectedCase.gpsCoordinates.lng,
      address: selectedCase.incidentLocation,
      type: 'CRIME_SCENE',
    });
  }

  evidenceList.forEach((ev) => {
    if (ev.gpsLocation?.latitude && ev.gpsLocation?.longitude) {
      allMarkers.push({
        id: ev.id,
        title: ev.title,
        category: ev.category,
        lat: ev.gpsLocation.latitude,
        lng: ev.gpsLocation.longitude,
        address: ev.gpsLocation.addressName || 'Geo-tagged field seizure',
        type: 'EVIDENCE',
        evidenceItem: ev,
      });
    }
  });

  // Filter markers based on category and search query
  const filteredMarkers = allMarkers.filter((m) => {
    if (selectedCategory !== 'ALL') {
      if (selectedCategory === 'CRIME_SCENE' && m.type !== 'CRIME_SCENE') return false;
      if (selectedCategory !== 'CRIME_SCENE' && m.category !== selectedCategory) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        m.title.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Tile layer configurations using OpenStreetMap data
  const tileLayers = {
    osm_dark: {
      name: 'OSM Dark Tactical',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
    },
    osm_standard: {
      name: 'OpenStreetMap Standard',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    },
    osm_topo: {
      name: 'OSM Topo',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      maxZoom: 17,
    },
  };

  const currentLayer = tileLayers[tileLayerType];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top Map Header & Controls */}
      <div className="p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              OpenStreetMap Geospatial Evidence Radar
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                No API Key Required (100% Free OSM)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Leaflet spatial engine plotting crime scenes, ATM CCTV kiosks, CDR towers, and seized vehicle GPS coordinates
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tile Layer Switcher */}
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setTileLayerType('osm_dark')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                tileLayerType === 'osm_dark' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              OSM Dark
            </button>
            <button
              onClick={() => setTileLayerType('osm_standard')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                tileLayerType === 'osm_standard' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              OSM Standard
            </button>
            <button
              onClick={() => setTileLayerType('osm_topo')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                tileLayerType === 'osm_topo' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              OSM Topo
            </button>
          </div>

          {/* 500m Geofence Radius Toggle */}
          <button
            onClick={() => setShowGeofence(!showGeofence)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              showGeofence
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle 500m Crime Scene Forensic Radius"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>500m Perimeter</span>
          </button>
        </div>
      </div>

      {/* Main Body: Sidebar Roster + Interactive Leaflet Map */}
      <div className="flex-1 flex flex-col md:flex-row relative min-h-[500px]">
        {/* Left Side: Search, Filter, and Marker List (collapsible on small screens) */}
        <div className="w-full md:w-80 bg-slate-900/95 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col z-10 shrink-0">
          {/* Search & Category Filter */}
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pins or locations..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {['ALL', 'CRIME_SCENE', 'IMAGE', 'DIGITAL_RECORD', 'DOCUMENT'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 rounded whitespace-nowrap font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat === 'ALL' ? 'All (Total)' : cat === 'CRIME_SCENE' ? 'Crime Scene' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Roster of Geo-tagged Pins */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-56 md:max-h-none">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 py-0.5 flex items-center justify-between">
              <span>Plotted Locations ({filteredMarkers.length})</span>
              <span className="text-emerald-400">OSM Live</span>
            </div>

            {filteredMarkers.map((m) => {
              const isSelected = focusedMarkerId === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setMapCenter([m.lat, m.lng]);
                    setZoomLevel(16);
                    setFocusedMarkerId(m.id);
                    if (onSelectLocation) {
                      onSelectLocation(m.lat, m.lng, m.address);
                    }
                  }}
                  className={`p-2.5 rounded-lg border transition cursor-pointer text-xs space-y-1 ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500/60 shadow-md'
                      : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1.5 truncate max-w-[170px]">
                      <span>{m.type === 'CRIME_SCENE' ? '🚨' : '📍'}</span>
                      {m.title}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                        m.type === 'CRIME_SCENE'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {m.type === 'CRIME_SCENE' ? 'Scene' : m.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1">{m.address}</p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                    <span>
                      {m.lat.toFixed(4)}°, {m.lng.toFixed(4)}°
                    </span>
                    {m.evidenceItem && onSelectEvidence && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvidence(m.evidenceItem!);
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                      >
                        Inspect Vault
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredMarkers.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-xs">
                No location matches found.
              </div>
            )}
          </div>

          {/* Quick Stats Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              OpenStreetMap Leaflet Engine
            </span>
            <span className="text-emerald-400 font-medium">Active</span>
          </div>
        </div>

        {/* Right Side: Leaflet Interactive Map Container */}
        <div className="flex-1 relative w-full h-[400px] md:h-auto">
          <MapContainer
            center={mapCenter}
            zoom={zoomLevel}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
            style={{ height: '100%', width: '100%', minHeight: '480px', background: '#020617' }}
          >
            <MapController center={mapCenter} zoom={zoomLevel} />

            {/* Free OpenStreetMap / CartoDB Tile Layer (No API Key Required) */}
            <TileLayer
              url={currentLayer.url}
              attribution={currentLayer.attribution}
              maxZoom={currentLayer.maxZoom}
            />

            {/* Crime Scene 500m Investigation Perimeter Circle */}
            {showGeofence && selectedCase?.gpsCoordinates && (
              <Circle
                center={[selectedCase.gpsCoordinates.lat, selectedCase.gpsCoordinates.lng]}
                radius={500}
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#dc2626',
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: '6, 6',
                }}
              >
                <Popup>
                  <div className="p-1 text-slate-900 text-xs">
                    <strong className="block text-red-600 font-semibold mb-1">
                      Forensic Geofence: 500m Radius
                    </strong>
                    <p className="text-[11px] text-slate-700">
                      Standard police cordoned perimeter around {selectedCase.incidentLocation} under BNSS Section 105.
                    </p>
                  </div>
                </Popup>
              </Circle>
            )}

            {/* Plotted Markers */}
            {filteredMarkers.map((m) => {
              const customIcon = createCustomIcon(m.type, m.category);
              return (
                <Marker
                  key={m.id}
                  position={[m.lat, m.lng]}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => {
                      setMapCenter([m.lat, m.lng]);
                      setFocusedMarkerId(m.id);
                      if (onSelectLocation) {
                        onSelectLocation(m.lat, m.lng, m.address);
                      }
                    },
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-2 max-w-xs text-slate-900 text-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            m.type === 'CRIME_SCENE' ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          {m.type === 'CRIME_SCENE' ? 'Primary Crime Scene' : m.category}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-950 leading-snug mb-1">
                        {m.title}
                      </h4>

                      <p className="text-[11px] text-slate-700 mb-2 leading-relaxed">
                        {m.address}
                      </p>

                      <div className="text-[10px] font-mono bg-slate-100 p-1.5 rounded text-slate-800 mb-2 border border-slate-200">
                        Coordinates: {m.lat.toFixed(6)}, {m.lng.toFixed(6)}
                      </div>

                      {m.evidenceItem && onSelectEvidence && (
                        <button
                          onClick={() => onSelectEvidence(m.evidenceItem!)}
                          className="w-full text-center py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow transition"
                        >
                          Inspect File & Hash in Vault
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Floating HUD Indicator on Map */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
            <div className="pointer-events-auto bg-slate-950/85 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 flex items-center gap-3 shadow-lg">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Center: {mapCenter[0].toFixed(4)}° N, {mapCenter[1].toFixed(4)}° E
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-400">
                {filteredMarkers.length} Pins Bound
              </span>
            </div>

            <div className="pointer-events-auto bg-slate-950/85 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>OpenStreetMap &copy; Contributors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

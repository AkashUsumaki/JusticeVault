import React, { useState } from 'react';
import { 
  Network, 
  Clock, 
  User, 
  Smartphone, 
  CreditCard, 
  Car, 
  Building2, 
  FileText, 
  Filter, 
  Info, 
  ZoomIn, 
  ZoomOut, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { EntityNode, FIRDetails, LanguageCode, RelationshipEdge } from '../types';
import { mockRelationshipGraph } from '../data/mockData';
import { translations } from '../translations/i18n';

interface RelationshipGraphProps {
  caseItem: FIRDetails;
  currentLang: LanguageCode;
}

export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({
  caseItem,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<EntityNode | null>(mockRelationshipGraph.nodes[0]);
  const [activeTab, setActiveTab] = useState<'GRAPH' | 'TIMELINE'>('GRAPH');

  const nodes = mockRelationshipGraph.nodes;
  const edges = mockRelationshipGraph.edges;

  const filteredNodes = nodes.filter((n) => {
    if (selectedType === 'ALL') return true;
    return n.type === selectedType;
  });

  const getNodeIcon = (type: EntityNode['type']) => {
    switch (type) {
      case 'PERSON':
        return <User className="w-4 h-4 text-blue-400" />;
      case 'PHONE':
        return <Smartphone className="w-4 h-4 text-purple-400" />;
      case 'BANK_ACCOUNT':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'VEHICLE':
        return <Car className="w-4 h-4 text-amber-400" />;
      case 'LOCATION':
        return <Building2 className="w-4 h-4 text-red-400" />;
      case 'EVIDENCE_ITEM':
        return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  const getNodeBg = (type: EntityNode['type'], isSelected: boolean) => {
    if (isSelected) {
      return 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.25)]';
    }
    switch (type) {
      case 'PERSON':
        return 'bg-[#0a0c0f] border-blue-500/20 hover:border-blue-400/50';
      case 'PHONE':
        return 'bg-[#0a0c0f] border-purple-500/20 hover:border-purple-400/50';
      case 'BANK_ACCOUNT':
        return 'bg-[#0a0c0f] border-emerald-500/20 hover:border-emerald-400/50';
      case 'VEHICLE':
        return 'bg-[#0a0c0f] border-amber-500/20 hover:border-amber-400/50';
      case 'LOCATION':
        return 'bg-[#0a0c0f] border-red-500/20 hover:border-red-400/50';
      case 'EVIDENCE_ITEM':
        return 'bg-[#0a0c0f] border-blue-500/20 hover:border-blue-400/50';
    }
  };

  // Connected edges for selected node
  const connectedEdges = selectedNode
    ? edges.filter((e) => e.sourceNodeId === selectedNode.id || e.targetNodeId === selectedNode.id)
    : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{t.relationshipGraph}</h1>
              <p className="text-xs text-zinc-400">
                Entity Link Analysis, Communication Records, Financial Mules & Event Timeline
              </p>
            </div>
          </div>
        </div>

        {/* View switcher */}
        <div className="flex items-center bg-[#0a0c0f] border border-zinc-800 rounded p-1">
          <button
            onClick={() => setActiveTab('GRAPH')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'GRAPH' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Entity Network</span>
          </button>
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'TIMELINE' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Crime Timeline</span>
          </button>
        </div>
      </div>

      {activeTab === 'GRAPH' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Visual Network Canvas */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['ALL', 'PERSON', 'PHONE', 'BANK_ACCOUNT', 'VEHICLE', 'LOCATION', 'EVIDENCE_ITEM'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition ${
                    selectedType === type
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-[#0a0c0f] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {type === 'ALL' ? 'All Entities' : type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Interactive Network Diagram Surface */}
            <div className="p-6 rounded-lg bg-zinc-950 border border-zinc-800/80 shadow-inner relative min-h-[460px] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3.5 rounded border text-left transition flex flex-col justify-between ${getNodeBg(
                        node.type,
                        isSelected
                      )}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                          {getNodeIcon(node.type)}
                        </div>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800/50">
                          {node.type}
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <p className="text-xs font-bold text-white truncate">{node.label}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{node.id}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Edge Connections List Overlay */}
              <div className="mt-6 pt-4 border-t border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  Key Identified Forensic Relationships:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {edges.slice(0, 6).map((e) => {
                    const sourceNode = nodes.find((n) => n.id === e.sourceNodeId);
                    const targetNode = nodes.find((n) => n.id === e.targetNodeId);
                    return (
                      <div key={e.id} className="p-2.5 rounded bg-[#0a0c0f] border border-zinc-800 flex items-center justify-between gap-2">
                        <div className="truncate">
                          <span className="text-white font-medium truncate block">{sourceNode?.label}</span>
                          <span className="text-blue-400 text-[10px] font-mono">→ {e.relationshipType}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        <div className="truncate text-right">
                          <span className="text-zinc-300 font-medium truncate block">{targetNode?.label}</span>
                          <span className="text-zinc-500 text-[10px]">{e.description}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          {/* Node Inspector Panel */}
          <div className="space-y-4">
            <div className="p-5 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Entity Inspector</h3>
                {selectedNode && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {selectedNode.type}
                  </span>
                )}
              </div>

              {selectedNode ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold">Label / Name:</span>
                    <p className="text-sm font-bold text-white mt-0.5">{selectedNode.label}</p>
                    <p className="text-zinc-500 font-mono text-xs">{selectedNode.id}</p>
                  </div>

                  {/* Metadata key-value */}
                  <div className="p-3 rounded bg-zinc-950 border border-zinc-800 space-y-2">
                    {Object.entries(selectedNode.metadata || {}).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-zinc-200 font-medium font-mono">{String(v)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Connected Relationships */}
                  <div>
                    <span className="text-zinc-400 text-[11px] font-bold block mb-2">
                      Connected Relationships ({connectedEdges.length}):
                    </span>
                    <div className="space-y-2">
                      {connectedEdges.map((edge) => {
                        const otherId = edge.sourceNodeId === selectedNode.id ? edge.targetNodeId : edge.sourceNodeId;
                        const otherNode = nodes.find((n) => n.id === otherId);
                        return (
                          <div key={edge.id} className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-[11px] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-purple-300">{edge.relationshipType}</span>
                              <span className="text-zinc-500 text-[10px] font-mono">{edge.evidenceSourceId}</span>
                            </div>
                            <p className="text-zinc-300">
                              Connected with <strong className="text-white">{otherNode?.label}</strong>: {edge.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  Select an entity node from the canvas to inspect its relationships and evidence citations.
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Chronological Timeline View */
        <div className="p-6 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">Chronological Incident & Investigation Timeline</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Corroborated timeline combining FIR, CDR cell tower timestamps, ATM withdrawals, and Evidence Seizures
            </p>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:left-2.5 before:w-0.5 before:bg-zinc-800">
            {[
              {
                time: '2026-08-08 09:30 AM',
                title: 'Victim Receives Fraudulent Cyber Call',
                desc: 'Complainant contacted by suspect impersonating Customs Department officer demanding immediate penalty transfer.',
                type: 'INCIDENT',
                badge: 'Cyber Incident',
              },
              {
                time: '2026-08-08 10:15 AM',
                title: 'Bank Debit of ₹4,50,000 Transferred',
                desc: 'Funds transferred from victim account to mule account ICICI-MULE-8839.',
                type: 'FINANCIAL',
                badge: 'Bank Statement',
              },
              {
                time: '2026-08-08 12:05 PM',
                title: 'ATM Cash Withdrawal Captured on CCTV',
                desc: 'Suspect Dinesh withdrawn ₹50,000 cash at Kodambakkam High Road Axis ATM.',
                type: 'EVIDENCE',
                badge: 'CCTV Footage EVD-001',
              },
              {
                time: '2026-08-08 12:12 PM',
                title: 'CDR Tower Triangulation at Kodambakkam',
                desc: 'Suspect mobile +91 98401 22910 connected to Cell Tower CHN-KDMB-04 (contradicting Tambaram alibi claim).',
                type: 'CDR',
                badge: 'CDR Record EVD-002',
              },
              {
                time: '2026-08-09 11:00 AM',
                title: 'FIR No. 240/2026 Registered at Mylapore PS',
                desc: 'Formal complaint registered under BNS 318(4) and IT Act 66D. Case assigned to IO Inspector K. Senthil Kumar.',
                type: 'FIR',
                badge: 'FIR Genesis',
              },
              {
                time: '2026-08-11 04:30 PM',
                title: 'Seizure of Yamaha FZ Motorcycle (TN-09-CB-4491)',
                desc: 'Vehicle seized from suspect residence under Panchnama / Seizure Memo with GPS timestamp.',
                type: 'SEIZURE',
                badge: 'Seizure Memo EVD-003',
              },
            ].map((event, idx) => (
              <div key={idx} className="relative flex items-start gap-4 text-xs">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-[#0a0c0f]" />
                <div className="p-4 rounded bg-zinc-950 border border-zinc-800 w-full space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-blue-400 text-[11px] font-bold">{event.time}</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 font-mono text-[10px] border border-zinc-800">
                      {event.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{event.title}</h4>
                  <p className="text-zinc-400 leading-relaxed text-xs">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

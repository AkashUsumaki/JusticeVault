import React, { useState, useMemo, useEffect } from 'react';
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
  Layers,
  Plus
} from 'lucide-react';
import { EntityNode, EvidenceItem, FIRDetails, LanguageCode, RelationshipEdge } from '../types';
import { mockRelationshipGraph } from '../data/mockData';
import { translations } from '../translations/i18n';

interface RelationshipGraphProps {
  caseItem: FIRDetails;
  currentLang: LanguageCode;
  evidenceList?: EvidenceItem[];
}

export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({
  caseItem,
  currentLang,
  evidenceList = [],
}) => {
  const t = translations[currentLang];
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'GRAPH' | 'TIMELINE'>('GRAPH');

  // Case-specific base nodes and edges
  const { caseBaseNodes, caseBaseEdges, primarySuspectNodeId } = useMemo(() => {
    if (caseItem.caseId === 'TN-MDU-2026-002194') {
      const nodes: EntityNode[] = [
        {
          id: 'NODE-MDU-SUSP',
          type: 'PERSON',
          label: 'Selvam @ Karuppu Selvam',
          subLabel: 'Primary Accused / Repeat Offender',
          riskLevel: 'HIGH',
          metadata: {
            'Criminal Record': 'FPR-MDU-19984',
            'Alibi Claimed': 'Tirunelveli Junction Tea Stall',
            'Status': 'Under Judicial Remand',
            'Seizure Recovery': '450g Gold Jewellery Recovered',
          },
        },
        {
          id: 'NODE-MDU-VICT',
          type: 'PERSON',
          label: 'R. Muthukumar',
          subLabel: 'Complainant / Proprietor',
          riskLevel: 'LOW',
          metadata: {
            'Establishment': 'Muthulakshmi Jewellers',
            'Loss Incurred': '₹38,50,000 in Hallmarked Gold',
            'FIR Date': '13-08-2026',
          },
        },
        {
          id: 'NODE-MDU-LOC1',
          type: 'LOCATION',
          label: 'South Masi Street, Madurai',
          subLabel: 'Jewellery Showroom Crime Scene',
          riskLevel: 'MEDIUM',
          metadata: {
            'Landmark': 'Near Meenakshi Amman Temple South Tower',
            'Entry Point': 'Roof Skylight Grill Cut',
            'CCTV Status': 'Power Disconnected by Intruder',
          },
        },
        {
          id: 'NODE-MDU-LOC2',
          type: 'LOCATION',
          label: 'NHAI Kappalur Toll Plaza',
          subLabel: 'Toll Camera Checkpoint',
          riskLevel: 'LOW',
          metadata: {
            'Camera System': 'High-Speed ANPR Lens #04',
            'Timestamp': '13-08-2026 03:42 AM',
            'Lane': 'Outbound Lane 3 towards Virudhunagar',
          },
        },
        {
          id: 'NODE-MDU-VEH',
          type: 'VEHICLE',
          label: 'TN-58-BQ-9921',
          subLabel: 'Bajaj Pulsar 150 (Black)',
          riskLevel: 'HIGH',
          metadata: {
            'Registered Owner': 'Accused Cousin (K. Velu)',
            'ANPR Match': 'Detected at Kappalur Toll 03:42 AM',
            'Seizure Memo': 'Seized under Section 23 BSA 2023',
          },
        },
        {
          id: 'NODE-MDU-PH',
          type: 'PHONE',
          label: '+91 94431 88204',
          subLabel: 'Suspect Mobile Device',
          riskLevel: 'MEDIUM',
          metadata: {
            'Carrier': 'BSNL Tamil Nadu Circle',
            'Tower Cell': 'MDU-MASI-TWR2',
            'Activity': 'Silent mode active during burglary hours',
          },
        },
      ];

      const edges: RelationshipEdge[] = [
        {
          id: 'EDGE-MDU-01',
          sourceNodeId: 'NODE-MDU-SUSP',
          targetNodeId: 'NODE-MDU-LOC1',
          relationshipType: 'PHYSICAL_PRESENCE',
          description: 'Identified by latent palm print on cash locker (FSL Match)',
          confidenceScore: 0.99,
          evidenceSourceId: 'EVD-TN-002194-001',
        },
        {
          id: 'EDGE-MDU-02',
          sourceNodeId: 'NODE-MDU-SUSP',
          targetNodeId: 'NODE-MDU-VEH',
          relationshipType: 'VEHICLE_USED',
          description: 'Operated getaway motorcycle caught on Kappalur ANPR camera at 03:42 AM',
          confidenceScore: 0.98,
          evidenceSourceId: 'EVD-TN-002194-002',
        },
        {
          id: 'EDGE-MDU-03',
          sourceNodeId: 'NODE-MDU-VEH',
          targetNodeId: 'NODE-MDU-LOC2',
          relationshipType: 'SURVEILLANCE_MATCH',
          description: 'ANPR optical plate recognition logged vehicle crossing toll barrier',
          confidenceScore: 0.97,
          evidenceSourceId: 'EVD-TN-002194-002',
        },
        {
          id: 'EDGE-MDU-04',
          sourceNodeId: 'NODE-MDU-SUSP',
          targetNodeId: 'NODE-MDU-PH',
          relationshipType: 'OPERATED_PHONE',
          description: 'Registered MSISDN tracked near scene prior to incident',
          confidenceScore: 0.95,
        },
      ];

      return { caseBaseNodes: nodes, caseBaseEdges: edges, primarySuspectNodeId: 'NODE-MDU-SUSP' };
    }

    if (caseItem.caseId === 'KL-TVM-2026-001087') {
      const nodes: EntityNode[] = [
        {
          id: 'NODE-KL-SUSP',
          type: 'PERSON',
          label: 'Unnikrishnan Nair',
          subLabel: 'Accused Business Partner',
          riskLevel: 'HIGH',
          metadata: {
            'Motive': '₹85,00,000 Timber Consignment Dispute',
            'Alibi Claimed': 'Admitted at Kottayam Hospital (150 km)',
            'Forensic Link': 'Fingerprint on iron rod weapon handle',
          },
        },
        {
          id: 'NODE-KL-VICT',
          type: 'PERSON',
          label: 'Babu Varghese',
          subLabel: 'Deceased Partner / Warehouse Owner',
          riskLevel: 'LOW',
          metadata: {
            'Cause of Death': 'Traumatic Brain Injury (TBI)',
            'Post Mortem': 'PM-MED-TVM-2026-8812',
            'Autopsy Date': '28-07-2026 09:30 AM',
          },
        },
        {
          id: 'NODE-KL-LOC1',
          type: 'LOCATION',
          label: 'Chalakkuzhi Timber Warehouse',
          subLabel: 'Primary Crime Scene (East Fort)',
          riskLevel: 'HIGH',
          metadata: {
            'Jurisdiction': 'Fort Police Station, TVM City',
            'Time of Occurrence': '27-07-2026 Between 18:00 - 18:30 PM',
          },
        },
        {
          id: 'NODE-KL-LOC2',
          type: 'LOCATION',
          label: 'Cell Tower KL-TVM-019',
          subLabel: 'East Fort Telecom Node',
          riskLevel: 'MEDIUM',
          metadata: {
            'Coverage Area': 'East Fort Junction & Chalakkuzhi Lane',
            'CDR Latched': 'Suspect device latched 17:30 - 19:15 PM',
          },
        },
        {
          id: 'NODE-KL-VEH',
          type: 'VEHICLE',
          label: 'KL-01-BW-8821',
          subLabel: 'Maruti Suzuki Swift (White)',
          riskLevel: 'HIGH',
          metadata: {
            'Traffic CCTV': 'Captured exiting warehouse lane at 18:48 PM',
            'Registered To': 'Accused Unnikrishnan Nair',
          },
        },
      ];

      const edges: RelationshipEdge[] = [
        {
          id: 'EDGE-KL-01',
          sourceNodeId: 'NODE-KL-SUSP',
          targetNodeId: 'NODE-KL-LOC1',
          relationshipType: 'PHYSICAL_PRESENCE',
          description: 'CDR tower latch and vehicle traffic CCTV place accused at warehouse',
          confidenceScore: 0.99,
          evidenceSourceId: 'EVD-KL-001087-004',
        },
        {
          id: 'EDGE-KL-02',
          sourceNodeId: 'NODE-KL-SUSP',
          targetNodeId: 'NODE-KL-VEH',
          relationshipType: 'VEHICLE_USED',
          description: 'Accused drove white Swift away from crime scene at 18:48 PM',
          confidenceScore: 0.98,
          evidenceSourceId: 'EVD-KL-001087-002',
        },
        {
          id: 'EDGE-KL-03',
          sourceNodeId: 'NODE-KL-SUSP',
          targetNodeId: 'NODE-KL-LOC2',
          relationshipType: 'COMMUNICATION_LINK',
          description: 'Accused phone continuously latched to East Fort tower refuting alibi',
          confidenceScore: 0.99,
          evidenceSourceId: 'EVD-KL-001087-004',
        },
      ];

      return { caseBaseNodes: nodes, caseBaseEdges: edges, primarySuspectNodeId: 'NODE-KL-SUSP' };
    }

    // Default: Chennai Cyber Impersonation Case
    return {
      caseBaseNodes: mockRelationshipGraph.nodes,
      caseBaseEdges: mockRelationshipGraph.edges,
      primarySuspectNodeId: 'NODE-DINESH',
    };
  }, [caseItem.caseId]);

  // Convert real case evidence into graph nodes
  const dynamicNodes: EntityNode[] = useMemo(() => {
    const evidenceNodes = evidenceList
      .filter((e) => !caseBaseNodes.some((n) => n.id === e.id))
      .map((e) => ({
        id: e.id,
        type: 'EVIDENCE_ITEM' as const,
        label: e.title,
        subLabel: `${e.category} • ${e.sourceSystem}`,
        riskLevel: (e.isTampered ? 'HIGH' : 'LOW') as any,
        metadata: {
          'SHA-256': `${e.sha256Hash.substring(0, 16)}...`,
          'Format': e.mimeType,
          'Custodian': e.uploadedByOfficerName,
          'GPS Location': e.gpsLocation?.addressName || 'Police Station',
        },
      }));

    return [...caseBaseNodes, ...evidenceNodes];
  }, [caseBaseNodes, evidenceList]);

  // Dynamically link case evidence to the primary suspect / crime scene
  const dynamicEdges: RelationshipEdge[] = useMemo(() => {
    const evidenceEdges = evidenceList.map((e) => ({
      id: `EDGE-DYN-${e.id}`,
      sourceNodeId: primarySuspectNodeId,
      targetNodeId: e.id,
      relationshipType: 'ASSOCIATED_EVIDENCE' as const,
      description: `Cryptographically verified proof item for FIR ${caseItem.firNumber}`,
      confidenceScore: 0.98,
      verifiedByOfficer: e.uploadedByOfficerName,
    }));

    return [...caseBaseEdges, ...evidenceEdges];
  }, [caseBaseEdges, evidenceList, primarySuspectNodeId, caseItem.firNumber]);

  const [selectedNode, setSelectedNode] = useState<EntityNode | null>(dynamicNodes[0]);

  useEffect(() => {
    if (dynamicNodes.length > 0) {
      setSelectedNode(dynamicNodes[0]);
    }
  }, [caseItem.caseId]);

  const filteredNodes = dynamicNodes.filter((n) => {
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
        return <FileText className="w-4 h-4 text-cyan-400" />;
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
        return 'bg-[#0a0c0f] border-cyan-500/20 hover:border-cyan-400/50';
    }
  };

  // Connected edges for selected node
  const connectedEdges = selectedNode
    ? dynamicEdges.filter((e) => e.sourceNodeId === selectedNode.id || e.targetNodeId === selectedNode.id)
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
                Real-Time Entity Link Analysis, Financial Mules, CDR Tower Coordinates & Case Timeline
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
            <span>Entity Network ({dynamicNodes.length})</span>
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
                  className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition ${
                    selectedType === type
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-[#0a0c0f] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {type === 'ALL' ? 'All Entities' : type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Interactive Nodes Board */}
            <div className="p-6 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 min-h-[440px] relative flex flex-wrap gap-4 items-center justify-center content-center shadow-inner">
              <div className="absolute top-3 left-3 text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Click any entity to inspect cryptographic linkage & evidentiary connections</span>
              </div>

              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3.5 rounded-lg border text-left transition transform active:scale-95 space-y-1.5 min-w-[170px] max-w-[210px] ${getNodeBg(
                      node.type,
                      isSelected
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                        {getNodeIcon(node.type)}
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        node.riskLevel === 'HIGH'
                          ? 'bg-red-500/20 text-red-400'
                          : node.riskLevel === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {node.riskLevel}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white tracking-tight truncate">{node.label}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{node.subLabel}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side Entity Detail Inspector */}
          <div className="space-y-4">
            {selectedNode ? (
              <div className="p-5 rounded-lg bg-[#0a0c0f] border border-zinc-800/80 space-y-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                      {getNodeIcon(selectedNode.type)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{selectedNode.type}</span>
                      <h3 className="text-sm font-bold text-white">{selectedNode.label}</h3>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    selectedNode.riskLevel === 'HIGH'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {selectedNode.riskLevel} RISK
                  </span>
                </div>

                <div className="space-y-2 border-t border-zinc-800 pt-3">
                  <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Entity Metadata:</h4>
                  <div className="space-y-1.5 text-xs font-mono">
                    {Object.entries(selectedNode.metadata).map(([key, val]) => (
                      <div key={key} className="flex justify-between p-2 rounded bg-zinc-950 border border-zinc-800/60">
                        <span className="text-zinc-500 text-[11px]">{key}:</span>
                        <span className="text-zinc-200 text-[11px] font-medium text-right max-w-[150px] truncate">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t border-zinc-800 pt-3">
                  <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    Linked Evidentiary Connections ({connectedEdges.length}):
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {connectedEdges.map((edge) => {
                      const otherNodeId = edge.sourceNodeId === selectedNode.id ? edge.targetNodeId : edge.sourceNodeId;
                      const otherNode = dynamicNodes.find((n) => n.id === otherNodeId);
                      return (
                        <div key={edge.id} className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-blue-400">{edge.relationshipType.replace(/_/g, ' ')}</span>
                            <span className="text-emerald-400 font-bold">{(edge.confidenceScore * 100).toFixed(0)}% Conf</span>
                          </div>
                          <p className="font-semibold text-white">{otherNode ? otherNode.label : otherNodeId}</p>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">{edge.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-lg bg-[#0a0c0f] border border-zinc-800 text-center text-zinc-500 text-xs">
                Select an entity to inspect connected links and forensic properties.
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Timeline View */
        <div className="p-6 rounded-lg bg-[#0a0c0f] border border-zinc-800/60 space-y-4">
          <div className="border-l-2 border-blue-500/40 ml-4 pl-6 space-y-6">
            {caseItem.timelineEvents.map((evt, idx) => (
              <div key={evt.id || idx} className="relative group">
                <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-[#050608] group-hover:scale-125 transition" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-blue-400 font-semibold">{evt.timestamp}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                      {evt.verifiedByEvidenceId}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{evt.title}</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

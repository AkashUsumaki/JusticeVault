import React from 'react';
import { OSMEvidenceMap, OSMEvidenceMapProps } from './OSMEvidenceMap';

export type GoogleEvidenceMapProps = OSMEvidenceMapProps;

/**
 * Backward-compatible wrapper delegating directly to the OpenStreetMap Leaflet Engine.
 * Uses 100% free OpenStreetMap tiles with zero Google Maps API keys or third-party tracking.
 */
export const GoogleEvidenceMap: React.FC<OSMEvidenceMapProps> = (props) => {
  return <OSMEvidenceMap {...props} />;
};

export { OSMEvidenceMap };
export default OSMEvidenceMap;

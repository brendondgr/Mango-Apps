// ================================================================
// COMMON: Cross-Table Connector Nodes
// These nodes are shared across HOSP, ICU, and ED modules
// ================================================================

const commonNodes = [
    // === CROSS-TABLE CONNECTOR NODES (Purple) ===
    // Fixed positions to form a central structure
    { id: 'subject_id', label: 'subject_id\n(patient identifier)', ...nodeStyles.connector, x: 0, y: -100, fixed: true, description: 'Links to patients table.\nA patient can have multiple\nadmissions (multiple hadm_id).' },
    { id: 'hadm_id', label: 'hadm_id\n(hospital admission\nidentifier)', ...nodeStyles.connector, x: -200, y: 100, fixed: true, description: 'Unique identifier for a hospital admission.\nUsed to link labs, diagnoses, and procedures to a specific stay.' },
    { id: 'stay_id', label: 'stay_id\n(ICU/ED stay\nidentifier)', ...nodeStyles.connector, x: 200, y: 100, fixed: true, description: 'Unique identifier for a specific ward stay (ICU or ED).\nDerived from transfer_id.' }
];

const commonEdges = [
    // No standalone edges - connectors are linked from their respective modules
];

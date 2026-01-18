// ================================================================
// NOTE MODULE: Clinical Notes
// Tables: discharge, discharge_detail, radiology, radiology_detail
// ================================================================

const noteNodes = [
    // === DISCHARGE: TABLE NODE ===
    { id: 'note_discharge', label: 'note/discharge\n(discharge summaries)', ...nodeStyles.file, description: 'Contains long-form narrative discharge summaries describing the reason for admission, hospital course, and instructions.' },

    // === DISCHARGE: VARIABLE NODES ===
    { id: 'n_note_id', label: 'note_id\n(unique note ID)', ...nodeStyles.variable, description: 'Type: VARCHAR(25)\nUnique identifier for the note (subject_id-type-seq).' },
    { id: 'n_note_type', label: 'note_type\n(DS or AD)', ...nodeStyles.variable, description: 'Type: CHAR(2)\nDS = Discharge Summary, AD = Addendum.' },

    // === DISCHARGE_DETAIL: TABLE NODE ===
    { id: 'note_discharge_detail', label: 'note/discharge_detail\n(metadata)', ...nodeStyles.file, description: 'Additional metadata for discharge summaries (e.g., author).' },

    // === RADIOLOGY: TABLE NODE ===
    { id: 'note_radiology', label: 'note/radiology\n(radiology reports)', ...nodeStyles.file, description: 'Free-text radiology reports covering X-ray, CT, MRI, US, etc.' },

    // === RADIOLOGY: VARIABLE NODES ===
    { id: 'n_rad_note_type', label: 'note_type\n(RR or AR)', ...nodeStyles.variable, description: 'Type: CHAR(2)\nRR = Radiology Report, AR = Addendum.' },

    // === RADIOLOGY_DETAIL: TABLE NODE ===
    { id: 'note_radiology_detail', label: 'note/radiology_detail\n(metadata)', ...nodeStyles.file, description: 'Additional metadata for radiology notes (e.g., exam name, cpt code).' },
];

const noteEdges = [
    // DISCHARGE
    { from: 'note_discharge', to: 'n_note_id', ...edgeStyles.blue },
    { from: 'note_discharge', to: 'n_note_type', ...edgeStyles.blue },
    { from: 'note_discharge', to: 'subject_id', ...edgeStyles.purple },
    { from: 'note_discharge', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'note_discharge', to: 'note_discharge_detail', ...edgeStyles.purple },

    // RADIOLOGY
    { from: 'note_radiology', to: 'n_rad_note_type', ...edgeStyles.blue },
    { from: 'note_radiology', to: 'subject_id', ...edgeStyles.purple },
    { from: 'note_radiology', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'note_radiology', to: 'note_radiology_detail', ...edgeStyles.purple },

    // CONNECTIONS (Note to note detail via note_id - implied by purple edge above)
];

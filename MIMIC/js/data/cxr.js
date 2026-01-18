// ================================================================
// CXR MODULE: Chest X-Ray Tables
// Tables: record_list
// ================================================================

const cxrNodes = [
    // === CXR RECORD LIST: TABLE NODE ===
    { id: 'cxr_record_list', label: 'cxr/record_list\n(DICOM record mapping)', ...nodeStyles.file, description: 'Links DICOM image IDs to radiology study IDs and patient IDs. Covers CXRs from 2011-2016 for ED patients.' },
    
    // === CXR RECORD LIST: VARIABLE NODES ===
    { id: 'cxr_study_id', label: 'study_id\n(radiology report ID)', ...nodeStyles.variable, description: 'Type: INTEGER\nUnique identifier for the radiology report written for the given chest x-ray.' },
    { id: 'cxr_dicom_id', label: 'dicom_id\n(unique image ID)', ...nodeStyles.variable, description: 'Type: TEXT\nUnique identifier for the chest x-ray image (DICOM file).' },
];

const cxrEdges = [
    // Blue edges - Links from record_list table to its columns
    { from: 'cxr_record_list', to: 'cxr_study_id', ...edgeStyles.blue },
    { from: 'cxr_record_list', to: 'cxr_dicom_id', ...edgeStyles.blue },
    
    // Purple edges - CXR Record List to connector nodes
    { from: 'cxr_record_list', to: 'subject_id', ...edgeStyles.purple },
];

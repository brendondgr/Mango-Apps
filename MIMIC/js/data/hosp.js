// ================================================================
// HOSP MODULE: Hospital Tables
// Tables: admissions, patients, transfers, labevents, d_labitems
// ================================================================

const hospNodes = [
    // === ADMISSIONS: TABLE NODE ===
    { id: 'admissions', label: 'hosp/admissions\n(hospital admissions)', ...nodeStyles.file, description: 'Defines each hospital stay (hadm_id). Includes timing, demographic info, and admission source.' },
    
    // === ADMISSIONS: VARIABLE NODES ===
    { id: 'h_admittime', label: 'admittime\n(admission time)', ...nodeStyles.variable, description: 'Type: TIMESTAMP\nDate and time the patient was admitted to the hospital.' },
    { id: 'h_dischtime', label: 'dischtime\n(discharge time)', ...nodeStyles.variable, description: 'Type: TIMESTAMP\nDate and time the patient was discharged from the hospital.' },
    { id: 'h_admission_type', label: 'admission_type\n(urgency)', ...nodeStyles.variable, description: 'Type: VARCHAR(40)\nClassifies the urgency of the admission.' },
    { id: 'h_insurance', label: 'insurance\n(payer)', ...nodeStyles.variable, description: 'Type: VARCHAR(255)\nPatient insurance/payer information.' },

    // === PATIENTS: TABLE NODE ===
    { id: 'patients', label: 'hosp/patients\n(patient list)', ...nodeStyles.file, description: 'Lifetime information: gender, birth year, and de-identified date of death.' },
    
    // === PATIENTS: VARIABLE NODES ===
    { id: 'h_gender', label: 'gender', ...nodeStyles.variable, description: 'Type: VARCHAR(1)\nGenotypical sex of the patient.' },
    { id: 'h_anchor_age', label: 'anchor_age\n(age at anchor_year)', ...nodeStyles.variable, description: "Type: INTEGER\nPatient's age in the anchor_year. Over 89 masked as 91." },
    { id: 'h_dod', label: 'dod\n(date of death)', ...nodeStyles.variable, description: 'Type: TIMESTAMP(0)\nDe-identified date of death (up to 1 year post-discharge).' },

    // === TRANSFERS: TABLE NODE ===
    { id: 'transfers', label: 'hosp/transfers\n(ward/unit transfers)', ...nodeStyles.file, description: 'Records physical locations of patients during their hospital stay.' },
    
    // === TRANSFERS: VARIABLE NODES ===
    { id: 'h_careunit', label: 'careunit\n(ward/unit name)', ...nodeStyles.variable, description: 'Type: VARCHAR(255)\nThe ward or unit the patient was transferred to.' },

    // === PROVIDER: TABLE NODE ===
    { id: 'hosp_provider', label: 'hosp/provider\n(HOSP providers)', ...nodeStyles.file, description: 'Lists deidentified provider identifiers used throughout the hospital EHR.' },

    // === PROVIDER: VARIABLE NODES ===
    { id: 'hosp_provider_id', label: 'provider_id', ...nodeStyles.variable, description: 'Type: VARCHAR(10)\nUnique identifier for a hospital provider.' },

    // === LABEVENTS: TABLE NODE ===
    { id: 'labevents', label: 'hosp/labevents\n(lab measurements)', ...nodeStyles.file, description: 'Contains all laboratory measurements for patients, both in-hospital and outpatient.' },

    // === LABEVENTS: VARIABLE NODES ===
    { id: 'l_itemid', label: 'itemid\n(lab concept ID)', ...nodeStyles.variable, description: 'Type: INTEGER\nIdentifier for the lab measurement (joins with d_labitems).' },
    { id: 'l_value', label: 'value / valuenum\n(result)', ...nodeStyles.variable, description: 'Type: VARCHAR(200) / DOUBLE PRECISION\nThe lab result.' },

    // === D_LABITEMS: TABLE NODE ===
    { id: 'd_labitems', label: 'hosp/d_labitems\n(lab item dictionary)', ...nodeStyles.file, description: 'Definition table for lab items. Includes labels, fluid types, and categories.' },

    // === POE: TABLE NODE ===
    { id: 'hosp_poe', label: 'hosp/poe\n(provider order entry)', ...nodeStyles.file, description: 'General interface for entering orders. Most treatments/procedures are ordered here.' },

    // === POE: VARIABLE NODES ===
    { id: 'poe_id', label: 'poe_id\n(unique order ID)', ...nodeStyles.variable, description: 'Type: VARCHAR(25)\nUnique identifier for the order.' },
    { id: 'poe_order_type', label: 'order_type\n(category)', ...nodeStyles.variable, description: 'Type: VARCHAR(25)\nCategory of the order (e.g., Medications, Lab, Radiology).' },

    // === PRESCRIPTIONS: TABLE NODE ===
    { id: 'hosp_prescriptions', label: 'hosp/prescriptions\n(prescribed meds)', ...nodeStyles.file, description: 'Detailed information about prescribed medications.' },

    // === PRESCRIPTIONS: VARIABLE NODES ===
    { id: 'rx_drug', label: 'drug\n(medication name)', ...nodeStyles.variable, description: 'Type: VARCHAR(255)\nFree-text description of the medication.' },
    { id: 'rx_gsn_ndc', label: 'gsn / ndc\n(coded identifiers)', ...nodeStyles.variable, description: 'GSN and NDC codes for the medication.' },

    // === PHARMACY: TABLE NODE ===
    { id: 'hosp_pharmacy', label: 'hosp/pharmacy\n(dispensed meds)', ...nodeStyles.file, description: 'Detailed information regarding filled/dispensed medications.' },

    // === PHARMACY: VARIABLE NODES ===
    { id: 'pharm_id', label: 'pharmacy_id\n(unique fill ID)', ...nodeStyles.variable, description: 'Type: INTEGER\nUnique identifier for the pharmacy entry.' },

    // === EMAR: TABLE NODE ===
    { id: 'hosp_emar', label: 'hosp/emar\n(med administration)', ...nodeStyles.file, description: 'Electronic Medicine Administration Record; barcode scanning at the bedside.' },

    // === EMAR: VARIABLE NODES ===
    { id: 'emar_charttime', label: 'charttime\n(administration time)', ...nodeStyles.variable, description: 'Type: TIMESTAMP\nThe time at which the medication was actually administered.' },

    // === DIAGNOSES_ICD: TABLE NODE ===
    { id: 'hosp_diagnoses_icd', label: 'hosp/diagnoses_icd\n(billed diagnoses)', ...nodeStyles.file, description: 'Billed ICD-9/ICD-10 diagnoses for hospitalizations. Determined on discharge.' },

    // === DIAGNOSES_ICD: VARIABLE NODES ===
    { id: 'h_diag_icd_code', label: 'icd_code\n(ICD diagnosis code)', ...nodeStyles.variable, description: 'Type: VARCHAR(7)\nCoded diagnosis using the ICD ontology.' },
    { id: 'h_diag_icd_version', label: 'icd_version\n(9 or 10)', ...nodeStyles.variable, description: 'Type: INTEGER\nVersion of ICD (9 or 10).' },

    // === D_ICD_DIAGNOSES: TABLE NODE ===
    { id: 'hosp_d_icd_diagnoses', label: 'hosp/d_icd_diagnoses\n(diagnosis dict)', ...nodeStyles.file, description: 'Dimension table for diagnoses_icd; provides descriptions for ICD codes.' },

    // === PROCEDURES_ICD: TABLE NODE ===
    { id: 'hosp_procedures_icd', label: 'hosp/procedures_icd\n(billed procedures)', ...nodeStyles.file, description: 'Billed ICD-9/ICD-10 procedures for patients during their hospital stay.' },

    // === PROCEDURES_ICD: VARIABLE NODES ===
    { id: 'h_proc_icd_code', label: 'icd_code\n(ICD procedure code)', ...nodeStyles.variable, description: 'Type: VARCHAR(7)\nCoded procedure using the ICD ontology.' },
    { id: 'h_proc_chartdate', label: 'chartdate\n(procedure date)', ...nodeStyles.variable, description: 'Type: DATE\nThe date of the associated procedure.' },

    // === D_ICD_PROCEDURES: TABLE NODE ===
    { id: 'hosp_d_icd_procedures', label: 'hosp/d_icd_procedures\n(procedure dict)', ...nodeStyles.file, description: 'Dimension table for procedures_icd; provides descriptions for ICD codes.' },

    // === DRGCODES: TABLE NODE ===
    { id: 'hosp_drgcodes', label: 'hosp/drgcodes\n(billing groups)', ...nodeStyles.file, description: 'Diagnosis related groups (DRGs) used for hospital reimbursement. Primary reason for stay.' },

    // === DRGCODES: VARIABLE NODES ===
    { id: 'h_drg_code', label: 'drg_code\n(DRG code)', ...nodeStyles.variable, description: 'Type: VARCHAR(10)\nThe DRG code.' },
    { id: 'h_drg_severity', label: 'drg_severity\n(illness severity)', ...nodeStyles.variable, description: 'Type: SMALLINT\nPatient severity of illness (if available).' },

    // === HCPCSEVENTS: TABLE NODE ===
    { id: 'hosp_hcpcsevents', label: 'hosp/hcpcsevents\n(billed events)', ...nodeStyles.file, description: 'Billed events occurring during hospitalization. Includes CPT codes.' },

    // === HCPCSEVENTS: VARIABLE NODES ===
    { id: 'h_hcpcs_cd', label: 'hcpcs_cd\n(HCPCS/CPT code)', ...nodeStyles.variable, description: 'Type: CHAR(5)\nA five character code representing the event.' },

    // === D_HCPCS: TABLE NODE ===
    { id: 'hosp_d_hcpcs', label: 'hosp/d_hcpcs\n(HCPCS dict)', ...nodeStyles.file, description: 'Dimension table for hcpcsevents; provides descriptions of CPT codes.' },

    // === SERVICES: TABLE NODE ===
    { id: 'hosp_services', label: 'hosp/services\n(hospital services)', ...nodeStyles.file, description: 'Describes the service that a patient was admitted under (e.g., CMED, CSURG, MED).' },

    // === SERVICES: VARIABLE NODES ===
    { id: 'h_curr_service', label: 'curr_service\n(current service)', ...nodeStyles.variable, description: 'Type: VARCHAR(20)\nThe current service the patient is receiving care under.' },

    // === MICROBIOLOGYEVENTS: TABLE NODE ===
    { id: 'hosp_microbiologyevents', label: 'hosp/microbiologyevents\n(cultures)', ...nodeStyles.file, description: 'Contains results of microbiology tests (cultures) for infectious growth.' },

    // === MICROBIOLOGYEVENTS: VARIABLE NODES ===
    { id: 'h_micro_spec_desc', label: 'spec_type_desc\n(specimen type)', ...nodeStyles.variable, description: 'Type: VARCHAR(100)\nThe specimen tested (e.g., BLOOD CULTURE, URINE).' },
    { id: 'h_micro_org_name', label: 'org_name\n(organism)', ...nodeStyles.variable, description: 'Type: VARCHAR(100)\nThe organism, if any, which grew (NULL if no growth).' },
    { id: 'h_micro_interpretation', label: 'interpretation\n(sensitivity)', ...nodeStyles.variable, description: 'Type: VARCHAR(5)\nAntibiotic sensitivity (S=Sensitive, R=Resistant, etc.).' },

    // === OMR: TABLE NODE ===
    { id: 'hosp_omr', label: 'hosp/omr\n(medical record)', ...nodeStyles.file, description: 'Stores miscellaneous EHR info, including outpatient weight, height, and BMI.' },

    // === OMR: VARIABLE NODES ===
    { id: 'h_omr_result_name', label: 'result_name\n(observation)', ...nodeStyles.variable, description: 'Type: VARCHAR(100)\nDescription of the observation (e.g., BMI, Weight).' },
    { id: 'h_omr_result_value', label: 'result_value\n(value)', ...nodeStyles.variable, description: 'Type: TEXT\nThe recorded value for the observation.' },

    // === POE_DETAIL: TABLE NODE ===
    { id: 'h_poe_detail', label: 'hosp/poe_detail\n(order details)', ...nodeStyles.file, description: 'Supplementary information for POE orders using an EAV model.' },

    // === EMAR_DETAIL: TABLE NODE ===
    { id: 'h_emar_detail', label: 'hosp/emar_detail\n(admin details)', ...nodeStyles.file, description: 'Supplementary information for each medicine administration in eMAR.' },

    // === EMAR_DETAIL: VARIABLE NODES ===
    { id: 'h_emar_dose_given', label: 'dose_given\n(actual dose)', ...nodeStyles.variable, description: 'Type: VARCHAR(255)\nThe actual dose of the medication administered.' },
];

const hospEdges = [
    // ADMISSIONS
    { from: 'admissions', to: 'h_admittime', ...edgeStyles.blue },
    { from: 'admissions', to: 'h_dischtime', ...edgeStyles.blue },
    { from: 'admissions', to: 'h_admission_type', ...edgeStyles.blue },
    { from: 'admissions', to: 'h_insurance', ...edgeStyles.blue },
    { from: 'admissions', to: 'subject_id', ...edgeStyles.purple },
    { from: 'admissions', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'admissions', to: 'hosp_provider_id', ...edgeStyles.purple },

    // PATIENTS
    { from: 'patients', to: 'h_gender', ...edgeStyles.blue },
    { from: 'patients', to: 'h_anchor_age', ...edgeStyles.blue },
    { from: 'patients', to: 'h_dod', ...edgeStyles.blue },
    { from: 'patients', to: 'subject_id', ...edgeStyles.purple },

    // TRANSFERS
    { from: 'transfers', to: 'h_careunit', ...edgeStyles.blue },
    { from: 'transfers', to: 'subject_id', ...edgeStyles.purple },
    { from: 'transfers', to: 'hadm_id', ...edgeStyles.purple },

    // PROVIDER
    { from: 'hosp_provider', to: 'hosp_provider_id', ...edgeStyles.blue },

    // LABS
    { from: 'labevents', to: 'l_itemid', ...edgeStyles.blue },
    { from: 'labevents', to: 'l_value', ...edgeStyles.blue },
    { from: 'labevents', to: 'subject_id', ...edgeStyles.purple },
    { from: 'labevents', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'l_itemid', to: 'd_labitems', ...edgeStyles.purple },

    // POE
    { from: 'hosp_poe', to: 'poe_id', ...edgeStyles.blue },
    { from: 'hosp_poe', to: 'poe_order_type', ...edgeStyles.blue },
    { from: 'hosp_poe', to: 'subject_id', ...edgeStyles.purple },
    { from: 'hosp_poe', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'hosp_poe', to: 'hosp_provider_id', ...edgeStyles.purple },

    // PRESCRIPTIONS
    { from: 'hosp_prescriptions', to: 'rx_drug', ...edgeStyles.blue },
    { from: 'hosp_prescriptions', to: 'rx_gsn_ndc', ...edgeStyles.blue },
    { from: 'hosp_prescriptions', to: 'subject_id', ...edgeStyles.purple },
    { from: 'hosp_prescriptions', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'hosp_prescriptions', to: 'pharm_id', ...edgeStyles.purple },
    { from: 'hosp_prescriptions', to: 'poe_id', ...edgeStyles.purple },
    { from: 'hosp_prescriptions', to: 'hosp_provider_id', ...edgeStyles.purple },

    // PHARMACY
    { from: 'hosp_pharmacy', to: 'pharm_id', ...edgeStyles.blue },
    { from: 'hosp_pharmacy', to: 'subject_id', ...edgeStyles.purple },
    { from: 'hosp_pharmacy', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'hosp_pharmacy', to: 'poe_id', ...edgeStyles.purple },

    // EMAR
    { from: 'hosp_emar', to: 'emar_charttime', ...edgeStyles.blue },
    { from: 'hosp_emar', to: 'subject_id', ...edgeStyles.purple },
    { from: 'hosp_emar', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'hosp_emar', to: 'pharm_id', ...edgeStyles.purple },
    { from: 'hosp_emar', to: 'poe_id', ...edgeStyles.purple },

    // DIAGNOSES_ICD
    { from: 'hosp_diagnoses_icd', to: 'h_diag_icd_code', ...edgeStyles.blue },
    { from: 'hosp_diagnoses_icd', to: 'h_diag_icd_version', ...edgeStyles.blue },
    { from: 'hosp_diagnoses_icd', to: 'subject_id', ...edgeStyles.purple },
    { from: 'hosp_diagnoses_icd', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'h_diag_icd_code', to: 'hosp_d_icd_diagnoses', ...edgeStyles.purple },

    // PROCEDURES_ICD
    { from: 'hosp_procedures_icd', to: 'h_proc_icd_code', ...edgeStyles.blue },
    { from: 'hosp_procedures_icd', to: 'h_proc_chartdate', ...edgeStyles.blue },
    { from: 'hosp_procedures_icd', to: 'subject_id', ...edgeStyles.purple },
    { from: 'hosp_procedures_icd', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'h_proc_icd_code', to: 'hosp_d_icd_procedures', ...edgeStyles.purple },

    // DRGCODES
    { from: 'hosp_drgcodes', to: 'h_drg_code', ...edgeStyles.blue },
    { from: 'hosp_drgcodes', to: 'h_drg_severity', ...edgeStyles.blue },
    { from: 'hosp_drgcodes', to: 'subject_id', ...edgeStyles.purple },
    { from: 'hosp_drgcodes', to: 'hadm_id', ...edgeStyles.purple },

    // HCPCSEVENTS
    { from: 'hosp_hcpcsevents', to: 'h_hcpcs_cd', ...edgeStyles.blue },
    { from: 'hosp_hcpcsevents', to: 'subject_id', ...edgeStyles.purple },
    { from: 'hosp_hcpcsevents', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'h_hcpcs_cd', to: 'hosp_d_hcpcs', ...edgeStyles.purple },

    // SERVICES
    { from: 'hosp_services', to: 'h_curr_service', ...edgeStyles.blue },
    { from: 'hosp_services', to: 'subject_id', ...edgeStyles.purple },
    { from: 'hosp_services', to: 'hadm_id', ...edgeStyles.purple },

    // MICROBIOLOGY
    { from: 'hosp_microbiologyevents', to: 'h_micro_spec_desc', ...edgeStyles.blue },
    { from: 'hosp_microbiologyevents', to: 'h_micro_org_name', ...edgeStyles.blue },
    { from: 'hosp_microbiologyevents', to: 'h_micro_interpretation', ...edgeStyles.blue },
    { from: 'hosp_microbiologyevents', to: 'subject_id', ...edgeStyles.purple },
    { from: 'hosp_microbiologyevents', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'hosp_microbiologyevents', to: 'hosp_provider_id', ...edgeStyles.purple },

    // OMR
    { from: 'hosp_omr', to: 'h_omr_result_name', ...edgeStyles.blue },
    { from: 'hosp_omr', to: 'h_omr_result_value', ...edgeStyles.blue },
    { from: 'hosp_omr', to: 'subject_id', ...edgeStyles.purple },

    // DETAILS
    { from: 'h_poe_detail', to: 'subject_id', ...edgeStyles.purple },
    { from: 'h_poe_detail', to: 'poe_id', ...edgeStyles.purple },
    { from: 'h_emar_detail', to: 'h_emar_dose_given', ...edgeStyles.blue },
    { from: 'h_emar_detail', to: 'subject_id', ...edgeStyles.purple },
    { from: 'h_emar_detail', to: 'pharm_id', ...edgeStyles.purple },
];

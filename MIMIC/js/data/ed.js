// ================================================================
// ED MODULE: Emergency Department Tables
// Tables: edstays, diagnosis, pyxis, medrecon, triage, vitalsign
// ================================================================

const edNodes = [
    // === EDSTAYS: TABLE NODE ===
    { id: 'edstays', label: 'ed/edstays\n(ED visit tracking)', ...nodeStyles.file, description: 'Primary tracking table for emergency department visits. Provides entrance and exit times.' },
    
    // === EDSTAYS: VARIABLE NODES (non-connector) ===
    { id: 'ed_intime', label: 'intime\n(admission time)', ...nodeStyles.variable, description: 'Type: TIMESTAMP(0)\nAdmission datetime of the ED stay.' },
    { id: 'ed_outtime', label: 'outtime\n(discharge time)', ...nodeStyles.variable, description: 'Type: TIMESTAMP(0)\nDischarge datetime of the ED stay.' },
    { id: 'ed_gender', label: 'gender', ...nodeStyles.variable, description: "Type: VARCHAR(1)\nPatient's administrative gender as documented in the hospital system." },
    { id: 'ed_arrival_transport', label: 'arrival_transport\n(arrival method)', ...nodeStyles.variable, description: 'Type: VARCHAR(50)\nMethod of arrival: WALK IN, AMBULANCE, UNKNOWN, OTHER, HELICOPTER.' },
    { id: 'ed_disposition', label: 'disposition\n(discharge method)', ...nodeStyles.variable, description: 'Type: VARCHAR(255)\nMethod of exit: HOME, ADMITTED, TRANSFER, LEFT WITHOUT BEING SEEN, OTHER, LEFT AGAINST MEDICAL ADVICE, ELOPED, EXPIRED.' },
    
    // (Descriptor nodes removed)
    
    // === ED DIAGNOSIS: TABLE NODE ===
    { id: 'ed_diagnosis', label: 'ed/diagnosis\n(ED billed diagnoses)', ...nodeStyles.file, description: 'Provides billed diagnoses for patients, determined after discharge from the ED.' },
    
    // === ED DIAGNOSIS: VARIABLE NODES ===
    { id: 'diag_seq_num', label: 'seq_num\n(diagnosis priority)', ...nodeStyles.variable, description: 'Type: INTEGER\nA pseudo-priority. seq_num of 1 usually indicates a "primary" diagnosis.' },
    { id: 'diag_icd_code', label: 'icd_code\n(ICD diagnosis code)', ...nodeStyles.variable, description: 'Type: VARCHAR(10)\nCoded diagnosis using the International Classification of Diseases (ICD) ontology.' },
    { id: 'diag_icd_version', label: 'icd_version\n(ICD-9 or ICD-10)', ...nodeStyles.variable, description: 'Type: INTEGER\nVersion of ICD (9 or 10). Meaning of icd_code depends on this version.' },
    { id: 'diag_icd_title', label: 'icd_title\n(diagnosis description)', ...nodeStyles.variable, description: 'Type: TEXT\nTextual description of the diagnosis.' },
    
    // (Descriptor nodes removed)
    
    // === ED PYXIS: TABLE NODE ===
    { id: 'ed_pyxis', label: 'ed/pyxis\n(medication dispensations)', ...nodeStyles.file, description: 'Provides information for medicine dispensations made via the Pyxis system.' },
    
    // === ED PYXIS: VARIABLE NODES ===
    { id: 'pyxis_charttime', label: 'charttime\n(administration time)', ...nodeStyles.variable, description: 'Type: TIMESTAMP(0)\nThe time at which the medication was charted (approx. administration time).' },
    { id: 'pyxis_med_rn', label: 'med_rn\n(dispensation group)', ...nodeStyles.variable, description: 'Type: SMALLINT\nA row number for the medicine used to group single dispensations.' },
    { id: 'pyxis_name', label: 'name\n(medicine name)', ...nodeStyles.variable, description: 'Type: VARCHAR(255)\nThe name of the medicine.' },
    { id: 'pyxis_gsn_rn', label: 'gsn_rn\n(GSN row number)', ...nodeStyles.variable, description: 'Type: SMALLINT\nDifferentiates multiple groups in the GSN ontology for a single medicine.' },
    { id: 'pyxis_gsn', label: 'gsn\n(Generic Sequence Number)', ...nodeStyles.variable, description: 'Type: VARCHAR(10)\nThe Generic Sequence Number (GSN) ontology code for the medicine.' },
    
    // (Descriptor nodes removed)
    
    // === ED MEDRECON: TABLE NODE ===
    { id: 'ed_medrecon', label: 'ed/medrecon\n(medication reconciliation)', ...nodeStyles.file, description: 'Document medications a patient is currently taking, findings of the care providers.' },
    
    // === ED MEDRECON: VARIABLE NODES ===
    { id: 'medrecon_charttime', label: 'charttime\n(reconciliation time)', ...nodeStyles.variable, description: 'Type: TIMESTAMP(0)\nThe time at which the medicine reconciliation was charted.' },
    { id: 'medrecon_name', label: 'name\n(medication name)', ...nodeStyles.variable, description: 'Type: VARCHAR(255)\nThe name of the medication.' },
    { id: 'medrecon_gsn', label: 'gsn\n(Generic Sequence Number)', ...nodeStyles.variable, description: 'Type: VARCHAR(10)\nThe Generic Sequence Number (GSN), an ontology for the medication.' },
    { id: 'medrecon_ndc', label: 'ndc\n(National Drug Code)', ...nodeStyles.variable, description: 'Type: VARCHAR(12)\nThe National Drug Code (ndc) for the medication.' },
    { id: 'medrecon_etc_rn', label: 'etc_rn\n(ETC row number)', ...nodeStyles.variable, description: 'Type: SMALLINT\nEnhanced Therapeutic Class (ETC) row number. Used to differentiate groups.' },
    { id: 'medrecon_etccode', label: 'etccode\n(ETC code)', ...nodeStyles.variable, description: 'Type: VARCHAR(8)\nEnhanced Therapeutic Class (ETC) code.' },
    { id: 'medrecon_etcdesc', label: 'etcdescription\n(ETC description)', ...nodeStyles.variable, description: 'Type: VARCHAR(255)\nEnhanced Therapeutic Class (ETC) description.' },
    
    // (Descriptor nodes removed)
    
    // === ED TRIAGE: TABLE NODE ===
    { id: 'ed_triage', label: 'ed/triage\n(ED triage assessment)', ...nodeStyles.file, description: 'Store information collected on triage to the emergency department, including vitals and acuity.' },
    
    // === ED TRIAGE: VARIABLE NODES ===
    { id: 'triage_temperature', label: 'temperature\n(degrees Fahrenheit)', ...nodeStyles.variable, description: "Type: NUMERIC(10, 4)\nPatient's temperature in degrees Fahrenheit at triage." },
    { id: 'triage_heartrate', label: 'heartrate\n(beats per minute)', ...nodeStyles.variable, description: "Type: NUMERIC(10, 4)\nPatient's heart rate in beats per minute at triage." },
    { id: 'triage_resprate', label: 'resprate\n(breaths per minute)', ...nodeStyles.variable, description: "Type: NUMERIC(10, 4)\nPatient's respiratory rate in breaths per minute at triage." },
    { id: 'triage_o2sat', label: 'o2sat\n(oxygen saturation %)', ...nodeStyles.variable, description: "Type: NUMERIC(10, 4)\nPatient's peripheral oxygen saturation as a percentage at triage." },
    { id: 'triage_sbp', label: 'sbp\n(systolic BP, mmHg)', ...nodeStyles.variable, description: "Type: NUMERIC(10, 4)\nPatient's systolic blood pressure (mmHg) at triage." },
    { id: 'triage_dbp', label: 'dbp\n(diastolic BP, mmHg)', ...nodeStyles.variable, description: "Type: NUMERIC(10, 4)\nPatient's diastolic blood pressure (mmHg) at triage." },
    { id: 'triage_pain', label: 'pain\n(self-reported 0-10)', ...nodeStyles.variable, description: "Type: TEXT\nLevel of pain self-reported by the patient, usually 0-10." },
    { id: 'triage_acuity', label: 'acuity\n(ESI level 1-5)', ...nodeStyles.variable, description: 'Type: NUMERIC(10, 4)\nESI Five Level Triage System (1=Highest priority, 5=Lowest priority). 1: Immediate life-saving intervention. 2: High risk/unstable. 3: 2+ resources needed. 4: 1 resource. 5: No resources.' },
    { id: 'triage_chiefcomplaint', label: 'chiefcomplaint\n(deidentified text)', ...nodeStyles.variable, description: "Type: VARCHAR(255)\nDeidentified free-text description of the patient's chief complaint." },
    
    // (Descriptor nodes removed)
    
    // === ED VITALSIGN: TABLE NODE ===
    { id: 'ed_vitalsign', label: 'ed/vitalsign\n(routine vital signs)', ...nodeStyles.file, description: 'Provides routine vital signs (e.g., heart rate, BP, oxygen saturation) taken every 1-4 hours during the ED stay.' },
    
    // === ED VITALSIGN: VARIABLE NODES ===
    { id: 'vs_charttime', label: 'charttime\n(measurement time)', ...nodeStyles.variable, description: 'Type: TIMESTAMP(0)\nThe time at which the vital signs were charted.' },
    { id: 'vs_temperature', label: 'temperature\n(degrees Fahrenheit)', ...nodeStyles.variable, description: "Type: NUMERIC(10, 4)\nPatient's temperature in degrees Fahrenheit." },
    { id: 'vs_heartrate', label: 'heartrate\n(beats per minute)', ...nodeStyles.variable, description: "Type: NUMERIC(10, 4)\nPatient's heart rate in beats per minute." },
    { id: 'vs_resprate', label: 'resprate\n(breaths per minute)', ...nodeStyles.variable, description: "Type: NUMERIC(10, 4)\nPatient's respiratory rate in breaths per minute." },
    { id: 'vs_o2sat', label: 'o2sat\n(oxygen saturation %)', ...nodeStyles.variable, description: "Type: NUMERIC(10, 4)\nPatient's oxygen saturation measured as a percentage." },
    { id: 'vs_sbp', label: 'sbp\n(systolic BP, mmHg)', ...nodeStyles.variable, description: "Type: INTEGER\nPatient's systolic blood pressure (mmHg)." },
    { id: 'vs_dbp', label: 'dbp\n(diastolic BP, mmHg)', ...nodeStyles.variable, description: "Type: INTEGER\nPatient's diastolic blood pressure (mmHg)." },
    { id: 'vs_rhythm', label: 'rhythm\n(heart rhythm)', ...nodeStyles.variable, description: "Type: TEXT\nPatient's documented heart rhythm." },
    { id: 'vs_pain', label: 'pain\n(self-reported 0-10)', ...nodeStyles.variable, description: "Type: TEXT\nPatient's self-reported level of pain on a scale from 0-10." },
    
    // (Descriptor nodes removed)
];

const edEdges = [
    // === EDSTAYS EDGES ===
    // Blue edges - Links from edstays table to its columns
    { from: 'edstays', to: 'ed_intime', ...edgeStyles.blue },
    { from: 'edstays', to: 'ed_outtime', ...edgeStyles.blue },
    { from: 'edstays', to: 'ed_gender', ...edgeStyles.blue },
    { from: 'edstays', to: 'ed_arrival_transport', ...edgeStyles.blue },
    { from: 'edstays', to: 'ed_disposition', ...edgeStyles.blue },
    { from: 'edstays', to: 'race', ...edgeStyles.blue },
    
    // Purple edges - EDstays to connector nodes
    { from: 'edstays', to: 'subject_id', ...edgeStyles.purple },
    { from: 'edstays', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'edstays', to: 'stay_id', ...edgeStyles.purple },
    
    // Blue edge - EDstays derived from transfers
    { from: 'edstays', to: 'transfers', ...edgeStyles.blue },
    
    // === ED DIAGNOSIS EDGES ===
    // Blue edges - Links from ed_diagnosis table to its columns
    { from: 'ed_diagnosis', to: 'diag_seq_num', ...edgeStyles.blue },
    { from: 'ed_diagnosis', to: 'diag_icd_code', ...edgeStyles.blue },
    { from: 'ed_diagnosis', to: 'diag_icd_version', ...edgeStyles.blue },
    { from: 'ed_diagnosis', to: 'diag_icd_title', ...edgeStyles.blue },
    
    // Purple edges - ED Diagnosis to connector nodes
    { from: 'ed_diagnosis', to: 'subject_id', ...edgeStyles.purple },
    { from: 'ed_diagnosis', to: 'stay_id', ...edgeStyles.purple },
    
    // === ED PYXIS EDGES ===
    // Blue edges - Links from ed_pyxis table to its columns
    { from: 'ed_pyxis', to: 'pyxis_charttime', ...edgeStyles.blue },
    { from: 'ed_pyxis', to: 'pyxis_med_rn', ...edgeStyles.blue },
    { from: 'ed_pyxis', to: 'pyxis_name', ...edgeStyles.blue },
    { from: 'ed_pyxis', to: 'pyxis_gsn_rn', ...edgeStyles.blue },
    { from: 'ed_pyxis', to: 'pyxis_gsn', ...edgeStyles.blue },
    
    // Purple edges - ED Pyxis to connector nodes
    { from: 'ed_pyxis', to: 'subject_id', ...edgeStyles.purple },
    { from: 'ed_pyxis', to: 'stay_id', ...edgeStyles.purple },
    
    // === ED MEDRECON EDGES ===
    // Blue edges - Links from ed_medrecon table to its columns
    { from: 'ed_medrecon', to: 'medrecon_charttime', ...edgeStyles.blue },
    { from: 'ed_medrecon', to: 'medrecon_name', ...edgeStyles.blue },
    { from: 'ed_medrecon', to: 'medrecon_gsn', ...edgeStyles.blue },
    { from: 'ed_medrecon', to: 'medrecon_ndc', ...edgeStyles.blue },
    { from: 'ed_medrecon', to: 'medrecon_etc_rn', ...edgeStyles.blue },
    { from: 'ed_medrecon', to: 'medrecon_etccode', ...edgeStyles.blue },
    { from: 'ed_medrecon', to: 'medrecon_etcdesc', ...edgeStyles.blue },
    
    // Purple edges - ED Medrecon to connector nodes
    { from: 'ed_medrecon', to: 'subject_id', ...edgeStyles.purple },
    { from: 'ed_medrecon', to: 'stay_id', ...edgeStyles.purple },
    
    // === ED TRIAGE EDGES ===
    // Blue edges - Links from ed_triage table to its columns
    { from: 'ed_triage', to: 'triage_temperature', ...edgeStyles.blue },
    { from: 'ed_triage', to: 'triage_heartrate', ...edgeStyles.blue },
    { from: 'ed_triage', to: 'triage_resprate', ...edgeStyles.blue },
    { from: 'ed_triage', to: 'triage_o2sat', ...edgeStyles.blue },
    { from: 'ed_triage', to: 'triage_sbp', ...edgeStyles.blue },
    { from: 'ed_triage', to: 'triage_dbp', ...edgeStyles.blue },
    { from: 'ed_triage', to: 'triage_pain', ...edgeStyles.blue },
    { from: 'ed_triage', to: 'triage_acuity', ...edgeStyles.blue },
    { from: 'ed_triage', to: 'triage_chiefcomplaint', ...edgeStyles.blue },
    
    // Purple edges - ED Triage to connector nodes
    { from: 'ed_triage', to: 'subject_id', ...edgeStyles.purple },
    { from: 'ed_triage', to: 'stay_id', ...edgeStyles.purple },
    
    // === ED VITALSIGN EDGES ===
    // Blue edges - Links from ed_vitalsign table to its columns
    { from: 'ed_vitalsign', to: 'vs_charttime', ...edgeStyles.blue },
    { from: 'ed_vitalsign', to: 'vs_temperature', ...edgeStyles.blue },
    { from: 'ed_vitalsign', to: 'vs_heartrate', ...edgeStyles.blue },
    { from: 'ed_vitalsign', to: 'vs_resprate', ...edgeStyles.blue },
    { from: 'ed_vitalsign', to: 'vs_o2sat', ...edgeStyles.blue },
    { from: 'ed_vitalsign', to: 'vs_sbp', ...edgeStyles.blue },
    { from: 'ed_vitalsign', to: 'vs_dbp', ...edgeStyles.blue },
    { from: 'ed_vitalsign', to: 'vs_rhythm', ...edgeStyles.blue },
    { from: 'ed_vitalsign', to: 'vs_pain', ...edgeStyles.blue },
    
    // Purple edges - ED Vitalsign to connector nodes
    { from: 'ed_vitalsign', to: 'subject_id', ...edgeStyles.purple },
    { from: 'ed_vitalsign', to: 'stay_id', ...edgeStyles.purple },
];

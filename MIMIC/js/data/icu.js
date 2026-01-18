// ================================================================
// ICU MODULE: ICU Tables
// Tables: icustays
// ================================================================

const icuNodes = [
    // === ICUSTAYS: TABLE NODE ===
    { id: 'icustays', label: 'icu/icustays\n(ICU stay tracking)', ...nodeStyles.file, description: 'Defines each ICU stay in the database. Derived from transfers table, merging consecutive ICU entries.' },
    
    // === ICUSTAYS: VARIABLE NODES (non-connector) ===
    { id: 'i_first_careunit', label: 'first_careunit\n(first ICU type)', ...nodeStyles.variable, description: 'Type: VARCHAR(20)\nThe first ICU type in which the patient was cared for.' },
    { id: 'i_last_careunit', label: 'last_careunit\n(last ICU type)', ...nodeStyles.variable, description: 'Type: VARCHAR(20)\nThe last ICU type in which the patient was cared for.' },
    { id: 'i_intime', label: 'intime\n(ICU admission time)', ...nodeStyles.variable, description: 'Type: TIMESTAMP(0)\nThe date and time the patient was transferred into the ICU.' },
    { id: 'i_outtime', label: 'outtime\n(ICU discharge time)', ...nodeStyles.variable, description: 'Type: TIMESTAMP(0)\nThe date and time the patient was transferred out of the ICU.' },
    { id: 'i_los', label: 'los\n(length of stay)', ...nodeStyles.variable, description: 'Type: DOUBLE PRECISION\nLength of stay in fractional days. May include multiple ICU units.' },

    // === CAREGIVER: TABLE NODE ===
    { id: 'icu_caregiver', label: 'icu/caregiver\n(ICU providers)', ...nodeStyles.file, description: 'Lists deidentified provider identifiers used specifically within the ICU module (MetaVision).' },

    // === CAREGIVER: VARIABLE NODES ===
    { id: 'icu_caregiver_id', label: 'caregiver_id\n(unique ICU provider ID)', ...nodeStyles.variable, description: 'Type: VARCHAR(10)\nUnique identifier for an ICU caregiver.' },

    // === D_ITEMS: TABLE NODE ===
    { id: 'icu_d_items', label: 'icu/d_items\n(ICU item dictionary)', ...nodeStyles.file, description: 'Definition table for all items in the ICU databases (MetaVision).' },

    // === D_ITEMS: VARIABLE NODES ===
    { id: 'icu_itemid', label: 'itemid\n(unique ICU concept ID)', ...nodeStyles.variable, description: 'Type: INTEGER\nIdentifier for a single measurement type in the ICU database.' },
    { id: 'icu_d_label', label: 'label\n(concept description)', ...nodeStyles.variable, description: 'Type: VARCHAR(200)\nDescribes the concept represented by the itemid.' },
    { id: 'icu_d_category', label: 'category\n(measurement type)', ...nodeStyles.variable, description: 'Type: VARCHAR(100)\nHigh-level classification of the item (e.g., ABG, IV Medication).' },

    // === CHARTEVENTS: TABLE NODE ===
    { id: 'icu_chartevents', label: 'icu/chartevents\n(charted ICU data)', ...nodeStyles.file, description: 'Contains the majority of information documented in the ICU, including routine vitals and ventilator settings.' },

    // === CHARTEVENTS: VARIABLE NODES ===
    { id: 'icu_chart_value', label: 'value / valuenum\n(charted value)', ...nodeStyles.variable, description: 'Type: VARCHAR(200) / DOUBLE PRECISION\nThe measured value. valuenum is the numeric representation if applicable.' },
    { id: 'icu_chart_time', label: 'charttime\n(observation time)', ...nodeStyles.variable, description: 'Type: TIMESTAMP(0)\nThe time at which an observation was made.' },

    // === DATETIMEEVENTS: TABLE NODE ===
    { id: 'icu_datetimeevents', label: 'icu/datetimeevents\n(date/time formatted data)', ...nodeStyles.file, description: 'Contains all ICU data formatted as dates or times (e.g., date of last dialysis).' },

    // === DATETIMEEVENTS: VARIABLE NODES ===
    { id: 'icu_dt_value', label: 'value\n(documented date)', ...nodeStyles.variable, description: 'Type: TIMESTAMP(3)\nThe documented date/time value for the specific itemid.' },

    // === INPUTEVENTS: TABLE NODE ===
    { id: 'icu_inputevents', label: 'icu/inputevents\n(fluid/medication inputs)', ...nodeStyles.file, description: 'Contains information regarding continuous infusions or intermittent administrations.' },

    // === INPUTEVENTS: VARIABLE NODES ===
    { id: 'icu_input_amount', label: 'amount\n(amount administered)', ...nodeStyles.variable, description: 'Type: DOUBLE PRECISION\nAmount of a drug or substance administered between starttime and endtime.' },
    { id: 'icu_input_rate', label: 'rate\n(administration rate)', ...nodeStyles.variable, description: 'Type: DOUBLE PRECISION\nRate at which the drug or substance was administered.' },

    // === INGREDIENTEVENTS: TABLE NODE ===
    { id: 'icu_ingredientevents', label: 'icu/ingredientevents\n(input ingredients)', ...nodeStyles.file, description: 'Details ingredients within inputs (nutritional, water content). Shares structure with inputevents.' },

    // === OUTPUTEVENTS: TABLE NODE ===
    { id: 'icu_outputevents', label: 'icu/outputevents\n(patient outputs)', ...nodeStyles.file, description: 'Information regarding patient outputs including urine, drainage, etc.' },

    // === OUTPUTEVENTS: VARIABLE NODES ===
    { id: 'icu_output_value', label: 'value\n(output volume)', ...nodeStyles.variable, description: 'Type: DOUBLE PRECISION\nAmount of substance output at the charttime.' },

    // === PROCEDUREEVENTS: TABLE NODE ===
    { id: 'icu_procedureevents', label: 'icu/procedureevents\n(documented procedures)', ...nodeStyles.file, description: 'Contains procedures documented during the ICU stay (e.g., ventilation, imaging).' },

    // === PROCEDUREEVENTS: VARIABLE NODES ===
    { id: 'icu_proc_value', label: 'value\n(procedure duration)', ...nodeStyles.variable, description: 'Type: DOUBLE PRECISION\nIdentifies the duration of the procedure (if applicable).' },
];

const icuEdges = [
    // Blue edges - Links from icustays table to its columns
    { from: 'icustays', to: 'i_first_careunit', ...edgeStyles.blue },
    { from: 'icustays', to: 'i_last_careunit', ...edgeStyles.blue },
    { from: 'icustays', to: 'i_intime', ...edgeStyles.blue },
    { from: 'icustays', to: 'i_outtime', ...edgeStyles.blue },
    { from: 'icustays', to: 'i_los', ...edgeStyles.blue },
    
    // Purple edges - ICUstays to connector nodes
    { from: 'icustays', to: 'subject_id', ...edgeStyles.purple },
    { from: 'icustays', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'icustays', to: 'stay_id', ...edgeStyles.purple },
    
    // Blue edge - ICUstays derived from transfers
    { from: 'icustays', to: 'transfers', ...edgeStyles.blue },

    // CAREGIVER EDGES
    { from: 'icu_caregiver', to: 'icu_caregiver_id', ...edgeStyles.blue },

    // D_ITEMS EDGES
    { from: 'icu_d_items', to: 'icu_itemid', ...edgeStyles.blue },
    { from: 'icu_d_items', to: 'icu_d_label', ...edgeStyles.blue },
    { from: 'icu_d_items', to: 'icu_d_category', ...edgeStyles.blue },

    // CHARTEVENTS EDGES
    { from: 'icu_chartevents', to: 'icu_chart_value', ...edgeStyles.blue },
    { from: 'icu_chartevents', to: 'icu_chart_time', ...edgeStyles.blue },
    { from: 'icu_chartevents', to: 'subject_id', ...edgeStyles.purple },
    { from: 'icu_chartevents', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'icu_chartevents', to: 'stay_id', ...edgeStyles.purple },
    { from: 'icu_chartevents', to: 'icu_itemid', ...edgeStyles.purple },
    { from: 'icu_chartevents', to: 'icu_caregiver_id', ...edgeStyles.purple },

    // DATETIMEEVENTS EDGES
    { from: 'icu_datetimeevents', to: 'icu_dt_value', ...edgeStyles.blue },
    { from: 'icu_datetimeevents', to: 'subject_id', ...edgeStyles.purple },
    { from: 'icu_datetimeevents', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'icu_datetimeevents', to: 'stay_id', ...edgeStyles.purple },
    { from: 'icu_datetimeevents', to: 'icu_itemid', ...edgeStyles.purple },
    { from: 'icu_datetimeevents', to: 'icu_caregiver_id', ...edgeStyles.purple },

    // INPUTEVENTS EDGES
    { from: 'icu_inputevents', to: 'icu_input_amount', ...edgeStyles.blue },
    { from: 'icu_inputevents', to: 'icu_input_rate', ...edgeStyles.blue },
    { from: 'icu_inputevents', to: 'subject_id', ...edgeStyles.purple },
    { from: 'icu_inputevents', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'icu_inputevents', to: 'stay_id', ...edgeStyles.purple },
    { from: 'icu_inputevents', to: 'icu_itemid', ...edgeStyles.purple },
    { from: 'icu_inputevents', to: 'icu_caregiver_id', ...edgeStyles.purple },

    // INGREDIENTEVENTS EDGES
    { from: 'icu_ingredientevents', to: 'subject_id', ...edgeStyles.purple },
    { from: 'icu_ingredientevents', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'icu_ingredientevents', to: 'stay_id', ...edgeStyles.purple },
    { from: 'icu_ingredientevents', to: 'icu_itemid', ...edgeStyles.purple },
    { from: 'icu_ingredientevents', to: 'icu_caregiver_id', ...edgeStyles.purple },

    // OUTPUTEVENTS EDGES
    { from: 'icu_outputevents', to: 'icu_output_value', ...edgeStyles.blue },
    { from: 'icu_outputevents', to: 'subject_id', ...edgeStyles.purple },
    { from: 'icu_outputevents', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'icu_outputevents', to: 'stay_id', ...edgeStyles.purple },
    { from: 'icu_outputevents', to: 'icu_itemid', ...edgeStyles.purple },
    { from: 'icu_outputevents', to: 'icu_caregiver_id', ...edgeStyles.purple },

    // PROCEDUREEVENTS EDGES
    { from: 'icu_procedureevents', to: 'icu_proc_value', ...edgeStyles.blue },
    { from: 'icu_procedureevents', to: 'subject_id', ...edgeStyles.purple },
    { from: 'icu_procedureevents', to: 'hadm_id', ...edgeStyles.purple },
    { from: 'icu_procedureevents', to: 'stay_id', ...edgeStyles.purple },
    { from: 'icu_procedureevents', to: 'icu_itemid', ...edgeStyles.purple },
    { from: 'icu_procedureevents', to: 'icu_caregiver_id', ...edgeStyles.purple },
];

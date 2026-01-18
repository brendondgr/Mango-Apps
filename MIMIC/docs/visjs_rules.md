# vis.js Network Graph Rules

This document outlines the styling and structure rules for the MIMIC-IV network visualization using vis.js.

## Node Types

The network uses four primary node types, each with distinct visual styling:

### 1. File/Table Nodes (`file`)

- **Shape:** `box` (rectangular with rounded corners)
- **Purpose:** Represents database tables and file sources
- **Color Scheme:**
  - Background: `#15803d` (Dark Forest Green)
  - Border: `#16a34a` (Medium Green)
  - Text: `#ffffff` (White)
- **Font:** DM Sans, 14px, bold
- **Example:** `hosp/admissions`, `hosp/patients`, `hosp/transfers`

### 2. Variable Nodes (`variable`)

- **Shape:** `ellipse` (oval/circular)
- **Purpose:** Represents columns, fields, or variables within tables
- **Color Scheme:**
  - Background: `#db2777` (Pink/Magenta)
  - Border: `#f472b6` (Light Pink)
  - Text: `#ffffff` (White)
- **Font:** DM Sans, 12px
- **Example:** `admittime`, `careunit`, `eventtype`

### 3. Connector Nodes (`connector`)

- **Shape:** `ellipse` (circle)
- **Purpose:** Cross-table linking variables that interconnect multiple files
- **Color Scheme:**
  - Background: `#78350f` (Deep Brown)
  - Border: `#92400e` (Light Brown)
  - Text: `#ffffff` (White)
- **Font:** DM Sans, 12px, bold
- **Visual Emphasis:** Larger shadow and thicker border
- **Example:** `subject_id`, `hadm_id`, `stay_id`

### 4. Descriptions

Descriptions are no longer separate nodes. They are now properties within the `file`, `variable`, or `connector` objects and are displayed in the sidebar upon interaction.

- **Property:** `description` (HTML string)
- **Interaction:** Click on a node to view its description in the right sidebar.

---

## Edge Types

Edges represent relationships between nodes. Three main edge color types are used:

### 1. Forest Green Edges (`blue`)

- **Color:** `#15803d`
- **Purpose:** Associated Variables - links from file/table nodes to their variables
- **Curve:** Curved clockwise (CW), roundness 0.15
- **Has arrows:** Points to the target variable

### 2. Red Edges (`red`)

- **Color:** `#ef4444`
- **Purpose:** Descriptor links - connections from variables/tables to their descriptors
- **Curve:** Curved counter-clockwise (CCW), roundness 0.2
- **Has arrows:** Points to the descriptor node

### 3. Deep Brown Edges (`purple`)

- **Color:** `#78350f`
- **Purpose:** Cross-table links - connections to/from connector nodes (subject_id, hadm_id, stay_id)
- **Curve:** Curved clockwise (CW), roundness 0.2
- **Has arrows:** Points to the connector node

---

## Layout & Physics

The network uses a **static grid layout** instead of a physics simulation to ensure structure and predictability.

- **Physics:** Disabled (`enabled: false`)
- **Table Nodes:** Manually pinned to "Regions" (HOSP=Left, ICU=Right, ED=Bottom).
- **Variable Nodes:** Programmatically arranged in a 2-column grid below their parent table.
- **Connector Nodes:** Pinned in a central triangle.

This creates a clean, "circuit-board" style map where items are easy to find and relationships are clear without organic movement.

---

## Background & Theme

The visualization uses a **dark theme** to enhance contrast:

- **Background:** `#1a1a2e` (Dark blue-purple)
- **Grid pattern:** 40px × 40px subtle lines at `rgba(51, 65, 85, 0.3)`
- **Surface elements:** `#16213e`
- **Border color:** `#334155`

---

## Adding New Nodes

To add a new node, use the following pattern in the `nodes` DataSet:

```javascript
// For a table/file:
{ id: 'unique_id', label: 'table/name\n(description)', ...nodeStyles.file }

// For a regular variable:
{ id: 'var_id', label: 'variable_name\n(short desc)', ...nodeStyles.variable }

// For a cross-table connector (subject_id, hadm_id, stay_id):
{ id: 'connector_id', label: 'connector_name\n(purpose)', ...nodeStyles.connector }

// For a descriptor:
{ id: 'desc_id', label: 'Multi-line\nexplanation text', ...nodeStyles.descriptor }
```

## Adding New Edges

To add a new edge, use the following pattern in the `edges` DataSet:

```javascript
// Blue - File/Table to Associated Variable (arrow points to variable):
{ from: 'table_id', to: 'variable_id', ...edgeStyles.blue }

// Red - Variable/Table to Descriptor (arrow points to descriptor):
{ from: 'variable_id', to: 'descriptor_id', ...edgeStyles.red }

// Purple - File/Table to Connector node (arrow points to connector):
{ from: 'table_id', to: 'connector_id', ...edgeStyles.purple }
```

---

## Interaction Features

- **Pan:** Click and drag on empty space
- **Zoom:** Scroll wheel
- **Select:** Click on nodes
- **Multi-select:** Hold Ctrl/Cmd and click
- **Focus:** Double-click on a node to zoom and center
- **Keyboard:** Arrow keys for navigation

---

## File Structure

```
mimic-mindmap/
├── index.html          # Main visualization (vis.js implementation)
├── docs/
│   ├── visjs_rules.md  # This file - vis.js styling rules
│   ├── ui.md           # UI design system
│   └── ...
└── app.py              # Flask server (optional)
```

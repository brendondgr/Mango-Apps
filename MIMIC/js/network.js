// ================================================================
// NETWORK INITIALIZATION
// Combines all module data and initializes the vis.js network
// ================================================================

// Combine all nodes from modules
const allNodes = [
    ...commonNodes,
    ...hospNodes,
    ...icuNodes,
    ...edNodes,
    ...cxrNodes,
    ...ecgNodes,
    ...noteNodes
];

// Combine all edges from modules
const allEdges = [
    ...commonEdges,
    ...hospEdges,
    ...icuEdges,
    ...edEdges,
    ...cxrEdges,
    ...ecgEdges,
    ...noteEdges
];

// ================================================================
// LAYOUT CALCULATION
// Enforce a structured grid layout for Tables and Variables
// ================================================================

// 1. Define Fixed Positions for Table Nodes (Roots)
const tableLayout = {
    // === NOTE MODULE (Top Sector - moved down and right) ===
    'note_discharge': { x: 200, y: -500 },
    'note_discharge_detail': { x: 500, y: -650 },
    'note_radiology': { x: -100, y: -500 },
    'note_radiology_detail': { x: 100, y: -650 },

    // === ICU MODULE (Right Sector - moved left) ===
    'icustays': { x: 700, y: 0 },
    'icu_caregiver': { x: 1000, y: -150 },
    'icu_d_items': { x: 1000, y: 150 },
    'icu_chartevents': { x: 1300, y: -300 },
    'icu_datetimeevents': { x: 1300, y: 0 },
    'icu_inputevents': { x: 1300, y: 300 },
    'icu_outputevents': { x: 1600, y: 150 },
    'icu_procedureevents': { x: 1600, y: -150 },
    'icu_ingredientevents': { x: 1600, y: 450 },

    // === ED MODULE (Bottom-Right - spread vertically, moved closer) ===
    'edstays': { x: 600, y: 600 },
    'ed_diagnosis': { x: 900, y: 600 },
    'ed_pyxis': { x: 1200, y: 600 },
    'ed_medrecon': { x: 900, y: 1000 },
    'ed_triage': { x: 500, y: 1000 },
    'ed_vitalsign': { x: 1200, y: 1000 },

    // === ECG MODULE (Top-Left - moved down and right) ===
    'ecg_record_list': { x: -500, y: -500 },
    'ecg_machine_measurements': { x: -800, y: -650 },
    'ecg_waveform_note_links': { x: -500, y: -750 },

    // === CXR MODULE (Left - moved closer) ===
    'cxr_record_list': { x: -1000, y: -100 },

    // === HOSP MODULE (Bottom & Left Arc - moved up and right, tighter) ===
    'admissions': { x: -400, y: 350 },
    'patients': { x: -700, y: 350 },
    'transfers': { x: 0, y: 350 },
    'hosp_provider': { x: -1300, y: 350 },

    'labevents': { x: -400, y: 750 },
    'd_labitems': { x: -250, y: 600 },

    'hosp_poe': { x: -700, y: 750 },
    'h_poe_detail': { x: -950, y: 750 },

    'hosp_prescriptions': { x: -1250, y: 750 },
    'hosp_pharmacy': { x: -1550, y: 750 },
    'hosp_emar': { x: -1700, y: 750 },
    'h_emar_detail': { x: -2100, y: 750 },

    'hosp_diagnoses_icd': { x: -700, y: 1150 },
    'hosp_d_icd_diagnoses': { x: -450, y: 1150 },

    'hosp_procedures_icd': { x: -1000, y: 1150 },
    'hosp_d_icd_procedures': { x: -1250, y: 1150 },

    'hosp_drgcodes': { x: -1550, y: 1150 },
    'hosp_hcpcsevents': { x: -1850, y: 1150 },
    'hosp_d_hcpcs': { x: -2100, y: 1150 },

    'hosp_services': { x: -400, y: 1150 },
    'hosp_omr': { x: -100, y: 1150 },
    'hosp_microbiologyevents': { x: 20, y: 750 },
};

// 2. Helper: Group Variables by their Parent Table
const tableVariables = {};
// Initialize arrays
Object.keys(tableLayout).forEach(id => tableVariables[id] = []);

// Scan edges to find Table -> Variable links (Blue edges)
allEdges.forEach(edge => {
    if (tableLayout[edge.from]) {
        const targetNode = allNodes.find(n => n.id === edge.to);
        if (targetNode && targetNode.shape === 'ellipse' && !targetNode.fixed) {
            tableVariables[edge.from].push(targetNode);
        }
    }
});

// 3. Apply Coordinates
allNodes.forEach(node => {
    if (tableLayout[node.id]) {
        node.x = tableLayout[node.id].x;
        node.y = tableLayout[node.id].y;
        node.fixed = true;
    }
});

// B. Apply Variable Grid Coordinates
Object.keys(tableVariables).forEach(tableId => {
    const vars = tableVariables[tableId];
    const origin = tableLayout[tableId];

    // Grid settings - tighter spacing for HOSP
    const cols = 2;
    const xSpacing = 160; // Reduced spacing
    const ySpacing = 80;  // Reduced spacing
    const yStartOffset = 100; // Start below the table

    vars.forEach((node, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);

        const xOffset = (col * xSpacing) - ((cols - 1) * xSpacing / 2);

        node.x = origin.x + xOffset;
        node.y = origin.y + yStartOffset + (row * ySpacing);
        node.fixed = true;
    });
});


// Create DataSets
const nodes = new vis.DataSet(allNodes);
const edges = new vis.DataSet(allEdges);

// Get DOM elements
const container = document.getElementById('network');
const loading = document.getElementById('loading');

const data = { nodes: nodes, edges: edges };

const options = {
    physics: {
        enabled: false, // Disable physics for static grid layout
        stabilization: false
    },
    interaction: {
        hover: true,
        tooltipDelay: 200,
        zoomView: true,
        dragView: true,
        multiselect: true,
        navigationButtons: false,
        keyboard: {
            enabled: true,
            speed: { x: 10, y: 10, zoom: 0.02 }
        }
    },
    nodes: {
        shapeProperties: {
            borderRadius: 6
        }
    },
    edges: {
        smooth: {
            enabled: true,
            type: 'dynamic'
        },
        hoverWidth: 2
    }
};

// Create network
const network = new vis.Network(container, data, options);

// Hide loading overlay immediately (since physics/stabilization is disabled)
network.once('afterDrawing', function () {
    loading.style.opacity = '0';
    setTimeout(() => {
        loading.style.display = 'none';
    }, 500);
    // Initial fit to ensure everything is visible
    network.fit();
});

// Button handlers
document.getElementById('fit-btn').addEventListener('click', () => {
    network.fit({
        animation: {
            duration: 500,
            easingFunction: 'easeInOutQuad'
        }
    });
});

document.getElementById('reset-btn').addEventListener('click', () => {
    network.fit({
        animation: {
            duration: 500,
            easingFunction: 'easeInOutQuad'
        }
    });
});

// Sidebar Toggle Logic
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const toggleIcon = document.getElementById('toggle-icon');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    toggleIcon.textContent = sidebar.classList.contains('collapsed') ? '⟨' : '⟩';
});

// Reveal All Logic
function revealAll() {
    const allNodesUpdate = nodes.getIds().map(id => ({ id: id, hidden: false }));
    const allEdgesUpdate = edges.getIds().map(id => ({ id: id, hidden: false }));
    nodes.update(allNodesUpdate);
    edges.update(allEdgesUpdate);

    // Reset module visibility states and UI
    Object.keys(moduleStates).forEach(prefix => {
        moduleStates[prefix] = false;
    });

    document.querySelectorAll('.module-btn').forEach(btn => {
        btn.classList.remove('hidden-module');
    });
}

document.getElementById('reveal-btn').addEventListener('click', revealAll);
window.revealAll = revealAll;

// Helper function to hide a node and its edges
function hideNode(nodeId) {
    // Hide the node
    nodes.update({ id: nodeId, hidden: true });

    // Hide associated edges
    const connectedEdges = network.getConnectedEdges(nodeId);
    connectedEdges.forEach(edgeId => {
        edges.update({ id: edgeId, hidden: true });
    });

    // Clear sidebar content
    document.getElementById('sidebar-content').innerHTML = '<div class="empty-state">Select a node to view details</div>';
}

// Advanced Hiding: Hide Table and its Associated Variables
function hideTableWithVariables(tableId) {
    // 1. Hide the table itself
    nodes.update({ id: tableId, hidden: true });

    // 2. Find all blue edges from this table (Associated Variables)
    const connectedEdges = network.getConnectedEdges(tableId);
    connectedEdges.forEach(edgeId => {
        const edge = edges.get(edgeId);
        // Only follow blue edges pointing FROM the table
        if (edge.from === tableId && edge.color && edge.color.color === '#15803d') {
            const targetId = edge.to;
            const targetNode = nodes.get(targetId);

            // 3. Hide the target IF it's a variable and NOT a connector
            // Connectors have background #78350f (Deep Brown)
            if (targetNode && targetNode.color && targetNode.color.background !== '#78350f') {
                nodes.update({ id: targetId, hidden: true });

                // Also hide other edges connected to this variable (like descriptor links)
                network.getConnectedEdges(targetId).forEach(ev => {
                    edges.update({ id: ev, hidden: true });
                });
            }
        }
        // Always hide the edge itself
        edges.update({ id: edgeId, hidden: true });
    });

    document.getElementById('sidebar-content').innerHTML = '<div class="empty-state">Select a node to view details</div>';
}

// Module Toggling Logic
const moduleStates = {}; // Track visibility per module

function toggleModule(prefix) {
    const btn = event.currentTarget;
    const isHidden = !moduleStates[prefix];
    moduleStates[prefix] = isHidden;

    // Toggle button style
    if (isHidden) {
        btn.classList.add('hidden-module');
    } else {
        btn.classList.remove('hidden-module');
    }

    // Update nodes
    const allNodesUpdate = [];
    const affectedNodeIds = new Set();

    nodes.forEach(node => {
        if (node.label && node.label.toLowerCase().startsWith(prefix + '/')) {
            allNodesUpdate.push({ id: node.id, hidden: isHidden });
            affectedNodeIds.add(node.id);

            // Also handle associated variables (blue edges from table to variable)
            const connectedEdges = network.getConnectedEdges(node.id);
            connectedEdges.forEach(edgeId => {
                const edge = edges.get(edgeId);
                if (edge.from === node.id && edge.color && edge.color.color === '#15803d') {
                    const targetNode = nodes.get(edge.to);
                    // Only affect non-connector variables
                    if (targetNode && targetNode.color && targetNode.color.background !== '#78350f') {
                        allNodesUpdate.push({ id: targetNode.id, hidden: isHidden });
                        affectedNodeIds.add(targetNode.id);
                    }
                }
            });
        }
    });

    nodes.update(allNodesUpdate);

    // Update edges - hide edges if either node is hidden
    const allEdgesUpdate = [];
    edges.forEach(edge => {
        const fromNode = nodes.get(edge.from);
        const toNode = nodes.get(edge.to);
        if ((fromNode && fromNode.hidden) || (toNode && toNode.hidden)) {
            allEdgesUpdate.push({ id: edge.id, hidden: true });
        } else if (fromNode && !fromNode.hidden && toNode && !toNode.hidden) {
            allEdgesUpdate.push({ id: edge.id, hidden: false });
        }
    });
    edges.update(allEdgesUpdate);
}

// Make functions global for inline onclick
window.hideNode = hideNode;
window.hideTableWithVariables = hideTableWithVariables;
window.toggleModule = toggleModule;

// Optional: Add double-click to focus on node
// Click handler for Sidebar
network.on('click', function (params) {
    const sidebarContent = document.getElementById('sidebar-content');

    if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = nodes.get(nodeId);

        // Clean up label for display (remove newlines in title)
        const displayTitle = node.label.split('\n')[0];
        const displaySubtitle = node.label.split('\n')[1] || '';

        // Default content if no description
        const description = node.description
            ? node.description.replace(/\n/g, '<br>')
            : 'No detailed description available for this item.';

        sidebarContent.innerHTML = `
            <div class="sidebar-header">
                <h2 class="sidebar-title">${displayTitle}</h2>
                <div class="sidebar-subtitle">${displaySubtitle.replace(/[()]/g, '')}</div>
            </div>
            <div class="sidebar-content">
                ${description}
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <button class="action-button" onclick="hideNode('${nodeId}')">
                    Hide This Node
                </button>
                ${node.shape === 'box' && node.color && node.color.background === '#15803d' ? `
                <button class="action-button" style="background: rgba(239, 68, 68, 0.2); border-color: #ef4444;" onclick="hideTableWithVariables('${nodeId}')">
                    Hide Table + Variables
                </button>
                ` : ''}
            </div>
        `;

        // Automatically open sidebar if selection is made and it was collapsed
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
            toggleIcon.textContent = '⟩';
        }
    } else {
        // Deselect / Click on empty space
        sidebarContent.innerHTML = '<div class="empty-state">Select a node to view details</div>';
    }
});

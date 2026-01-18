// ================================================================
// MIMIC-IV Network Style Definitions
// ================================================================

// Node Types Configuration
const nodeStyles = {
    file: {
        shape: 'box',
        color: {
            background: '#15803d', // Dark Forest Green
            border: '#16a34a',
            highlight: {
                background: '#166534',
                border: '#22c55e'
            },
            hover: {
                background: '#166534',
                border: '#22c55e'
            }
        },
        font: {
            color: '#ffffff',
            size: 14,
            face: 'DM Sans',
            bold: true
        },
        borderWidth: 2,
        borderWidthSelected: 3,
        shadow: {
            enabled: true,
            color: 'rgba(21, 128, 61, 0.3)',
            size: 10,
            x: 0,
            y: 4
        },
        margin: 12
    },
    variable: {
        shape: 'ellipse',
        color: {
            background: '#db2777',
            border: '#f472b6',
            highlight: {
                background: '#be185d',
                border: '#f9a8d4'
            },
            hover: {
                background: '#be185d',
                border: '#f9a8d4'
            }
        },
        font: {
            color: '#ffffff',
            size: 12,
            face: 'DM Sans'
        },
        borderWidth: 2,
        borderWidthSelected: 3,
        shadow: {
            enabled: true,
            color: 'rgba(219, 39, 119, 0.3)',
            size: 8,
            x: 0,
            y: 3
        }
    },
    descriptor: {
        shape: 'box',
        color: {
            background: '#10b981',
            border: '#34d399',
            highlight: {
                background: '#059669',
                border: '#6ee7b7'
            },
            hover: {
                background: '#059669',
                border: '#6ee7b7'
            }
        },
        font: {
            color: '#ffffff',
            size: 11,
            face: 'DM Sans',
            multi: 'html'
        },
        borderWidth: 2,
        borderWidthSelected: 3,
        shadow: {
            enabled: true,
            color: 'rgba(16, 185, 129, 0.3)',
            size: 6,
            x: 0,
            y: 2
        },
        margin: 8,
        widthConstraint: { maximum: 200 }
    },
    connector: {
        shape: 'ellipse',
        color: {
            background: '#78350f', // Deep Earthy Brown
            border: '#92400e',
            highlight: {
                background: '#451a03',
                border: '#b45309'
            },
            hover: {
                background: '#451a03',
                border: '#b45309'
            }
        },
        font: {
            color: '#ffffff',
            size: 12,
            face: 'DM Sans',
            bold: true
        },
        borderWidth: 3,
        borderWidthSelected: 4,
        shadow: {
            enabled: true,
            color: 'rgba(120, 53, 15, 0.4)',
            size: 12,
            x: 0,
            y: 4
        }
    }
};

// Edge Styles
const edgeStyles = {
    // Blue edges - File/Table to Associated Variables (with arrow TO variable)
    blue: {
        color: { color: '#15803d', highlight: '#16a34a', hover: '#16a34a' },
        width: 2,
        arrows: { to: { enabled: true, scaleFactor: 0.7 } },
        smooth: { type: 'curvedCW', roundness: 0.15 }
    },
    // Red edges - Variable to Descriptor (with arrow TO descriptor)
    red: {
        color: { color: '#ef4444', highlight: '#f87171', hover: '#f87171' },
        width: 2,
        arrows: { to: { enabled: true, scaleFactor: 0.7 } },
        smooth: { type: 'curvedCCW', roundness: 0.2 }
    },
    // Brown edges - Cross-table connector links (with arrow TO connector)
    purple: {
        color: { color: '#78350f', highlight: '#92400e', hover: '#92400e' },
        width: 2,
        arrows: { to: { enabled: true, scaleFactor: 0.8 } },
        smooth: { type: 'curvedCW', roundness: 0.2 }
    },
    // Green edges - Legacy/fallback (no arrows)
    green: {
        color: { color: '#22c55e', highlight: '#4ade80', hover: '#4ade80' },
        width: 2,
        smooth: { type: 'curvedCW', roundness: 0.2 }
    },
    // Cyan edges - Reference links (legacy, with arrow)
    cyan: {
        color: { color: '#06b6d4', highlight: '#22d3ee', hover: '#22d3ee' },
        width: 2,
        arrows: { to: { enabled: true, scaleFactor: 0.8 } },
        smooth: { type: 'curvedCW', roundness: 0.15 }
    }
};

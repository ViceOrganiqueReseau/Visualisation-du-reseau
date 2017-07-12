"use strict";

var CONSTANTS = {
  USE_CANVAS: true,
  DEBUG: true,
  PHI: Math.PI * 4,
  WIDTH: 1800,
  HEIGHT: 1200,
  COLORS: {
    SUPPORT: 'rgba(0, 255, 0, 1)',
    OPPOSE: 'rgba(255, 0, 0, 1)'
  },
  MEMBRANE: {
    PADDING: 10,
    CURVE: d3.curveBasisClosed
  },
  CIRCLE: {
    KERNEL_RADIUS: 6,
    POINTS_NUMBER: 20,
    CURVE: d3.curveBasisClosed,
    RADIUS_JITTER: 0.12,
    RADIUS_RANGE: [7, 30]
  },
  FORCES: {
    COLLIDE_PADDING: 2,
    PACK_PADDING: 15,
  },
  DATA: {
    SPENDING_KEY: 'Dépenses Lobby (€)',
    TYPES:{
      NODE: {
        LOBBY: 'node/lobby',
        PROPRIETARY: 'node/proprietary',
      },
      LINK: {
        AFFILIATION: 'link/affiliation',
        PROPRIETARY: {
          DIRECT: 'link/proprietary/direct',
          INDIRECT: 'link/proprietary/indirect',
        }
      }
    },
    CSV_FILES: [
      "data/Noeud4juillet.csv",
      "data/Noeuds-ActionnairesIndirect.csv",
      "data/liensActionnairesDirect.csv",
      "data/liensActionnairesIndirect.csv",
      "data/Affiliation19juin.csv"
    ]
  }
};

// animations constants
var UPDATE_SIMULATION_INTERVAL = 500;
var animations = {
  position: {
    animate: false,
    interval: 50,
    duration: 2000
  },
  shape: {
    interval:311,
    duration: 1000
  }
};





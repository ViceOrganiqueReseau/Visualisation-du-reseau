"use strict";

var CONSTANTS = {
  USE_CANVAS: false,
  DEBUG: true,
  PHI: Math.PI * 4,
  WIDTH: 1600,
  HEIGHT: 800,
  COLORS: {
    BACKGROUND: 'rgb(22, 27, 48)',
    ENEMY: 'rgb(255,165,0)',
    ALLY: 'rgb(0, 165, 255)',
    SAME_POSITION: '4d8d9c',
    DIFFERENT_POSITION: 'b17d1d'
  },
  MEMBRANE: {
    PADDING: 6,
    CURVE: d3.curveBasisClosed
  },
  LINK:{
    KERNEL_SCALE: 1.33
  },
  CIRCLE: {
    KERNEL_RADIUS: 6,
    POINTS_NUMBER: 20,
    CURVE: d3.curveBasisClosed,
    RADIUS_JITTER: 0.12,
    RADIUS_RANGE: [7, 30]
  },
  FORCES: {
    COLLIDE_PADDING: 3,
    PACK_PADDING: 8,
  },
  UPDATE_INTERVAL: 500,
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
    CSV_FILES: {
      NODES: "data/Noeud4juillet.csv",
      NODES_PROPRIETARY:"data/Noeuds-ActionnairesIndirect.csv",
      LINKS_PROPRIETARY:"data/liensActionnairesDirect.csv",
      LINKS_INDIRECT_PROPRIETARY:"data/liensActionnairesIndirect.csv",
      LINKS_AFFILIATION:"data/Affiliation19juin.csv"
    }
  }
};

// animations constants
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





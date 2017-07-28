"use strict";

var vue = document.getElementById("vue");
// Recopier la valeur dans styles.css
var vuepadding = 5;

var CONSTANTS = {
  USE_CANVAS: false,
  DEBUG: true,
  PHI: Math.PI * 4,
  WIDTH: 1280,
  HEIGHT: 600,
  COLORS: {
    PROPRIETARY: '7d7d7d',
    BACKGROUND: '111627',
    ENEMY: 'b17d1d',
    ALLY: '4d8d9c',
    SUPPORT: '00ff00',
    OPPOSE: 'ff0000',
    USER: '00ff90'
  },
  VUE: {
    POSITION: vue.getBoundingClientRect(),
    WIDTH: vue.offsetWidth - 2*vuepadding,
    HEIGHT: vue.offsetHeight - 2*vuepadding,
    NODE_PADDING: 15
  },
  // réglages de la membranes
  MEMBRANE: {
    // espace entre les points et la membranes.
    PADDING: 0,
    CURVE: d3.curveCatmullRomClosed,
  },
  LINK:{
    CURVE: d3.curveBasis,
    DISTANCE: 130,
    PROPRIETARY_COLOR: 'bbb',
    AFFILIATION_OPACITY: 0.7,
    KERNEL_SCALE: 1.33,
  },
  CIRCLE: {
    PROPRIETARY_RADIUS: 20,
    KERNEL_RADIUS: 6,
    POINTS_NUMBER: 20,
    CURVE: d3.curveBasisClosed,
    SCALE: d3.scaleLinear,
    RADIUS_JITTER: 0.12,
    RADIUS_RANGE: [12, 50],
    TEXTdx: -15,
    TEXTdy: -10,
    TEXT_PADDING: 11
  },
  FORCES: {
    COLLIDE_PADDING: 3,
    SPACE_PADDING: 25,
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
      LINKS_AFFILIATION:"data/Affiliation19juin.csv",
      SCENARIO: "data/Reseau/Scenario.csv"
    },
    JSON_FILES: {
      STORIES: "data/Reseau/stories.json"
    }
  }
};

var baseLinkWidth = CONSTANTS.CIRCLE.KERNEL_RADIUS * CONSTANTS.LINK.KERNEL_SCALE - 2;
var endLinkWidth = baseLinkWidth*0.25;

CONSTANTS.LINK.DEFAULT_BODY = [
  { at: 0.0, width: baseLinkWidth, offset: 0 },
  { at: 0.2, width: baseLinkWidth*0.33, offset: 0 },
  { at: 0.5, width: endLinkWidth, offset: baseLinkWidth*0.33 },
  { at: 0.75, width: endLinkWidth, offset: -3 },
  { at: 1.0, width: endLinkWidth, offset: 0}
];

// animations constants
var animations = {
  position: {
    animate: false,
    interval: 50,
    duration: 2000
  },
  circleShapes: {
    duration: 2000
  },
  linkShapes: {
    interval: 200,
    duration: 1000
  }
};





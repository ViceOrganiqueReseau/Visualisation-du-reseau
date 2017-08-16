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
  LEGEND: {
    svgheightcolors: 50,
    svgheightcolorscale: 70,
    svgheightaff: 80,
    svgheightprop: 110,
    svgheightstoryshort: 80,
    svgheightstory: 110,
  },
  COLORS: {
    PROPRIETARY: '#7d7d7d',
    BACKGROUND: '#111627',
    ENEMY: '#b17d1d',
    ALLY: '#4d8d9c',
    SUPPORT: '#00ff00',
    OPPOSE: '#ff0000',
    USER: '#00ff90',
    UNSELECTED: '#A0A0A0',
    UNSELECTED_OPACITY : 0.3,
    // Ne pas oublier de modifier la valeur correspondante dans styles.css : a.sourcelink
    STORY: "white",
    STORY_VISITED: "gray",
    STORYNODE: "#996c6c",
    STORYLINK2: "yellow",
  },
  VUE: {
    POSITION: vue.getBoundingClientRect(),
    WIDTH: vue.offsetWidth - 2*vuepadding,
    HEIGHT: vue.offsetHeight - 2*vuepadding,
    AGREG_PADDING: 30,
    NODE_PADDING: 15,
  },
  // réglages de la membranes
  MEMBRANE: {
    // espace entre les points et la membranes.
    PADDING: 5,
    CURVE: d3.curveCatmullRomClosed,
    TEXT_PADDING: 15,
    DECALTEXT: 50,
    UPDECALTEXT: -60,
    DOWNDECALTEXT: 60,
  },
  LINK:{
    CURVE: d3.curveBasis,
    DISTANCE: 130,
    PROPRIETARY_COLOR: 'bbb',
    AFFILIATION_OPACITY: 0.5,
    KERNEL_SCALE: 1.33,
    END_SCALE: 0.1
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
    TEXT_PADDING: 11,
    STORY_CIRCLE_dx : -22,
    STORY_CIRCLE_dy : 10,
    STORY_CIRCLE_RADIUS : 3,
    // WARNING : PERLINE < 10 !
    STORY_CIRCLE_PERLINE : 5
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
        STORY: 'node/story'
      },
      LINK: {
        AFFILIATION: 'link/affiliation',
        PROPRIETARY: {
          DIRECT: 'link/proprietary/direct',
          INDIRECT: 'link/proprietary/indirect',
        },
        STORY: {
          LINK1: "",
          LINK2: "", // Complétés à l'import de la story
        },
      }
    },
    CSV_FILES: {
      NODES: "data/Noeud27juillet.csv",
      NODES_PROPRIETARY:"data/Noeuds-ActionnairesIndirect27juillet.csv",
      LINKS_PROPRIETARY:"data/liensActionnairesDirect.csv",
      LINKS_INDIRECT_PROPRIETARY:"data/liensActionnairesIndirect.csv",
      LINKS_AFFILIATION:"data/Affiliation27juillet.csv",
      SCENARIO: "data/Reseau/Scenario.csv",
      RESULTAT: "data/Reseau/texteResultat.csv",
      NOMS_DEPLOYES: "data/nomsDeploye27juillet.csv"
    },
    JSON_FILES: {
      STORIES: "data/Reseau/stories.json"
    }
  },
  FINAL_IMGS: {
    width: 50,
    height: 50
  }
};

CONSTANTS.CLICK_FICHE = {
  x: 0.65*CONSTANTS.VUE.WIDTH,
  y: 0.05*CONSTANTS.VUE.HEIGHT,
  width: 0.32*CONSTANTS.VUE.WIDTH,
  height: 0.5*CONSTANTS.VUE.HEIGHT,
};

CONSTANTS.BESTIES_FICHES = {
  x: 0.6*CONSTANTS.VUE.WIDTH,
  y1: 0.01*CONSTANTS.VUE.HEIGHT,
  y2: 0.51*CONSTANTS.VUE.HEIGHT,
  width: 0.37*CONSTANTS.VUE.WIDTH,
  height: 0.48*CONSTANTS.VUE.HEIGHT,
};

CONSTANTS.MEMBRANE.TEXTdx = -0.11*CONSTANTS.VUE.WIDTH;
CONSTANTS.MEMBRANE.TEXTdy = 0.02*CONSTANTS.VUE.HEIGHT;

CONSTANTS.CIRCLE.STORY_CIRCLE_LAYOUT = [];
for (var i=0; i<CONSTANTS.CIRCLE.STORY_CIRCLE_PERLINE; i++){
  CONSTANTS.CIRCLE.STORY_CIRCLE_LAYOUT.push(0);
}
var indicecourant = Math.round(CONSTANTS.CIRCLE.STORY_CIRCLE_PERLINE/2);
var incr = 1;
var signe = 1;
CONSTANTS.CIRCLE.STORY_CIRCLE_LAYOUT[0] = indicecourant;
for (var i=1; i<CONSTANTS.CIRCLE.STORY_CIRCLE_PERLINE; i++){
  indicecourant += signe*incr;
  CONSTANTS.CIRCLE.STORY_CIRCLE_LAYOUT[i] = indicecourant
  incr++;
  signe = -signe;
}

var baseLinkWidth = CONSTANTS.CIRCLE.KERNEL_RADIUS * CONSTANTS.LINK.KERNEL_SCALE - 2;
var endLinkWidth = baseLinkWidth*CONSTANTS.LINK.END_SCALE;

CONSTANTS.LINK.DEFAULT_BODY = [
  { at: 0.0, width: baseLinkWidth, offset: 0 },
  { at: 0.15, width: baseLinkWidth*0.5, offset: 0 },
  { at: 0.3, width: endLinkWidth, offset: baseLinkWidth*0.33 },
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
    duration: 2500
  }
};





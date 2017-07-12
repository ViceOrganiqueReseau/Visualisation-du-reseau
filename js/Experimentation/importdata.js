var CIRCLES_RADIUS_RANGE = [0, 30];
var SPENDING_KEY = 'Dépenses Lobby (€)';
var TYPES = {
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
};

var CSVs = [
  "data/Noeud4juillet.csv",
  "data/Noeuds-ActionnairesIndirect.csv",
  "data/liensActionnairesDirect.csv",
  "data/liensActionnairesIndirect.csv",
  "data/Affiliation19juin.csv"
];

var setType = function(arr, type){
  return arr.map(function(el){
    return (el.type = type, el);
  });
};

var flattenArray = function(arrays){
  return arrays.reduce(function(a,b){ return a.concat(b); });
}

var getSelectedTheme = function(){
  // TODO: remplacer avec le vrai choix du thème.
  return 'Efficacité énergétique';
}

// ne retourne que les nodes ayant une position sur le thème donné
var filterNodesByTheme = function(nodes, theme){
  return nodes.filter(function(node){
    var position = node[theme];
    return position != null && position != '';
  });
};

// ne retourne que les liens ayant un target et un source présent dans le tableau de noeuds donné
var filterLinksByNodes = function(links, nodes){
  return links.filter(function(link){
    var targetPresent = nodes.find(function(node){ return node['ID'] === link.target}) != null;
    var sourcePresent = nodes.find(function(node){ return node['ID'] === link.source}) != null;
    return targetPresent && sourcePresent;
  });
};

// ne retourne que les liens dont le "target" est présent dans le tableau de noeuds donné
var filterLinksByTargets = function(links, nodes){
  return links.filter(function(link){
    return nodes.find(function(node){
      return node['ID'] === link.target; 
    }) != null;
  });
};

// ne retourne que les noeuds étant présent comme "source" dans le tableau de liens donné
var filterNodesByLinkSource = function(nodes, links){
  return nodes.filter(function(node){
    return links.find(function(link){
      return link.source === node['ID'];
    }) != null;
  });
};

var processData = function(files){
  var theme = getSelectedTheme();
  // filtrage par theme des lobbies 
  var lobbyNodes = filterNodesByTheme(files[0], theme);
  // filtrage des liens d'affiliation & propriétés pertinents
  var affiliationLinks = filterLinksByNodes(files[4], lobbyNodes);
  var directProprietaryLinks = filterLinksByNodes(files[2], lobbyNodes);
  // filtrage des liens & noeuds de propriétés indirect
  var indirectProprietaryLinks = filterLinksByTargets(files[3], lobbyNodes);
  var proprietaryNodes = filterNodesByLinkSource(files[1], indirectProprietaryLinks);
  
  var spendingDomain = d3.extent(lobbyNodes, function(d){ return parseInt(d[SPENDING_KEY]); });
  var spendingScale = d3.scaleLog().domain(spendingDomain).range(CIRCLES_RADIUS_RANGE);
  // on calcul, pour chaque noeuds, le radius du cercle de base
  lobbyNodes.forEach(function(node){
    node.radius = spendingScale(parseInt(node[SPENDING_KEY]));
    node.points = circlePoints(node.radius);
  });

  // assignation des types de noeuds & liens 
  lobbyNodes = setType(lobbyNodes, TYPES.NODE.LOBBY);
  affiliationLinks = setType(affiliationLinks, TYPES.LINK.AFFILIATION);
  directProprietaryLinks = setType(directProprietaryLinks, TYPES.LINK.PROPRIETARY.DIRECT);
  indirectProprietaryLinks = setType(indirectProprietaryLinks, TYPES.LINK.PROPRIETARY.INDIRECT);
  proprietaryNodes = setType(proprietaryNodes, TYPES.NODE.PROPRIETARY);
  var allNodes = flattenArray([lobbyNodes, proprietaryNodes]); 
  var allLinks = flattenArray([
      directProprietaryLinks,
      indirectProprietaryLinks,
      affiliationLinks
  ]);
  var data = {
    theme: getSelectedTheme(),
    nodes: allNodes, 
    links: allLinks,
    // fonctions utilitaires pour filtrer les données.
    utils: {
      nodes: {
        all: function(){ return allNodes; },
        lobbies: function(){ return allNodes.filter(function(d){ return d.type == TYPES.NODE.LOBBY; })}
      },
      links: {
        all: function(){ return allLinks; },
        affiliations: function(){
          return allLinks.filter(function(link){ return link.type === TYPES.LINK.AFFILIATION });
        },
        affiliationsAndDirect: function(){
          return allLinks.filter(function(link){
            return [ TYPES.LINK.AFFILIATION, TYPES.LINK.PROPRIETY.DIRECT ].indexOf(link.type) != -1;
          });
        }
      }
    }
  };

  // nous configurons les sections 
  // voir Experimentation/sections.js
  var sections = configureSections(data);


  // nous initialisons la simulation;
  // voir Experimentation/experimentation.js
  var simulation = configureSimulation(data, sections);

  // enfin nous initialisons les controles de la simulation.
  // voir Experimentation/controls.js
  var controls = initControls(simulation);

  // nous démarrons ensuite la simulation
  simulation.start();
  console.log("OK");
}

var importData = function(){
  var queue = d3.queue();

  CSVs.forEach(function(file){
    queue = queue.defer(d3.csv, file);
  });

  queue.await(function(error){
    if(error){
      console.error('Une erreur a eu lieu lors du chargement des fichiers de données', error);
    }
    // on récupère tout les noms de fichiers passés en argument.
    var files = Array.from(arguments).slice(1).map(function(csv){ return csv.slice(); });
    processData(files);
  });
}

importData();

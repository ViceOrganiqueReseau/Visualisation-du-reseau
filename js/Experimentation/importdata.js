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

var getTheme = function(){
  // TODO: remplacer avec le vrai choix du thème.
  return 'Efficacité énergétique';
}

// ne retourne que les nodes ayant une position sur le thème donné
var filterNodesByTheme = function(nodes, theme){
  return nodes.filter(function(node){
    return node[theme] != null;
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
  var theme = getTheme();
  // filtrage par theme des lobbies 
  var lobbyNodes = filterNodesByTheme(lobbyNodes, theme);
  // filtrage des liens d'affiliation & propriétés pertinents
  vatexr affiliationLinks = filterLinksByNodes(files[4], lobbyNodes);
  var directProprietaryLinks = filterLinksByNodes(files[2], lobbyNodes);
  // filtrage des liens & noeuds de propriétés indirect
  var indirectProprietaryLinks = filterLinksByTargets(files[3], lobbyNodes);
  var proprietaryNodes = filterNodesByLinkSource(files[1], indirectProprietaryLinks);

  // assignation des types de noeuds & liens 
  lobbyNodes = setType(lobbyNodes, TYPES.NODE.LOBBY);
  affiliationLinks = setType(affilationLinks, TYPES.LINK.AFFILIATION);
  directProprietaryLinks = setType(directProprietaryLinks, TYPES.LINK.PROPRIETARY.DIRECT);
  indirectProprietaryLinks = setType(indirectProprietaryLinks, TYPES.LINK.PROPRIETARY.INDIRECT);
  proprietaryNodes = setType(proprietaryNodes, TYPES.NODE.PROPRIETARY);

  var data = {
    nodes: flattenArray([lobbyNodes, proprietaryNodes]),
    links: flattenArray([
      directProprietaryLinks,
      indirectProprietaryLinks,
      affiliationLinks
    ])
  };

  data = filterDataByTheme(data, theme);

  var sections = configureSection(data);
  // voir Experimentation/experimentation.js
  initSimulation(data, sections);
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

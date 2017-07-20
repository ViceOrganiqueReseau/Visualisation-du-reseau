var TYPES = CONSTANTS.DATA.TYPES; 

var setType = function(arr, type){
  return arr.map(function(el){
    return (el.type = type, el);
  });
};

var flattenArray = function(arrays){
  return arrays.reduce(function(a,b){ return a.concat(b); });
}
// TODO: remplacer par le vrai choix de lobbyist.
var userChoice = {
  lobbyID: '11',
  theme: 'Efficacité énergétique',
  position: 'SUPPORT'
};

var getUserChoice = function(){ return userChoice; };

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
  // récupération du thème choisi par l'utilisateur
  var theme = getUserChoice().theme;
  // filtrage par theme des lobbies 
  var lobbyNodes = filterNodesByTheme(files[0], theme);
  // filtrage des liens d'affiliation & propriétés pertinents
  var affiliationLinks = filterLinksByNodes(files[4], lobbyNodes);
  var directProprietaryLinks = filterLinksByNodes(files[2], lobbyNodes);
  // filtrage des liens & noeuds de propriétés indirect
  var indirectProprietaryLinks = filterLinksByTargets(files[3], lobbyNodes);
  var proprietaryNodes = filterNodesByLinkSource(files[1], indirectProprietaryLinks);
  
  var spendingDomain = [1, d3.max(lobbyNodes, function(d){
    return parseInt(d[CONSTANTS.DATA.SPENDING_KEY])||0; 
  })];
  
  var spendingScale = d3.scaleLog().domain(spendingDomain).range(CONSTANTS.CIRCLE.RADIUS_RANGE);
  // on calcul, pour chaque noeuds, le radius du cercle de base
  lobbyNodes.forEach(function(node){
    var spending = parseInt(node[CONSTANTS.DATA.SPENDING_KEY])||0;
    if(spending > 0){
      node.radius = spendingScale(spending);
      node.points = circlePoints(node.radius);
    } else {
      node.radius = 0;
      node.points = [];
    }
    node.kernelPoints = circlePoints(CONSTANTS.CIRCLE.KERNEL_RADIUS);
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

  allLinks.forEach(function(link){
    link.data = {
      source: allNodes.find(function(node){ return node.ID === link.source }),
      target: allNodes.find(function(node){ return node.ID === link.target })
    };
  });
  return {
    userChoice: getUserChoice(),
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
}

var importData = function(){
  var csv = CONSTANTS.DATA.CSV_FILES;
  var queue = d3.queue();
  // cette façon de faire nous permet d'assurer l'ordre du chargement des fichiers.
  // c'est particulièrement utile pour permettre à la fonction processData de savoir
  // à quoi correspondent les données passées en paramètre.
  var files = [
    csv.NODES,
    csv.NODES_PROPRIETARY,
    csv.LINKS_PROPRIETARY,
    csv.LINKS_INDIRECT_PROPRIETARY,
    csv.LINKS_AFFILIATION
  ];
  // ajoute à la queue le chargement du chargement du fichier
  files.forEach(function(file){
    queue = queue.defer(d3.csv, file);
  });

  queue.await(function(error){
    if(error){
      console.error('Une erreur a eu lieu lors du chargement des fichiers de données', error);
    }
    // on récupère tout les noms de fichiers passés en argument.
    var files = Array.from(arguments).slice(1).map(function(csv){ return csv.slice(); });
    var data = processData(files);
    // enfin nous lançons l'expérimentation avec les data obtenues.
    runExperimentation(data);
  });
}

importData();

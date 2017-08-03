var TYPES = CONSTANTS.DATA.TYPES; 

var setType = function(arr, type){
  return arr.map(function(el){
    return (el.type = type, el);
  });
};

var flattenArray = function(arrays){
  return arrays.reduce(function(a,b){ return a.concat(b); });
}

// Est complété au cours de l'import des données
var userChoice = {
      lobbyID: undefined,
      theme: undefined,
      position: undefined,
      lobbyist: undefined
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
    var targetPresent = nodes.find(function(node){
      return parseInt(node['ID']) === parseInt(link.target);
    }) != null;
    var sourcePresent = nodes.find(function(node){
      return parseInt(node['ID']) === parseInt(link.source);
    }) != null;
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
// Ordre des fichiers, voir `processData`
// 0:csv.NODES
// 1:csv.NODES_PROPRIETARY
// 2:csv.LINKS_PROPRIETARY
// 3:csv.LINKS_INDIRECT_PROPRIETARY
// 4:csv.LINKS_AFFILIATION
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
  
  var spendingScale = CONSTANTS.CIRCLE.SCALE().domain(spendingDomain).range(CONSTANTS.CIRCLE.RADIUS_RANGE);
  // on calcul, pour chaque noeuds, le radius du cercle de base
  lobbyNodes.forEach(function(node){
    var spending = parseInt(node[CONSTANTS.DATA.SPENDING_KEY])||0;
    if(spending > 0){
      node.radius = spendingScale(spending);
      node.points = circlePoints(node.radius);
    } else {
      node.radius = CONSTANTS.CIRCLE.KERNEL_RADIUS;
      node.points = [];
    }
    node.spending = spending;
  });

  // assignation des types de noeuds & liens 
  affiliationLinks = setType(affiliationLinks, TYPES.LINK.AFFILIATION);
  directProprietaryLinks = setType(directProprietaryLinks, TYPES.LINK.PROPRIETARY.DIRECT);
  indirectProprietaryLinks = setType(indirectProprietaryLinks, TYPES.LINK.PROPRIETARY.INDIRECT);
  
  var allLinks = flattenArray([
      directProprietaryLinks,
      indirectProprietaryLinks,
      affiliationLinks
  ]);
  // assignation des source et target à l'avance afin de faciliter
  // le "binding" des données (voir `$links.data(links, function(){})` 
  // dans `drawLinks` (links.js)
  allLinks.forEach(function(link){
    link.data = {
      source: lobbyNodes.concat(proprietaryNodes).find(function(node){ return node.ID === link.source }),
      target: lobbyNodes.concat(proprietaryNodes).find(function(node){ return node.ID === link.target })
    };
  });

  lobbyNodes = setType(lobbyNodes, TYPES.NODE.LOBBY);
  proprietaryNodes = setType(proprietaryNodes, TYPES.NODE.PROPRIETARY);
  
  // affecte le nombre de lien de chaque noeud de propriété.
  proprietaryNodes.forEach(function(node){
    var links = allLinks.filter(function(link){
      return parseInt(link.data.source.ID) === parseInt(node.ID);
    });
    node.links = links.length;
  });

  // échelle de calcul du radius du noeud.
  var proprietaryScale = d3.scaleLinear()
    .range(CONSTANTS.CIRCLE.RADIUS_RANGE)
    .domain(
      // récupère le [ min, max ] du tableau passé en paramètre.
      d3.extent(
        // récupère uniquement le nombre de liens des noeuds.
        proprietaryNodes.map(function(node){ return node.links; })
      )
    );


  // création de la forme
  proprietaryNodes.forEach(function(node){
    node.radius = proprietaryScale(node.links);
    node.points = circlePoints(node.radius);
  });

  var allNodes = flattenArray([lobbyNodes, proprietaryNodes]); 
  
  allNodes.forEach(function(node){
    node.kernelPoints = circlePoints(CONSTANTS.CIRCLE.KERNEL_RADIUS);
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

var writeTextInSection = function (i){
  var element = d3.select("#sec"+i);
  element.select("h1").html(CONSTANTS.SCENARIO[i]["Titre"]);
  element.select("p.texte").html(CONSTANTS.SCENARIO[i]["Texte"])
  element.select("p.appel").html(CONSTANTS.SCENARIO[i]["Appel d’action"])
}

var writeBaseTextInLastSection = function (){
  var element = d3.select("#secfin");
  element.select("h1").html(CONSTANTS.SCENARIO[7]["Titre"]);
  element.select("p.texte").html(CONSTANTS.SCENARIO[7]["Texte"])
  if (getUserChoice().lobbyist){
    var bloc1 = element.select("p.appel")
      .append("div")
      .classed("blocfin", true)
    bloc1.append("img")
      .attr("src", "img/icon_WinLose.svg")
      .attr("width", CONSTANTS.FINAL_IMGS.width)
      .attr("height", CONSTANTS.FINAL_IMGS.height)
    bloc1.append("p").html(CONSTANTS.SCENARIO[7]["bloc1"]);
  }
  var bloc2 = element.select("p.appel")
    .append("div")
    .classed("blocfin", true)
  bloc2.append("img")
    .attr("src", "img/icon_Story.svg")
    .attr("width", CONSTANTS.FINAL_IMGS.width)
    .attr("height", CONSTANTS.FINAL_IMGS.height)
  bloc2.append("p").html(CONSTANTS.SCENARIO[7]["bloc2"]);
  var bloc3 = element.select("p.appel")
    .append("div")
    .classed("blocfin", true)
  bloc3.append("img")
    .attr("src", "img/icon_Theme.svg")
    .attr("width", CONSTANTS.FINAL_IMGS.width)
    .attr("height", CONSTANTS.FINAL_IMGS.height)
  bloc3.append("p").html(CONSTANTS.SCENARIO[7]["bloc3"]);
}

var writeBestAllyEnnemyTextInLastSection = function (){
  var element = d3.select("#secfin");
  element.select("h1").html(CONSTANTS.SCENARIO[8]["Titre"]);
  element.select("p.texte").html(CONSTANTS.SCENARIO[8]["Texte"])
  element.select("p.appel").html(CONSTANTS.SCENARIO[8]["Appel d’action"])
}

var writeStoriesTextInLastSection = function (){
  var element = d3.select("#secfin");
  element.select("h1").html(CONSTANTS.SCENARIO[9]["Titre"]);
  var listelem = element.select("p.texte").text("").append("ul");
  for (var i=0; i<CONSTANTS.STORIES.Histoires.length; i++){
    if (CONSTANTS.STORIES.Histoires[i][CONSTANTS.STORIES.THEMES[CONSTANTS.STORIES.themeid]]){
      listelem.append("li")
        .classed("storyitem", true)
        .attr("id", "listory"+i)
        .text(CONSTANTS.STORIES.Histoires[i].titre)
        .style("color", CONSTANTS.STORIES.colors[i])
      // Survol histoire
      listelem.select("#listory"+i).on("mouseover", function (){
        d3.select(this).style("cursor", "pointer");
        var numid = Number(d3.select(this).attr("id").slice(7));
        listelem.selectAll(".storyitem:not(#listory"+numid+")").style("color", CONSTANTS.COLORS.STORY_VISITED)
        fadeNotInvolved(numid);
      })
      // Stop survol histoire
      listelem.select("#listory"+i).on("mouseout", function (){
        d3.select(this).style("cursor", "default");
        listelem.selectAll(".storyitem").style("color", function (){
          var numid = Number(d3.select(this).attr("id").slice(7));
          return CONSTANTS.STORIES.colors[numid];
        })
        resetMouseOut();
      })
      // Click Story
      listelem.select("#listory"+i).on("click", function (){
        var numid = Number(d3.select(this).attr("id").slice(7));
        onclickStory(numid);
      })
    }
  }
  element.select("p.appel").text("");
}

var writeStory = function(i){
  var element = d3.select("#secfin");
  element.select("h1").text(CONSTANTS.STORIES.Histoires[i].titre);
  element.select("p.texte").html(CONSTANTS.STORIES.Histoires[i].txt);
  element.insert("h1", "p.appel").classed("titlesource", true).text("Sources");
  var sourcelist = element.select("p.appel").append("ul");
  for (var j=0; j<CONSTANTS.STORIES.Histoires[i].sources.length; j++){
    sourcelist.append("li").append("a")
      .classed("sourcelink", true)
      .text(CONSTANTS.STORIES.Histoires[i].sources[j].source)
      .attr("href", CONSTANTS.STORIES.Histoires[i].sources[j].link)
      .attr("target", "_blank")
  }
}

var computeStoryCircles = function (){
  var alldata = CONSTANTS.LOADEDDATA;
  CONSTANTS.STORIES.NODESTORY = {};
  for (var j=0; j<alldata.nodes.length; j++){
    CONSTANTS.STORIES.NODESTORY[Number(alldata.nodes[j].ID)] = [];
  }
  var activesstories = Object.keys(CONSTANTS.STORIES.colors).map(Number);
  for (var i=0; i<activesstories.length; i++){
    var involvedkey = CONSTANTS.STORIES.Histoires[activesstories[i]]["Noeuds principaux"] ? "Noeuds principaux" : "Noeuds du réseau";
    for (var j=0; j<CONSTANTS.STORIES.Histoires[activesstories[i]][involvedkey].length; j++){
      // Sécurité pour éviter le plantage
      if (CONSTANTS.STORIES.NODESTORY[CONSTANTS.STORIES.Histoires[activesstories[i]][involvedkey][j]]){
        CONSTANTS.STORIES.NODESTORY[CONSTANTS.STORIES.Histoires[activesstories[i]][involvedkey][j]].push(activesstories[i]);
      }
    }
  }
}

var writeNewThemeTextInLastSection = function (){
  var element = d3.select("#secfin");
  element.select("h1").html(CONSTANTS.SCENARIO[10]["Titre"]);
  element.select("p.texte").html(CONSTANTS.SCENARIO[10]["Texte"])
  element.select("p.appel").html(CONSTANTS.SCENARIO[10]["Appel d’action"])
}

var eraseLastSectionContent = function (){
  d3.select("#secfin").selectAll("div.blocfin").remove();
  d3.select("#bestally").remove();
  d3.select("#worstrival").remove();
  d3.select("svg#closestory").style("display", "none")
  d3.select("h1.titlesource").remove();
  clicklocknode = false;
}

var storestories = function (jsondata){
  CONSTANTS.STORIES = jsondata;
  CONSTANTS.STORIES.THEMES = Object.keys(CONSTANTS.STORIES.Histoires[0]).slice();
  CONSTANTS.STORIES.THEMES.splice(CONSTANTS.STORIES.THEMES.indexOf("ID"),1);
  CONSTANTS.STORIES.THEMES.splice(CONSTANTS.STORIES.THEMES.indexOf("titre"),1);
  CONSTANTS.STORIES.THEMES.splice(CONSTANTS.STORIES.THEMES.indexOf("txt"),1);
  CONSTANTS.STORIES.THEMES.splice(CONSTANTS.STORIES.THEMES.indexOf("sources"),1);
  CONSTANTS.STORIES.THEMES.splice(CONSTANTS.STORIES.THEMES.indexOf("Noeuds principaux"),1);
  CONSTANTS.STORIES.THEMES.splice(CONSTANTS.STORIES.THEMES.indexOf("Noeuds du réseau"),1);
  CONSTANTS.STORIES.THEMES.splice(CONSTANTS.STORIES.THEMES.indexOf("Nouveau noeud"),1);
  CONSTANTS.STORIES.THEMES.splice(CONSTANTS.STORIES.THEMES.indexOf("Liens"),1);
  console.log(CONSTANTS.STORIES.THEMES)
  CONSTANTS.STORIES.themeid = Number(params["theme"]);

  // Couleur d'une histoire : white si non visitée
  CONSTANTS.STORIES.colors = {};
  for (var i=0; i<CONSTANTS.STORIES.Histoires.length; i++){
    if (CONSTANTS.STORIES.Histoires[i][CONSTANTS.STORIES.THEMES[CONSTANTS.STORIES.themeid]]){
      CONSTANTS.STORIES.colors[i] = CONSTANTS.COLORS.STORY;
    }
  }

  computeStoryCircles();
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
    csv.LINKS_AFFILIATION,
    csv.SCENARIO,
  ];
  // ajoute à la queue le chargement du chargement du fichier
  files.forEach(function(file){
    queue = queue.defer(d3.csv, file);
  });
  //queue.defer(d3.json, CONSTANTS.DATA.JSON_FILES.STORIES, storestories);
  d3.json(CONSTANTS.DATA.JSON_FILES.STORIES, storestories);

  queue.await(function(error){
    if(error){
      console.error('Une erreur a eu lieu lors du chargement des fichiers de données', error);
    }
    // on récupère tout les noms de fichiers passés en argument.
    var files = Array.from(arguments).slice(1).map(function(csv){ return csv.slice(); });
    console.log("files = ",files)
    CONSTANTS.SCENARIO = files[5];

    // On écrit le texte des sections
    for (var i=0; i<7; i++){
      writeTextInSection(i);
    }

    // On obtient la liste des thèmes
    CONSTANTS.THEMELIST = Object.keys(files[0][0]);
    CONSTANTS.THEMELIST.splice(CONSTANTS.THEMELIST.indexOf("ID"), 1);
    CONSTANTS.THEMELIST.splice(CONSTANTS.THEMELIST.indexOf("Lobby ID"), 1);
    CONSTANTS.THEMELIST.splice(CONSTANTS.THEMELIST.indexOf("Nom2"), 1);
    CONSTANTS.THEMELIST.splice(CONSTANTS.THEMELIST.indexOf("Nom1"), 1);
    CONSTANTS.THEMELIST.splice(CONSTANTS.THEMELIST.indexOf("Pays/Région"), 1);
    CONSTANTS.THEMELIST.splice(CONSTANTS.THEMELIST.indexOf("Type"), 1);
    CONSTANTS.THEMELIST.splice(CONSTANTS.THEMELIST.indexOf("Secteurs d’activité"), 1);
    CONSTANTS.THEMELIST.splice(CONSTANTS.THEMELIST.indexOf(CONSTANTS.DATA.SPENDING_KEY), 1);
    CONSTANTS.THEMELIST.splice(CONSTANTS.THEMELIST.indexOf("Personnes impliquées"), 1);
    CONSTANTS.THEMELIST.splice(CONSTANTS.THEMELIST.indexOf("Equivalent Temps plein"), 1);
    // Récupération du thème
    if (params["theme"]){
      var urlthemeid = Number(params["theme"])
      if ((urlthemeid>=0) && (urlthemeid<CONSTANTS.THEMELIST.length)){
        userChoice.theme = CONSTANTS.THEMELIST[urlthemeid];
      }
    }

    // Créer les liens de retour vers le thème
    createlinks();

    // S'il n'y a pas de thème, afficher les liens
    if (!userChoice.theme){
      displaylinksError();
    }

    var data = processData(files);
    CONSTANTS.LOADEDDATA = data;

    // Récupération du choix utilisateur
    // On crée la liste des ID (car c'est un intervalle discontinu)
    AllIDlist = [];
    for (var i=0; i<CONSTANTS.LOADEDDATA.nodes.length; i++){
      AllIDlist.push(CONSTANTS.LOADEDDATA.nodes[i].ID);
    }

    if (params["id"]){
      if (AllIDlist.indexOf(params["id"])!==-1){
        userChoice.lobbyID = Number(params["id"]);
      }
    } // Sinon userChoice.lobbyID est undefined
  

    // On récupère le lobyist choisi et la liste des IDs
    for (var i=0; i<CONSTANTS.LOADEDDATA.nodes.length; i++){
      if (Number(CONSTANTS.LOADEDDATA.nodes[i].ID) === userChoice.lobbyID){
        userChoice.lobbyist = CONSTANTS.LOADEDDATA.nodes[i];
        userChoice.position = userChoice.lobbyist[userChoice.theme]
        break;
      }
    }

    // On écrit dans les #answers
    if (userChoice.theme){
      d3.select("#answers span.theme")
        .text(userChoice.theme);
    }
    if (userChoice.lobbyist){
      d3.select("#answers span.nom")
        .text(userChoice.lobbyist["Nom1"]);
      d3.select("#answers span.type")
        .text(userChoice.lobbyist["Type"]);
      d3.select("#answers span.secteur")
        .text(userChoice.lobbyist["Secteurs d’activité"]);
      d3.select("#answers span.country")
        .text(userChoice.lobbyist["Pays/Région"]);
      if (userChoice.lobbyist[userChoice.theme]){
        d3.select("#answers span.position")
          .text(userChoice.lobbyist[userChoice.theme]);
      }
    }

    // On écrit le texte dans le dernière section
    writeBaseTextInLastSection();
    // On calcule meilleur allié et pire adversaire si on a toutes les informations dans l'URL
    if (getUserChoice().lobbyist){
      computeBesties();
    }

    // enfin nous lançons l'expérimentation avec les data obtenues. 
    runExperimentation(data);
  });
}

importData();

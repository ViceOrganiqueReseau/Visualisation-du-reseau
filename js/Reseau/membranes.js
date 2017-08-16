var hull = function(vertices){ return d3.polygonHull(vertices); };
var hullLine = d3.line()
  .curve(CONSTANTS.MEMBRANE.CURVE);

var membranePath = function(nodes, cluster){
  var padding = CONSTANTS.MEMBRANE.PADDING;
  var x = function(p){ return p.cosAngle * ((p.radius||0)+padding); };
  var y = function(p){ return p.sinAngle * ((p.radius||0)+padding); };
  var points = [], node, nodePoints;
  var nodeIndex, nodeNumber = nodes.length;
  
  var i, n;
  for(nodeIndex = 0; nodeIndex < nodeNumber; nodeIndex++){
    node = nodes[nodeIndex];
    if(cluster.hasNode(node)){
      nodePoints = node.points && node.points.length > 0 ? node.points : node.kernelPoints;
      n = nodePoints.length;
      for(i=0; i < n; i++){
        points.push([
          node.x + x(nodePoints[i]) - cluster.x,
          node.y + y(nodePoints[i]) - cluster.y
        ]);
      }
    }
  }

  var h = hull(points);
  delete points;
  if(h && h.length > 0){
    return hullLine(h);
  } else {
    return '';
  }
};

// rend valide des sélecteurs css
function purgeSpaces(string){
  return string
            .replace("(","")
            .replace(")","")
            .replace("/","")
            .replace("-","")
            .replace(" ","")
            .replace(" ","")
            .replace(" ","")
            .replace(" ","")
            .replace(",","")
            .replace(",","");
}

function changePourContre (string){
  var string2 = string;
  if (getUserChoice().position){
    var aux = ["Pour", "Contre"];
    aux.forEach(function(pos){
      if (pos === getUserChoice().position){
        string2 = string2.replace(pos, "Alliés")
      } else {
        string2 = string2.replace(pos, "Rivaux")
      }
    })
  }
  return string2;
}

// Inscrire ici les décalages des textes de membranes au cas par cas dans cette fonction
function decalmembranetext(membrane){
  switch (Number(params["theme"])){

    case 1: // Efficacité énergétique
      switch (purgeSpaces(membrane.key.split("-")[0])){
        case "Industriechimique":
          return 2*CONSTANTS.MEMBRANE.UPDECALTEXT;
      }

    case 3: // Energies renouvelables
      switch (purgeSpaces(membrane.key.split("-")[0])){
        case "Finance":
          return CONSTANTS.MEMBRANE.DOWNDECALTEXT;
      }
  }
  return 0;
}

var drawMembranes = function(nodes, membranes){
  var canvas = scene.getCanvas();
  var $membranes = canvas.selectAll('.membrane')
    .data(membranes, function(c){ return c.key; });

  var membraneEnter = $membranes.enter()
    .append('path')
    .classed('membrane', true)
    .attr('stroke', 'none')
    .attr('d', function (cluster){
      return membranePath(nodes, cluster);
    })
    .attr('fill', function (cluster){
      return chroma(cluster.color);
    }).attr('fill-opacity', 0);

  membranes.forEach(function (membrane){
    var textelem = canvas.append("text")
      .classed("membranetext", true)
      .classed("membranetext"+purgeSpaces(membrane.key.split("-")[0]), true)
      .attr("id", "membranetext"+purgeSpaces(membrane.key))
      .attr("x", membrane.x + CONSTANTS.MEMBRANE.TEXTdx)
      .attr("y", membrane.y)
    textelem.append("tspan")
      .classed("name", true)
      .attr("x", membrane.x + CONSTANTS.MEMBRANE.TEXTdx)
      .attr("y", function (){
        if (membrane.key[membrane.key.length-1]==="r"){ return membrane.y - 0.5*CONSTANTS.MEMBRANE.DECALTEXT + decalmembranetext(membrane) + CONSTANTS.MEMBRANE.TEXTdy; }
        else { return membrane.y + 0.5*CONSTANTS.MEMBRANE.DECALTEXT + decalmembranetext(membrane) + CONSTANTS.MEMBRANE.TEXTdy; }
      })
      .attr("fill-opacity", 0)
      .text(changePourContre(membrane.key.split("-").join(" : ")))
    textelem.append("tspan")
      .classed("count", true)
      .attr("fill-opacity", 0)
      .attr("x", membrane.x + CONSTANTS.MEMBRANE.TEXTdx)
      .attr("y", function (){
        if (membrane.key[membrane.key.length-1]==="r"){ return membrane.y - 0.5*CONSTANTS.MEMBRANE.DECALTEXT + decalmembranetext(membrane) + CONSTANTS.MEMBRANE.TEXTdy + CONSTANTS.MEMBRANE.TEXT_PADDING; }
        else { return membrane.y + CONSTANTS.MEMBRANE.TEXTdy + 0.5*CONSTANTS.MEMBRANE.DECALTEXT + decalmembranetext(membrane) + CONSTANTS.MEMBRANE.TEXT_PADDING; }
      })
      .attr("fill-opacity", 0)
      .text(membrane.nodeIDS.length+" organisations")
    textelem.append("tspan")
      .classed("budget", true)
      .attr("fill-opacity", 0)
      .attr("x", membrane.x + CONSTANTS.MEMBRANE.TEXTdx)
      .attr("y", function (){
        if (membrane.key[membrane.key.length-1]==="r"){ return membrane.y - 0.5*CONSTANTS.MEMBRANE.DECALTEXT + decalmembranetext(membrane) + CONSTANTS.MEMBRANE.TEXTdy + 2*CONSTANTS.MEMBRANE.TEXT_PADDING; }
        else { return membrane.y + CONSTANTS.MEMBRANE.TEXTdy + 0.5*CONSTANTS.MEMBRANE.DECALTEXT + decalmembranetext(membrane) + 2*CONSTANTS.MEMBRANE.TEXT_PADDING; }
      })
      .attr("fill-opacity", 0)
      .text(function (){
        // On calcule le budget total de lobbying
        var somme = 0;
        for (var i=0; i<nodes.length; i++){
          if (membrane.nodeIDS.indexOf(nodes[i].ID)!==-1 && nodes[i][CONSTANTS.DATA.SPENDING_KEY]!=="NaN"){
            somme += Number(nodes[i][CONSTANTS.DATA.SPENDING_KEY]);
          }
        }
        return "Budget Lobby : "+somme+" €";
      })
  })


  membraneEnter.transition()
    .delay(0)
    .duration(2200)
    .ease(d3.easeCubic)
    .attrTween('fill-opacity', function(){ return d3.interpolateNumber(0,1);});



  // on cache les membrane qui ne seront plus utilisées.
  // TODO: ajouter une constante 
  var membranesExit = $membranes.exit();

  membranesExit.transition().duration(400)
    .ease(d3.easeCubic)
    .attrTween('fill-opacity', function(){ return d3.interpolateNumber(1,0); });
  

  $membranes = membraneEnter.merge($membranes);

  membranesExit.transition().delay(500).remove();

  $membranes.on("mouseover", function (membrane){
    console.log(purgeSpaces(membrane.key.split("-")[0]))
    canvas.selectAll(".membranetext"+purgeSpaces(membrane.key.split("-")[0])).selectAll("tspan.name").attr("fill-opacity", 1);
    canvas.selectAll(".membranetext"+purgeSpaces(membrane.key.split("-")[0])).selectAll("tspan.count").attr("fill-opacity", 1);
    canvas.selectAll(".membranetext"+purgeSpaces(membrane.key.split("-")[0])).selectAll("tspan.budget").attr("fill-opacity", 1);
  })

  $membranes.on("mouseout", function (membrane){
    canvas.selectAll(".membranetext"+purgeSpaces(membrane.key.split("-")[0])).selectAll("tspan.name").attr("fill-opacity", 0);
    canvas.selectAll(".membranetext"+purgeSpaces(membrane.key.split("-")[0])).selectAll("tspan.count").attr("fill-opacity", 0);
    canvas.selectAll(".membranetext"+purgeSpaces(membrane.key.split("-")[0])).selectAll("tspan.budget").attr("fill-opacity", 0);
  })
  
  return {membranes: $membranes, membranesExit: membranesExit};
}

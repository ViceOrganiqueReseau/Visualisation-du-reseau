var LINK_CURVE_DISTANCE = 20;
var radToDeg = function(rad){ return (rad*180)/Math.PI; };
var degToRad = function(deg){ return (deg*Math.PI)/180; };

var getNormalAngle = function(a,b){
  var angle = radToDeg(Math.atan2(b.y-a.y, b.x-a.x));
  return degToRad(angle - 90);
};
var coords = function(pt, i){ return pt['x'+i]+','+pt['y'+i]; };
/*
 * Génère les points servant à dessiner l'aire du lien.
 * @param `points`
 *  tableau des points de la courbe, chaque point étant sous la forme suivante:
 *    {
 *      at:0.0, // pourcentage du placement du point sur la ligne entre `source` et `target`
 *      width: 5, // largeur de la bande à cet endroit.
 *      offset: -2 // distance par rapport à la ligne `source` <-> `target`
 *    }
 *    
 */
var areaPoints = function(link, points){
  var source = link.source.x ? link.source : link.data.source;
  var target = link.target.x ? link.target : link.data.target;
  var normalAngle = getNormalAngle(source, target);
  
  var x = function(pt){
    return source.x
      + (target.x - source.x)*pt.at 
      + pt.offset*Math.cos(normalAngle);
  };
  
  var y = function(pt){
    return source.y
      + (target.y - source.y)*pt.at 
      + pt.offset*Math.sin(normalAngle);
  };

  var x0 = function(pt){
    return x(pt) - pt.width*Math.cos(normalAngle);
  }
  var x1 = function(pt){
    return x(pt) + pt.width*Math.cos(normalAngle);
  }
  var y0 = function(pt){
    return y(pt) - pt.width*Math.sin(normalAngle);
  }
  var y1 = function(pt){
    return y(pt) + pt.width*Math.sin(normalAngle);
  }
  var _points = points.map(function(pt){
    return {
      x0: x0(pt), x1: x1(pt),
      y0: y0(pt), y1: y1(pt)
    };
  });
  return _points;
} 
var areaPath = d3.area()
  .x0(function(pt){return pt.x0; })
  .x1(function(pt){return pt.x1; })
  .y0(function(pt){return pt.y0; })
  .y1(function(pt){return pt.y1; });


var linkBodyPath = function(link){
  var base_radius = CONSTANTS.CIRCLE.KERNEL_RADIUS * CONSTANTS.LINK.KERNEL_SCALE - 2;
  var end_link_width = base_radius * 0.25;

  var conf = [
    { at: 0.0, width: base_radius, offset: 0 },
    { at: 0.2, width: base_radius*0.33, offset: 0 },
    { at: 0.5, width: end_link_width, offset: base_radius*0.33 },
    { at: 0.75, width: end_link_width, offset: -3 },
    { at: 1.0, width: end_link_width, offset: 0}
  ];
  var points = areaPoints(link, conf);
  return areaPath(points);
};

var drawLinks = function(links){
  var TYPES = CONSTANTS.DATA.TYPES.LINK;
  var canvas = scene.getCanvas();
  var $links = canvas.selectAll('.link').data(links);
  var scale = CONSTANTS.LINK.KERNEL_SCALE;

  var $linksEnter = $links.enter()
    .append('g')
    .attr('comp-op', 'src')
    .style('opacity', 0.7)
    .classed('link', true);

  var $affiliations = $linksEnter.filter(function(link){ return link.type === TYPES.AFFILIATION });

  $linksEnter.append('path')
    .classed('link-base', true)
    .attr('comp-op', 'src')
    .attr('d', (d)=>(radialLine(d.data.source.kernelPoints)))
    .attr('transform', function(link){ return Utils.transform(link.data.source, scale); })
    .attr('fill', Color.link);

  $linksEnter.append('path')
    .classed('link-body', true)
    .attr('fill', Color.link)
    .attr('d', linkBodyPath);

  var $linksExit = $links.exit();

  $linksExit.transition().duration(1000).style('opacity', 0);

  $linksExit.transition().delay(1000).remove();

  $links = $links.merge($linksEnter);

  return {links: $links, linksExit:$linksExit};
}

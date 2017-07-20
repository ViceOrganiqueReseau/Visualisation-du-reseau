var shapePath = function(shape){
  var startcap = shape.startcap,
    endcap = shape.endcap,
    forward = shape.forward,
    back = shape.back,
    rnd = Math.round,
    coords = function(pt){ return rnd(ptx)+','+rnd(y); };

  var path = 'M'+coords(startcap.points[0])
    + 'L'+coords(startcap.points[2])
    + forward.map(function(curve){
        var pts = curve.points;
        return 'C'+coords(pts[1])+' '+coords(pts[2])+' '+coords(pts[3]);
      }).join(' ')
    + back.map(function(curve){
        var pts = curve.points;
        return 'C'+coords(pts[1])+' '+coords(pts[2])+' '+coords(pts[3]);
      }).join(' ');
  return path;

};

var outlineShapes = function(curve, d1,d2,d3,d4, t){
  var utils = Bezier.getUtils();
  var outline = curve.outline(d1,d2,d3,d4).curves;
  return { 
    startcap: outline[0],
    forward: outline.slice(1,3),
    endcap: outline[3], 
    back: outline.slice(-2)
  };

};

var linkBodyPath = function(link){
  var outline;
  var src = link.data.source;
  var tgt = link.data.target;

  if(link.source.x){
    src = link.source;
    tgt = link.target;
  }

  var midP = 0.5;
  var d = LINK_CURVE_DISTANCE;
  var mid = (a,b)=>({
    x:(a.x+b.x)*midP, 
    y:(a.y+b.y)*midP
  });
  var scale = CONSTANTS.LINKS.KERNEL_SCALE;
  var r = scale * (link.data.source.radius || 10) - 4;
  var _mid = mid(src,tgt);

  var angle = Math.atan2(tgt.y-src.y, tgt.x-src.x)*180/Math.PI;
  var normalAngle = ((90-angle)*Math.PI)/180;

  _mid.x += d*Math.cos(normalAngle);
  _mid.y += d*Math.sin(normalAngle);
  // génération de la courbe "générale" du lien. 
  var curve = Bezier.quadraticFromPoints(src, _mid, tgt);
  // génération des formes autour de ce lien.
  var shapes = outlineShapes(curve, r, r, 4, 4);
  return { shape: shapePath(shapes), curve: curve.toSVG() }
};


var drawLinks = function(links){
  var canvas = scene.getCanvas();
  var $links = canvas.selectAll('.link').data(links);
  var scale = CONSTANTS.LINK.KERNEL_SCALE;
  
  var $linksEnter = $links.enter()
    .append('g')
    .attr('comp-op', 'src')
    .style('opacity', 0.3)
    .classed('link', true);

  $linksEnter.append('path')
    .classed('link-base', true)
    .attr('comp-op', 'src')
    .attr('d', (d)=>(radialLine(d.data.source.kernelPoints)))
    .attr('transform', function(link){ return transform(link.data.source, scale); })
    .attr('fill', Color.link);

  $linksEnter.append('path')
    .classed('link-body', true)
    .attr('fill', linkColor)
    .attr('comp-op', 'src-out')
    .attr('d', (d)=>linkBodyPath(d).shape);

  $linksEnter.append('path')
    .classed('link-curve', true)
    .attr('fill', 'none')
    .attr('stroke','black');

  return $links;
}

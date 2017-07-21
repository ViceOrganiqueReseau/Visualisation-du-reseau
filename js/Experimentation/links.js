var LINK_CURVE_DISTANCE = 20;

var coords = function(pt, i){ return pt['x'+i]+','+pt['y'+i]; };

var shapePath = function(shape){
  var start = shape.start;
  var middle = shape.middle;
  var end  = shape.end;
  return 'M' + coords(start, 2)
    + ' L'+ coords(start, 1)
    + ' Q'+ coords(middle, 1)
    + ' ' + coords(end,1)
    + ' L'+ coords(end,2)
    + ' Q'+ coords(middle,2)
    + ' ' + coords(start,2);
};
/*
var shapePath = function(shape){
  var startcap = shape.startcap,
    endcap = shape.endcap,
    forward = shape.forward,
    back = shape.back,
    rnd = Math.round;
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
*/

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
  var radToDeg = function(rad){ return (rad*180)/Math.PI; };
  var degToRad = function(deg){ return (deg*Math.PI)/180; };

  var getNormalAngle = function(a,b){
    var angle = radToDeg(Math.atan2(b.y-a.y, b.x-a.x));
    return degToRad(angle - 90);
  };

  var outline;
  // console.log('linkBodyPath', link.data.source.ID, link.data.target.ID);
  var src = link.data.source;
  var tgt = link.data.target;

  if(link.source.x){
    src = link.source;
    tgt = link.target;
  }

  var midP = 0.5;
  var d = 4;
  var mid = (a,b)=>({
    x:(a.x+b.x)*midP, 
    y:(a.y+b.y)*midP
  });
  var scale = CONSTANTS.LINK.KERNEL_SCALE;
  var r = scale * CONSTANTS.CIRCLE.KERNEL_RADIUS;
  var _mid = mid(src,tgt);

  
  var normalAngle = getNormalAngle(src, tgt);
  // le point de control central
  _mid.x += d*Math.cos(normalAngle);
  _mid.y += d*Math.sin(normalAngle);
  
  var middleNormalAngle = getNormalAngle(src, _mid);
  var endNormalAngle = getNormalAngle(_mid, tgt);
//  debugger; 
  // génération de la courbe "générale" du lien. 
  var shape = {
    start: {
      x1: src.x + (r-3)*Math.cos(normalAngle),
      y1: src.y + (r-3)*Math.sin(normalAngle),
      x2: src.x - (r-3)*Math.cos(normalAngle),
      y2: src.y - (r-3)*Math.cos(normalAngle)
    },
    middle: {
      x1: _mid.x + r*0.5*Math.cos(middleNormalAngle),
      y1: _mid.y + r*0.5*Math.sin(middleNormalAngle),
      x2: _mid.x - r*0.5*Math.cos(middleNormalAngle),
      y2: _mid.y - r*0.5*Math.sin(middleNormalAngle),
    },
    end: {
      x1: tgt.x + r*0.1*Math.cos(endNormalAngle),
      y1: tgt.y + r*0.1*Math.sin(endNormalAngle),
      x2: tgt.x - r*0.1*Math.cos(endNormalAngle),
      y2: tgt.y - r*0.1*Math.sin(endNormalAngle),
    }
  };
  // génération des formes autour de ce lien.
  var path = shapePath(shape);
  return path;
};


var drawLinks = function(links){
  var canvas = scene.getCanvas();
  var $links = canvas.selectAll('.link').data(links);
  var scale = CONSTANTS.LINK.KERNEL_SCALE;
  
  var $linksEnter = $links.enter()
    .append('g')
    .attr('comp-op', 'src')
    .style('opacity', 0.7)
    .classed('link', true);

  $linksEnter.append('path')
    .classed('link-base', true)
    .attr('comp-op', 'src')
    .attr('d', (d)=>(radialLine(d.data.source.kernelPoints)))
    .attr('transform', function(link){ return Utils.transform(link.data.source, scale); })
    .attr('fill', Color.link);

  $linksEnter.append('path')
    .classed('link-body', true)
    .attr('fill', Color.link)
    .attr('d', (d)=>linkBodyPath(d));

  $linksEnter.append('path')
    .classed('link-curve', true)
    .attr('fill', 'none')
    .attr('stroke','black');


  var $linksExit = $links.exit();

  $linksExit.transition().duration(2000).style('opacity', 0);

  $linksExit.transition().delay(2000).remove();
  
  $links = $links.merge($linksEnter);
  
  return {links: $links, linksExit:$linksExit};
}

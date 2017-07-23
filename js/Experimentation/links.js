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
var areaPoints = function(link){
  var points = link.body;
  var source = link.source; 
  var target = link.target; 
  var tgt = {
    x: target.x - source.x,
    y: target.y - source.y
  };
  
  var normalAngle = getNormalAngle({x:0,y:0}, tgt);
  var x = function(pt){
    return tgt.x*pt.at + pt.offset*Math.cos(normalAngle);
  };
  
  var y = function(pt){
    return tgt.y*pt.at + pt.offset*Math.sin(normalAngle);
  };

  var x0 = function(pt){
    return x(pt) - pt.width*Math.cos(normalAngle);
  };

  var x1 = function(pt){
    return x(pt) + pt.width*Math.cos(normalAngle);
  };

  var y0 = function(pt){
    return y(pt) - pt.width*Math.sin(normalAngle);
  };

  var y1 = function(pt){
    return y(pt) + pt.width*Math.sin(normalAngle);
  };

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

var linkBodyPath = function(link){ return areaPath(areaPoints(link)); }

var changePointsCurbature = function(points, curbature){
  var newPoints = points.slice();
  var sign = Utils.sign(curbature);
  var curbatureLeft = Math.abs(curbature);
  
  for(var i = 0; i < newPoints.length; i++){
    var point = newPoints[i];
    if(i == (newPoints.length-1)){
      point.offset = curbatureLeft;
    } else {
      point.offset = sign * Utils.rand.number(-5, curbatureLeft);
      curbatureLeft -= point.offset;
    }
  }
  return newPoints;
};

var reshapeLink = function(link, duration){
  link.reshaping =  true;
  link.body = link.body || CONSTANTS.LINK.DEFAULT_BODY;

  var curbature = Utils.rand.sign() * Utils.rand.number(0, 15);
  var curbatureInterpolator = d3.interpolateNumber(link.curbature||0, curbature);
  var oldBody = Utils.copy(link.body);
  var newBody = Utils.copy(oldBody);
  changePointsCurbature(newBody.slice(1,4), curbature);
  
  var bodyInterpolator = d3.interpolateArray(oldBody, newBody);

  var timer = d3.timer(function(elleapsed){
    var tr = elleapsed / duration;
    if (tr > 1.0){
      timer.stop();
      link.reshaping = false;
      tr = 1.0;
    }

    var iCurbature = curbatureInterpolator(tr);
    link.curbature = iCurbature;
    link.body = bodyInterpolator(tr);
  });
  return timer;
}
var linkReshapeInterval = null;



var reshapeLinks = function(links){
  var intervalCallback = function(){
    var pick = function(){
      return Utils.rand.pick(links.filter(function(link){ return !link.reshaping; }));
    }
    reshapeLink(pick(), animations.linkShapes.duration);
    reshapeLink(pick(), animations.linkShapes.duration);
    reshapeLink(pick(), animations.linkShapes.duration);
    reshapeLink(pick(), animations.linkShapes.duration);
    reshapeLink(pick(), animations.linkShapes.duration);
  };
  if(!this.interval){
    this.interval = d3.interval(intervalCallback, animations.linkShapes.interval);
  } else {
    this.interval.restart(intervalCallback, animations.linkShapes.interval);
  }
}
var stopReshapeLinks = function(){
  if(this.interval){
    this.interval.stop();
  }
};

var linkAnimations = {
  interval: linkReshapeInterval,
  start: reshapeLinks,
  stop: stopReshapeLinks
};

var proprietyOpacity = function(link){
  var value = link['Valeur (supp à%)'];
  var opacity = 0.15;
  if(value >= 50){
    opacity = 0.8;
  } else if(value >= 10){
    opacity = 0.4;
  }
  return opacity;

};

var linkOpacity = function(link){
  var NTYPES = CONSTANTS.DATA.TYPES.NODE;
  var TYPES = CONSTANTS.DATA.TYPES.LINK;
  var opacity;
  switch(link.type){
    case TYPES.AFFILIATION:
      if(link.data.source.type === NTYPES.LOBBY){
        opacity = CONSTANTS.LINK.AFFILIATION_OPACITY;
      } else {
        opacity = 0;
        debugger;
      }
      break; 
    case TYPES.PROPRIETARY.DIRECT:
      opacity = proprietyOpacity(link);
      break;
    default:
      opacity = 0.0;
      break;
  }
  return opacity; 
};
var drawLinks = function(links){
  var canvas = scene.getCanvas();
  var $links = canvas.selectAll('.link').data(links, function(link){
    return link.source + '--' + link.target;
  });
  var scale = CONSTANTS.LINK.KERNEL_SCALE;

  var $linksEnter = $links.enter()
    .append('g')
    .attr('class', function(link){
      return link.type.split('/').join('-') +' source-'+link.data.source.ID;
    })
  .attr('comp-op', 'src')
    .style('opacity', linkOpacity)
    .classed('link', true);

  $linksEnter.append('path')
    .classed('link-base', true)
    .attr('comp-op', 'src')
    .attr('d', (d)=>(radialLine(d.data.source.kernelPoints)))
    .attr('fill', Color.link)
    .attr('transform', 'scale('+scale+')'); 
  

  $linksEnter.append('path')
    .classed('link-body', true)
    .attr('fill', Color.link)
    .attr('d', function(link){
      link.body = CONSTANTS.LINK.DEFAULT_BODY;
      link.path = areaPath(areaPoints(link));
      return link.path;
    });

  var $linksExit = $links.exit().remove();
  /*
     $linksExit.transition().duration(1000).style('opacity', 0);

     $linksExit.transition().delay(1000).remove();
     */
  $links = $linksEnter.merge($links);

  return {links: $links, linksExit:$linksExit};
}

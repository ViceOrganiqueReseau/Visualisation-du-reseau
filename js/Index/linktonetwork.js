function setlinkURL (){
    var ID = CONST.ALLDATAFILTRE[CONST.ALLDATAFILTRE.length-1][0]["ID"];
    var themeid = idToTheme.indexOf(choices[0]);
    console.log("reseau.html?theme="+themeid+"&id="+ID)
    CONST.RESULT.D3.select("a").attr("href", "reseau.html?theme="+themeid+"&id="+ID);
}

function visiblelink (){
  if (nbloby===1){
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight){
      CONST.RESULT.D3.selectAll(".link").style("display", "block");
    } else {
      CONST.RESULT.D3.selectAll(".link").style("display", "none");
    }
  }
}
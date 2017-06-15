var returner = document.getElementById('reloadbox');

window.onbeforeunload = function(){
	window.scrollTo(0,0);
}

returner.addEventListener("click", function() {
	window.scrollTo(0,0);
	document.location.reload();
});
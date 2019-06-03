chrome.runtime.sendMessage(
	{greeting: "hello"}, 
	function(response) {
		var itemsDict = response.itemsDict;
		console.log("got itemDict with " + itemsDict.itemsNum + " items");
		alert("got itemDict with " + itemsDict.itemsNum + " items");
	}
);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	if(request.results){
		var count = request.results['count']
		var str = 'Did you remember buying:\n';
		for (i = 1 ; i < count+1; i++) { 
			str += request.results[i] + '\n' ;
		}
		str += '\nPress ok to stop seeing this popup'
		stopBugging = confirm(str);
		sendResponse({"stopBugging": stopBugging});
	}
});
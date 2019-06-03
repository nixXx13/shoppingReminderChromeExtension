var config;
getConfigParams()

chrome.browserAction.onClicked.addListener(function(tab) { 
	if (stopAlert === false)
		stopAlert = true;
	else
		stopAlert = false;
	alert('update sheet url')

});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	var sourceUrl = sender.url;
	console.log("got message from " + sourceUrl);
	var site = new RegExp("www.([a-zA-Z0-9-_.]+)").exec(config.shopping_url)[1];	// TODO - should do regex op once!
	if (sourceUrl.includes(site) === true){
		if (stopAlert === false){
			itemsToBuy();
		}
	}
  });
  
function itemsToBuy(){
	console.log("Collecting items to itemsDict...")
	var items = {};

	params = extractParams();
	var spreadsheetId 	= params['spreadsheetId']
	var sheetId 		= params['sheetId']
	var googleApiUrl 	= 'https://sheets.googleapis.com/v4/spreadsheets/'
	
	requestUrl = googleApiUrl + spreadsheetId + '/values/'+ sheetId+ '!A:A?key=' + config.apiToken
	fetch(requestUrl ).then(r => r.text()).then(result => {
		
		var jsonResult = JSON.parse(result);		
		var len = jsonResult.values.length-1;
		for (i = 1 ; i < len+1; i++) { 
			items[i] = jsonResult.values[i][0] ;
		}
		items["count"] = len;
		console.log(items)
		sendResults(items);
	})
}

var stopAlert = false;
// TODO - persistent?
// TODO - timer - https://stackoverflow.com/questions/41632942/how-to-measure-time-elapsed-on-javascript
function sendResults(items){
	console.log('sending results')
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(
			tabs[0].id, 
			{results: items} ,
			function(response) {
				console.log(response.stopBugging);
				stopAlert = response.stopBugging;
			});	
	});
}

function getConfigParams(){
	const url = chrome.runtime.getURL('config.json');
	fetch(url).then((response) => response.json()).then((json) => config = json);
}

function extractParams(){
	// NOTE - spreadsheet must be public! 
	spreadsheetId = new RegExp("/spreadsheets/d/([a-zA-Z0-9-_]+)").exec(config.url)[1];
	sheetId = new RegExp("[#&]gid=([0-9]+)").exec(config.url)[1];
		
	if (sheetId === "0" ){
		sheetId = "Sheet1";
	}
	
	var params = {};
	params["spreadsheetId"] = spreadsheetId;
	params["sheetId"] = sheetId;
	
	return params;
}



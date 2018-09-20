chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({ color: "#3aa757" }, function() {
    console.log("The color is green.");
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: "developer.chrome.com" }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
});

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//   if (changeInfo.status === "complete") {
//     console.log(tabId);
//     console.log(changeInfo);
//     console.log(tab);
//     // chrome.tabs.executeScript(tab.id, { file: "contentScript.js" });
//   }
// });

// chrome.runtime.onMessage.addListener(function(message, callback) {
//   if (message == "changeColor") {
//     chrome.tabs.executeScript({
//       code: 'document.body.style.backgroundColor="orange"'
//     });
//   }
// });

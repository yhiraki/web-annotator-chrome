let toggleButton = document.getElementById("toggle-pen");

toggleButton.onclick = function(element) {
  console.log("clicked");
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, "togglePen");
  });
};

console.log("load done");

'use strict';

chrome.runtime.onInstalled.addListener(function() {
  var enabled = false;
  chrome.storage.sync.set({ enabled: enabled }, function() {
    console.log('initialied as ' + enabled);
  });
  setIcon(enabled);
});

function setIcon(enabled) {
  console.log('marker_' + enabled + '_32.png');
  chrome.browserAction.setIcon({
    path: 'images/marker_' + enabled + '_32.png'
  });
}

function updateEnabledStatus() {
  chrome.storage.sync.get('enabled', function(data) {
    var enabled = !data.enabled;
    chrome.storage.sync.set({ enabled: enabled }, function() {
      console.log('set to ' + enabled);
    });
    setIcon(enabled);
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var message = enabled ? 'enablePen' : 'disablePen';
      chrome.tabs.sendMessage(tabs[0].id, message);
    });
  });
}

chrome.browserAction.onClicked.addListener(updateEnabledStatus);

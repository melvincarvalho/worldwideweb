chrome.webRequest.onHeadersReceived.addListener(
  function(details) {
    for (var header of details.responseHeaders) {
      if (header.name.toLowerCase() === 'content-type' && header.value.toLowerCase().includes('text/turtle')) {
        // Redirect to the data browser page with the original URL as a parameter
        var redirectUrl = chrome.runtime.getURL('databrowser.html') + '?uri=' + encodeURIComponent(details.url);
        return { redirectUrl: redirectUrl };
      }
    }
  },
  { urls: ["<all_urls>"], types: ["main_frame"] },
  ["blocking", "responseHeaders"]
);


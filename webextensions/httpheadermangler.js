/**
 * 
 *    HTTP Header Mangler, v. 1.1.3
 *
 *    by Peter Nilsson <hello@disptr.net>
 *
 *
 *    This Source Code Form is subject to the terms of the Mozilla Public
 *    License, v. 2.0. If a copy of the MPL was not distributed with this
 *    file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
*/

'use strict';

var rules = [];

console.log("Loading HTTP Header Mangler");

browser.storage.local.get("rules").then(
  function(result) {
    if (result.rules) {
      rules = [];

      var tokens = result.rules.split("\n");
      var matches = [];
      var headers = [];

      var parseRule = function () {
        for (var m in matches) {
          var match = matches[m];
          for (var h in headers) {
            var header = headers[h]
            console.log("Adding rule: " + match + " => " + header.name + "=" + header.value);
            rules.push({
              match: match,
              name: header.name,
              value: header.value
            });
          }
        }
      }

      for (var t in tokens) {
        var token = tokens[t].trim();

        if (token.length === 0) {
          parseRule();
          matches = [];
          headers = [];
        } else if (token.charAt(0) == '#') {
          continue;
        } else {
          var index = token.indexOf("=");
          if (index === -1) {
            matches.push(token);
          } else if (index > 0 && token.length - index > 1) {
            var name = token.substring(0, index).trim();
            var value = token.substring(index + 1).trim();
            if (value === '""' || value === "''"){
              value = '';
            };
            headers.push({
              name: name,
              value: value
            });
          }
        }
      }

      parseRule();
    }
  },
  function(error) {
    console.log(`Error: ${error}`);
  }
);

browser.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    rules: for (var rule of rules) {
      if (details.url.search(rule.match) !== -1) {
        for (var header of details.requestHeaders) {
          if (header.name.toLowerCase() === rule.name.toLowerCase()) {
            console.log("Rewriting header: " + rule.match + " => " + header.name + "=" + rule.value);
            header.value = rule.value;
            continue rules;
          }
        }
        // If we are here, we didn't find any existing matching header.
        console.log("Adding header: " + rule.match + " => " + rule.name + "=" + rule.value);
        details.requestHeaders.push({ name:rule.name, value:rule.value });
      }
    }
    return { requestHeaders: details.requestHeaders };
  },
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"]
);


/**
 * 
 *    HTTP Header Mangler, v. 1.0
 *
 *    by Peter Nilsson <disptr@patriarkatet.se>
 *
 *
 *    This Source Code Form is subject to the terms of the Mozilla Public
 *    License, v. 2.0. If a copy of the MPL was not distributed with this
 *    file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
*/

'use strict';

const {Cc,Ci} = require("chrome");
const Prefs = require("sdk/simple-prefs");
const Request = require("sdk/request").Request;

var HttpRequestObserver;

exports.main = function(options, callbacks)
{
	var Rules = [];

	var onRulesFile = function(prefName)
	{
		Request({
			url: "file://" + Prefs.prefs["rules_file"],
			overrideMimeType: "text/plain",
			onComplete: function(response)
			{
				if (response.text) {
					Rules = [];

					var tokens = response.text.split("\n");
					var matches = [];
					var headers = [];

					var parseRule = function ()
					{
						for (var m in matches) {
							var match = matches[m];
							for (var h in headers) {
								var header = headers[h]
								Rules.push({
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
			}
		}).get();
	}

	Prefs.on("rules_file", onRulesFile);
	Prefs.on("rules_file_update", onRulesFile);

	HttpRequestObserver =  
	{  
		observe: function(subject, topic, data)  
		{  
			if (topic == "http-on-modify-request") {
				var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
				for (var r in Rules) {
					var rule = Rules[r];
					if (httpChannel.originalURI.host.search(rule.match) !== -1) {
						httpChannel.setRequestHeader(rule.name, rule.value, false);
					}
				}
			}  
		}, 

		register: function()  
		{ 
			var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);  
			observerService.addObserver(this, "http-on-modify-request", false);  
		},

		unregister: function()  
		{
			var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);  
			observerService.removeObserver(this, "http-on-modify-request");
		}  
	};

	HttpRequestObserver.register();

	onRulesFile();
};

exports.onUnload = function(reason)
{
	HttpRequestObserver.unregister();
};


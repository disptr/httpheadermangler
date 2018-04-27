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

const rulesTextarea = document.querySelector("#hhm-rules-textarea");

document.querySelector("#hhm-rules-save-button").addEventListener("click",
  function(e) {
    e.preventDefault();
    console.log("Saving rules.");
    browser.storage.local.set({
      rules: rulesTextarea.value
    });
    browser.runtime.reload();
  }
);

browser.storage.local.get("rules").then(
  function(result) {
    rulesTextarea.value = result.rules || "";
  },
  function(error) {
    console.log(`Error: ${error}`);
  }
);


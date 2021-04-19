// ==UserScript==
// @name         Disable Closeable PRs
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Prompts before merging a green build.
// @author       Midhun Krishna
// @include      /^https:\/\/github.com\/.+\/pull\/\d+/
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js#sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';
  jQuery.noConflict();
  jQuery('.btn-group-merge').first().hide();
  var btn = '<button type="button" class="btn-group-merge-duplicate rounded-left-1 btn btn-primary BtnGroup-item" aria-expanded="false" style="">Merge pull request</button>';
  jQuery('.select-menu.d-inline-block .BtnGroup').first().prepend(jQuery.parseHTML(btn));

  jQuery('.btn-group-merge-duplicate').on('click', function(e) {
    if (confirm("Following feature branches. Is the ticket done?")) {
      jQuery('.btn-group-merge').first().click();
    }
  });
})();

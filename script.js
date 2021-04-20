// ==JsHint==
/* globals jQuery, $, waitForKeyElements */
// ==/JsHint==

// ==UserScript==
// @name         Disable Closeable PRs
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Prompts before merging a green build.
// @author       Midhun Krishna
// @include      /^https:\/\/github.com\/.+\/pull\/\d+/
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js#sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==
// @run-at       document-idle

// ==/UserScript==

window.setInterval = window.setInterval.bind(window);
window.clearInterval = window.clearInterval.bind(window);

var disableButtons = function (mergeButton, mergeDropDown, buttonGroup) {
  mergeButton.prop('disabled', true).removeClass('btn-primary');
  mergeDropDown.hide();
  var disabledMergeDropDown = '<button id="disabled_merge_dropdown" type="button" class="btn select-menu-button BtnGroup-item" aria-label="Select merge method" disabled=""></button>';
  buttonGroup.append(disabledMergeDropDown);
};

var showCheckboxes = function () {
  var ticketDone = '<input type="checkbox" id="ticket_done" name="ticketDone" ><label for="ticket_done"> Following feature branches. Is the ticket done?</label><br>';
  var rebaseDone = '<input type="checkbox" id="rebase_done" name="rebaseDone" ><label for="rebase_done"> Did you rebase this PR with develop?</label><br>';
  var branchItem = '<div id="branch-item-duplicate" class="branch-action-item"><div class="branch-action-item-icon completeness-indicator completeness-indicator-error"><svg class="octicon octicon-x" height="16" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true"><path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path></svg></div><div class="h4 status-heading color-text-danger">Merging is blocked</div><span class="status-meta">Merging can be enabled by checking the following:</span><br>' + ticketDone + rebaseDone + '</div>';
  jQuery(branchItem).insertBefore('.merge-message');
};

var showStepCompleted = function () {
  var completedStep = '<div class="branch-action-item" id="branch-item-duplicate-complete"> <div class="merging-body squashing-body"> <div class="branch-action-item-icon completeness-indicator completeness-indicator-success"> <svg class="octicon octicon-check" height="16" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true"><path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg> </div> <h3 class="h4 status-heading">Merging is now enabled</h3> <div class="review-status-item d-flex flex-justify-between"> <div class="merge-status-icon"> <svg class="octicon octicon-check mx-auto d-block color-text-success" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg> </div> <div class="color-text-secondary mr-3 flex-auto flex-self-start"> <strong class="text-emphasized"> Ticket is DONE by following feature branches </strong> </div> </div> <div class="review-status-item d-flex flex-justify-between"> <div class="merge-status-icon"> <svg class="octicon octicon-check mx-auto d-block color-text-success" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg> </div> <div class="color-text-secondary mr-3 flex-auto flex-self-start"> <strong class="text-emphasized"> PR is rebased with develop </strong> </div> </div> </div> </div>';
  jQuery(completedStep).insertBefore('.merge-message');
};

var clickHandler = function (checkBoxState, mergeButton, mergeDropDown, branchItemDuplicate, disabledMergeDropdown) {
  return function (e) {
    var checkBox = jQuery(e.currentTarget);
    var name = checkBox.prop('name');
    checkBoxState[name] = checkBox.is(':checked');
    if(checkBoxState.ticketDone && checkBoxState.rebaseDone) {
      branchItemDuplicate.hide();
      mergeButton.prop('disabled', false).addClass('btn-primary');
      mergeDropDown.show();
      disabledMergeDropdown.hide();
      showStepCompleted();
    }
  };
};

var userScript = function (mergeButton) {
  if(mergeButton.is(':enabled')) {
    // disable buttons
    var mergeDropDown = jQuery('.js-merge-box summary');
    var buttonGroup = jQuery('.js-merge-box .BtnGroup');
    disableButtons(mergeButton, mergeDropDown, buttonGroup);
    // show checkboxes
    showCheckboxes();

    // state management
    var checkBoxState = {ticketDone: false, rebaseDone: false};

    // handle checkbox clicks
    var branchItemDuplicate = jQuery('#branch-item-duplicate');
    var disabledMergeDropdown = jQuery('#disabled_merge_dropdown');
    var handler = clickHandler(checkBoxState, mergeButton, mergeDropDown, branchItemDuplicate, disabledMergeDropdown);
    jQuery('#ticket_done').click(handler);
    jQuery('#rebase_done').click(handler);
  }
};

(function() {
  'use strict';
  jQuery.noConflict();
  var intervalLimit = 50, i = 0;
  var mergeButton = undefined;

  var interval = window.setInterval(function() {
   mergeButton = jQuery('button:contains("Merge pull request")').first();
   if (mergeButton.get(0)) {
     window.clearInterval(interval);
     userScript(mergeButton);
   } else {
     (i = i + 1) == intervalLimit ? window.clearInterval(interval) : null;
   }
  }, 100);
})();

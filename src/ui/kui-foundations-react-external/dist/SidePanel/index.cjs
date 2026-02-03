/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var SidePanel_js = require('./components/base/SidePanel.cjs');
var SidePanelRoot_js = require('./components/composed/SidePanelRoot.cjs');
var SidePanelContent_js = require('./components/composed/SidePanelContent.cjs');
var SidePanelFooter_js = require('./components/composed/SidePanelFooter.cjs');
var SidePanelHeading_js = require('./components/composed/SidePanelHeading.cjs');
var SidePanelMain_js = require('./components/composed/SidePanelMain.cjs');
var SidePanelTrigger_js = require('./components/composed/SidePanelTrigger.cjs');
var constants_js = require('./constants.cjs');



Object.defineProperty(exports, "SidePanel", {
  enumerable: true,
  get: function () { return SidePanel_js.SidePanel; }
});
Object.defineProperty(exports, "SidePanelRoot", {
  enumerable: true,
  get: function () { return SidePanelRoot_js.SidePanelRoot; }
});
Object.defineProperty(exports, "SidePanelContent", {
  enumerable: true,
  get: function () { return SidePanelContent_js.SidePanelContent; }
});
Object.defineProperty(exports, "SidePanelFooter", {
  enumerable: true,
  get: function () { return SidePanelFooter_js.SidePanelFooter; }
});
Object.defineProperty(exports, "SidePanelHeading", {
  enumerable: true,
  get: function () { return SidePanelHeading_js.SidePanelHeading; }
});
Object.defineProperty(exports, "SidePanelMain", {
  enumerable: true,
  get: function () { return SidePanelMain_js.SidePanelMain; }
});
Object.defineProperty(exports, "SidePanelTrigger", {
  enumerable: true,
  get: function () { return SidePanelTrigger_js.SidePanelTrigger; }
});
Object.defineProperty(exports, "SidePanelTestIds", {
  enumerable: true,
  get: function () { return constants_js.SidePanelTestIds; }
});

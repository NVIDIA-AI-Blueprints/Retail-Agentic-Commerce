/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var Tabs_js = require('./components/base/Tabs.cjs');
var TabsRoot_js = require('./components/composed/TabsRoot.cjs');
var TabsList_js = require('./components/composed/TabsList.cjs');
var TabsTrigger_js = require('./components/composed/TabsTrigger.cjs');
var TabsContent_js = require('./components/composed/TabsContent.cjs');
var constants_js = require('./constants.cjs');



Object.defineProperty(exports, "Tabs", {
  enumerable: true,
  get: function () { return Tabs_js.Tabs; }
});
Object.defineProperty(exports, "TabsRoot", {
  enumerable: true,
  get: function () { return TabsRoot_js.TabsRoot; }
});
Object.defineProperty(exports, "TabsList", {
  enumerable: true,
  get: function () { return TabsList_js.TabsList; }
});
Object.defineProperty(exports, "TabsTrigger", {
  enumerable: true,
  get: function () { return TabsTrigger_js.TabsTrigger; }
});
Object.defineProperty(exports, "TabsContent", {
  enumerable: true,
  get: function () { return TabsContent_js.TabsContent; }
});
Object.defineProperty(exports, "TabsTestIds", {
  enumerable: true,
  get: function () { return constants_js.TabsTestIds; }
});

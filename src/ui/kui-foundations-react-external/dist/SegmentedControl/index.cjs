/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var SegmentedControl_js = require('./components/base/SegmentedControl.cjs');
var SegmentedControlRoot_js = require('./components/composed/SegmentedControlRoot.cjs');
var SegmentedControlItem_js = require('./components/composed/SegmentedControlItem.cjs');
var constants_js = require('./constants.cjs');



Object.defineProperty(exports, "SegmentedControl", {
  enumerable: true,
  get: function () { return SegmentedControl_js.SegmentedControl; }
});
Object.defineProperty(exports, "SegmentedControlRoot", {
  enumerable: true,
  get: function () { return SegmentedControlRoot_js.SegmentedControlRoot; }
});
Object.defineProperty(exports, "SegmentedControlItem", {
  enumerable: true,
  get: function () { return SegmentedControlItem_js.SegmentedControlItem; }
});
Object.defineProperty(exports, "SegmentedControlTestIds", {
  enumerable: true,
  get: function () { return constants_js.SegmentedControlTestIds; }
});

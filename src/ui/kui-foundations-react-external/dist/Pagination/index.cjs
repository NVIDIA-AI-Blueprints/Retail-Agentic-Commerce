/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var Pagination_js = require('./components/base/Pagination.cjs');
var PaginationRoot_js = require('./components/composed/PaginationRoot.cjs');
var PaginationPageSizeSelect_js = require('./components/composed/PaginationPageSizeSelect.cjs');
var PaginationItemRangeText_js = require('./components/composed/PaginationItemRangeText.cjs');
var PaginationPageList_js = require('./components/composed/PaginationPageList.cjs');
var PaginationArrowButton_js = require('./components/composed/PaginationArrowButton.cjs');
var PaginationPageInput_js = require('./components/composed/PaginationPageInput.cjs');
var PaginationControlsGroup_js = require('./components/composed/PaginationControlsGroup.cjs');
var PaginationNavigationGroup_js = require('./components/composed/PaginationNavigationGroup.cjs');
var constants_js = require('./constants.cjs');



Object.defineProperty(exports, "Pagination", {
  enumerable: true,
  get: function () { return Pagination_js.Pagination; }
});
Object.defineProperty(exports, "PaginationRoot", {
  enumerable: true,
  get: function () { return PaginationRoot_js.PaginationRoot; }
});
Object.defineProperty(exports, "PaginationPageSizeSelect", {
  enumerable: true,
  get: function () { return PaginationPageSizeSelect_js.PaginationPageSizeSelect; }
});
Object.defineProperty(exports, "PaginationItemRangeText", {
  enumerable: true,
  get: function () { return PaginationItemRangeText_js.PaginationItemRangeText; }
});
Object.defineProperty(exports, "PaginationPageList", {
  enumerable: true,
  get: function () { return PaginationPageList_js.PaginationPageList; }
});
Object.defineProperty(exports, "PaginationArrowButton", {
  enumerable: true,
  get: function () { return PaginationArrowButton_js.PaginationArrowButton; }
});
Object.defineProperty(exports, "PaginationPageInput", {
  enumerable: true,
  get: function () { return PaginationPageInput_js.PaginationPageInput; }
});
Object.defineProperty(exports, "PaginationControlsGroup", {
  enumerable: true,
  get: function () { return PaginationControlsGroup_js.PaginationControlsGroup; }
});
Object.defineProperty(exports, "PaginationNavigationGroup", {
  enumerable: true,
  get: function () { return PaginationNavigationGroup_js.PaginationNavigationGroup; }
});
Object.defineProperty(exports, "PaginationTestIds", {
  enumerable: true,
  get: function () { return constants_js.PaginationTestIds; }
});

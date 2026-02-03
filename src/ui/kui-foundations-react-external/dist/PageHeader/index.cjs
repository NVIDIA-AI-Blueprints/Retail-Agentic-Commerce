/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var PageHeader_js = require('./components/base/PageHeader.cjs');
var PageHeaderRoot_js = require('./components/composed/PageHeaderRoot.cjs');
var PageHeaderContent_js = require('./components/composed/PageHeaderContent.cjs');
var PageHeaderHeader_js = require('./components/composed/PageHeaderHeader.cjs');
var PageHeaderSubheading_js = require('./components/composed/PageHeaderSubheading.cjs');
var PageHeaderHeading_js = require('./components/composed/PageHeaderHeading.cjs');
var PageHeaderDescription_js = require('./components/composed/PageHeaderDescription.cjs');
var PageHeaderMain_js = require('./components/composed/PageHeaderMain.cjs');
var PageHeaderFooter_js = require('./components/composed/PageHeaderFooter.cjs');
var constants_js = require('./constants.cjs');



Object.defineProperty(exports, "PageHeader", {
  enumerable: true,
  get: function () { return PageHeader_js.PageHeader; }
});
Object.defineProperty(exports, "PageHeaderRoot", {
  enumerable: true,
  get: function () { return PageHeaderRoot_js.PageHeaderRoot; }
});
Object.defineProperty(exports, "PageHeaderContent", {
  enumerable: true,
  get: function () { return PageHeaderContent_js.PageHeaderContent; }
});
Object.defineProperty(exports, "PageHeaderHeader", {
  enumerable: true,
  get: function () { return PageHeaderHeader_js.PageHeaderHeader; }
});
Object.defineProperty(exports, "PageHeaderSubheading", {
  enumerable: true,
  get: function () { return PageHeaderSubheading_js.PageHeaderSubheading; }
});
Object.defineProperty(exports, "PageHeaderHeading", {
  enumerable: true,
  get: function () { return PageHeaderHeading_js.PageHeaderHeading; }
});
Object.defineProperty(exports, "PageHeaderDescription", {
  enumerable: true,
  get: function () { return PageHeaderDescription_js.PageHeaderDescription; }
});
Object.defineProperty(exports, "PageHeaderMain", {
  enumerable: true,
  get: function () { return PageHeaderMain_js.PageHeaderMain; }
});
Object.defineProperty(exports, "PageHeaderFooter", {
  enumerable: true,
  get: function () { return PageHeaderFooter_js.PageHeaderFooter; }
});
Object.defineProperty(exports, "PageHeaderTestIds", {
  enumerable: true,
  get: function () { return constants_js.PageHeaderTestIds; }
});

/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"exed/com/quotamanager_report/test/integration/PhoneJourneys"
	], function () {
		QUnit.start();
	});
});

/*global location */
sap.ui.define([
	"exed/com/quotamanager_report/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"exed/com/quotamanager_report/model/formatter",
	"sap/ui/Device",
	'sap/ui/model/type/String',
	'sap/m/Token',
	'sap/ui/comp/library',
], function (BaseController, JSONModel, formatter, Device, TypeString, Token, compLibrary) {
	"use strict";

	var iZusergc;

	return BaseController.extend("exed.com.quotamanager_report.controller.Detail", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0
			});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));

			// Multiple Conditions
			// this._oMultipleConditionsInput = this.byId("multipleConditions");
			// this._oMultipleConditionsInput.setTokens(this._getDefaultTokens());

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function () {
			var oViewModel = this.getModel("detailView");

			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		// #region Multiple Conditions
		onMultipleConditionsVHRequested: function () {
			if (!this.pMultipleConditionsDialog) {
				this.pMultipleConditionsDialog = this.loadFragment({
					name: "exed.com.quotamanager_report.view.MultiInput"
				});
			}
			this.pMultipleConditionsDialog.then(function (oMultipleConditionsDialog) {
				if (this._bMultipleConditionsInitialized) {
					oMultipleConditionsDialog.open();
					return;
				}
				this._oMultipleConditionsDialog = oMultipleConditionsDialog;
				this.getView().addDependent(oMultipleConditionsDialog);
				oMultipleConditionsDialog.setRangeKeyFields([{
					label: "Sales Order",
					key: "Vbeln",
					type: "string",
					typeInstance: new TypeString({}, {
						maxLength: 40
					})
				}]);

				oMultipleConditionsDialog.setTokens(this._oMultipleConditionsInput.getTokens());
				this._bMultipleConditionsInitialized = true;
				oMultipleConditionsDialog.open();
			}.bind(this));
		},
		onMultipleConditionsValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oMultipleConditionsInput.setTokens(aTokens);
			this._oMultipleConditionsDialog.close();
		},
		onMultipleConditionsCancelPress: function () {
			this._oMultipleConditionsDialog.close();
		},

		_getDefaultTokens: function () {
			var ValueHelpRangeOperation = compLibrary.valuehelpdialog.ValueHelpRangeOperation;
			var oToken1 = new Token({
				key: "Vbeln",
				text: "CP 141 PL14"
			}).data("range", {
				"exclude": false,
				"operation": ValueHelpRangeOperation.EQ,
				"keyField": "Vbeln",
				"value1": "CP 141 PL14",
				"value2": ""
			});

			return [oToken1];
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("detailView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});

			oShareDialog.open();
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			/*		var sObjectId =  oEvent.getParameter("arguments").objectId;
					this.getModel().metadataLoaded().then( function() {
						var sObjectPath = this.getModel().createKey("zapo_acessoSet", {
							Zusergc :  sObjectId
						});
						this._bindView("/" + sObjectPath);
					}.bind(this));*/

			iZusergc = oEvent.getParameter("arguments").objectId;
			//	this.executaFiltro(iZusergc);

			//		this.getView().byId("page").setTitle("Carteira SKP" + " - " + "(" + iZusergc + ")");

		},
		onSliderMoved: function (oEvent) {
			var iValue = oEvent.getParameter("value");
			var oTable = this.byId("idSmartTable").getTable();

			if (iValue === 0) {
				oTable.setContextualWidth("Phone");
			} else if (iValue === 1) {
				oTable.setContextualWidth("Tablet");
			} else if (iValue === 2) {
				oTable.setContextualWidth("auto");
			}
		},

		onBeforeExport: function (oEvt) {
			var mExcelSettings = oEvt.getParameter("exportSettings");
			// GW export
			if (mExcelSettings.url) {
				return;
			}
			// For UI5 Client Export --> The settings contains sap.ui.export.SpreadSheet relevant settings that be used to modify the output of excel

			// Disable Worker as Mockserver is used in Demokit sample --> Do not use this for real applications!
			mExcelSettings.worker = false;
		},

		executaFiltro: function (iZusergc) {

			var valor = iZusergc;
			var filter = new sap.ui.model.Filter("Zuname", sap.ui.model.FilterOperator.EQ, valor);
			var list = this.getView().byId("list");
			list.getBinding("items").filter([filter]);
		},

		// region Single Condition value help
		onSingleConditionVHRequested: function () {
			if (!this.pSingleConditionDialog) {
				this.pSingleConditionDialog = this.loadFragment({
					name: "sap.ui.comp.sample.valuehelpdialog.conditionsOnly.ValueHelpDialogSingleConditionTab"
				});
			}
			this.pSingleConditionDialog.then(function (oSingleConditionDialog) {
				if (this._bSingleConditionInitialized) {
					oSingleConditionDialog.open();
					return;
				}
				this._oSingleConditionDialog = oSingleConditionDialog;
				oSingleConditionDialog.setRangeKeyFields([{
					label: "Sales Order",
					key: "Vbeln",
					type: "string",
					typeInstance: new TypeString({}, {
						maxLength: 10
					})
				}]);

				oSingleConditionDialog.setTokens(this._oSingleConditionMultiInput.getTokens());
				this._bSingleConditionInitialized = true;
				oSingleConditionDialog.open();
			}.bind(this));
		},

		onSingleConditionValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oSingleConditionMultiInput.setTokens(aTokens);
			this._oSingleConditionDialog.close();
		},
		onSingleConditionCancelPress: function () {
			this._oSingleConditionDialog.close();
		},

		onSelectionChange: function (oEvent) {
			// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
			//this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());

			var oItem = oEvent.getParameter("listItem");
			var Skup = oItem.getBindingContext().getProperty("ZzbrAtpskp");
			this.getRouter().navTo("Remanejar", {
				Skup: btoa(JSON.stringify(Skup)),
				Zuserid: iZusergc

			}, true);

		},

		onSearchKunnr: function (oEvent) {
			var valor = oEvent.getParameter("query");
			var list = this.getView().byId("list");
			var filter = new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.Contains, valor);
			list.getBinding("items").filter([filter]);
			//  this.onRefresh();
		},

		onSearchKunnrName: function (oEvent) {
			var valor = oEvent.getParameter("query");
			var list = this.getView().byId("list");
			var filter = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, valor);
			list.getBinding("items").filter([filter]);

		},
		
	

		onSearchSKU: function (oEvent) {
			var valor = oEvent.getParameter("query");
			var list = this.getView().byId("list");
			var filter = new sap.ui.model.Filter("ZzbrAtpskp", sap.ui.model.FilterOperator.Contains, valor);
			list.getBinding("items").filter([filter]);

		},
		
			onSearchKunn2Name: function (oEvent) {
			var valor = oEvent.getParameter("query");
			var list = this.getView().byId("list1");
			var filter = new sap.ui.model.Filter("Kunn2Name", sap.ui.model.FilterOperator.Contains, valor);
			list.getBinding("items").filter([filter]);
			//  this.onRefresh();
		},
		
			onSearchGcdoadorName: function (oEvent) {
			var valor = oEvent.getParameter("query");
			var list = this.getView().byId("list1");
			var filter = new sap.ui.model.Filter("ZgcdoadorName", sap.ui.model.FilterOperator.Contains, valor);
			list.getBinding("items").filter([filter]);
			//  this.onRefresh();
		},
		
			onSearchPlanningSKU1: function (oEvent) {
			var valor = oEvent.getParameter("query");
			var list = this.getView().byId("list1");
			var filter = new sap.ui.model.Filter("ZzbrAtpskp", sap.ui.model.FilterOperator.Contains, valor);
			list.getBinding("items").filter([filter]);

		},
		
		
			onSearchKunnrDoadorName3: function (oEvent) {
			var valor = oEvent.getParameter("query");
			var list = this.getView().byId("list3");
			var filter = new sap.ui.model.Filter("ZunnrDoadorName", sap.ui.model.FilterOperator.Contains, valor);
			list.getBinding("items").filter([filter]);
			//  this.onRefresh();
		},
		
		onSearchKunnrName3: function (oEvent) {
			var valor = oEvent.getParameter("query");
			var list = this.getView().byId("list3");
			var filter = new sap.ui.model.Filter("KunnrName", sap.ui.model.FilterOperator.Contains, valor);
			list.getBinding("items").filter([filter]);
			//  this.onRefresh();
		},

		onSearch: function (oEvent) {
			var valor = oEvent.getParameter("query");
			var list = this.getView().byId("list");
			var filter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.Contains, valor);
			var filter1 = new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.EQ, valor);
			// list.getBinding("items").filter([filter, filter1]);
			list.getBinding("items").filter([filter]);
			//  this.onRefresh();
		},

		onNavBack: function () {
			this.getRouter().navTo("master");
		},

		onRefresh: function () {

			window.location.reload();

		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.Zusergc,
				sObjectName = oObject.Znomegc,
				oViewModel = this.getModel("detailView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);

		}

	});

});
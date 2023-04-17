sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue : function (sValue) {
			if (!sValue) {
				return parseFloat(sValue).toFixed(3);
			}

			return parseFloat(sValue).toFixed(3);
		},
		
		chgIcon : function (oIcon){
			if (oIcon =="Lack"){
				return "sap-icon://error";		
			}
			
			if (oIcon =="Rejected"){
				return "sap-icon://error";		
			}
			
			if (oIcon =="Requested"){
				return "sap-icon://alert";		
			}
			
			if (oIcon =="Partial"){
				return "sap-icon://alert";		
			}
			
				if (oIcon =="Total"){
				return "sap-icon://sys-enter-2";		
			}
			
		},
		
		chgState : function (oValue){
			if (oValue == "Lack") {
				return "Error";
			}
			
			if (oValue == "Requested") {
				return "Warning";
			}
			
			if (oValue == "Partial") {
				return "Warning";
			}

			if (oValue == "Rejected") {
					return "Error";
			}
			
				if (oValue == "Total") {
					return "Success";
			}

			if (oValue == "Z") {
				return "None";
			}
			
		}
		
	};
});
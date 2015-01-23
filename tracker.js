/**
* A utility to tracking gps html5 with unique ID user and send to servir with ajax
* each N time.
*
* @class Tracker
* @autor @jamesjara
*/
function Tracker() {

	this.webserviceUrl = null;
	this.changeCallBack = null;
	this.onErrorCallBack = null;
	this.configArray = null;
	this.savingInterval = null;
	this.userId = null;
	this.loadedJQ = false;
	this.data = [];

	this.setWebserviceUrl = function(webserviceUrl) {
		console.log('setWebserviceUrl');
		this.webserviceUrl = webserviceUrl;
	};
	this.getWebserviceUrl = function() {
		return this.webserviceUrl;
	};
	this.setGPSConfiguration = function(array) {
		console.log('setGPSConfiguration');
		this.configArray = array;
	};
	this.onChange = function(callback) {
		console.log('onChange');
		this.changeCallBack = callback;
	};
	this.onChangePosition = function(data) {
		console.log('onChangePosition');
		if (this.ProcessGpsData(data)) {
			this.changeCallBack(data);
		} else {
			alert('error saving gps data ');
		}
	};
	this.onError = function(callback) {
		console.log('onError');
		this.onErrorCallBack = callback;
	};
	this.ProcessGpsData = function(callback) {
		console.log('ProcessGpsData');
		return this.saveData(callback);
	};
	this.isOk = function() {
		var result = true;
		console.log('isOkWs');
		if (this.webserviceUrl == null)
			result = false;
		if (!window.jQuery)
			result = false;
		if (this.userId == null)
			result = false;
		return result;
	};
	this.saveData = function(pos) {
		console.log('saveData');
		var temp = new Array();
		temp[0] = this.getUserId();
		temp[1] = pos.coords.accuracy;
		temp[2] = pos.coords.altitude;
		temp[3] = pos.coords.altitudeAccuracy;
		temp[4] = pos.coords.heading;
		temp[5] = pos.coords.latitude;
		temp[6] = pos.coords.longitude;
		temp[7] = pos.coords.speed;
		this.data.push(temp);
		return true;
	};
	this.sendData = function() { // TODO must be sincronico , validar response
		console.log('sendData');
		if (this.isOk()) {
			console.log(this.data.length);
			if (this.data.length >= 1) {
				console.log('data before send');
				console.log(this.getData());
				window.jQuery.ajax({
					type : "GET",
					url : this.getWebserviceUrl(),
					cache : false,
					data : {data:this.getData()}
				});
				this.resetData();
			}
		} else {
			console.log('imcomplete configuration or jquery missing ');
			this.injectJquery();
		}
	};
	this.getData = function() {
		return JSON.stringify(this.data); // TODO Verify if this is suppoted
											// by all browser
	};
	this.resetData = function() {
		console.log('resetData');
		this.data = [];
	};
	this.setSavingInterval = function(value) {
		this.savingInterval = value.valueOf();
	};
	this.getSavingInterval = function() {
		return this.savingInterval;
	};
	this.setUserId = function(value) {
		this.userId = value;
	};
	this.getUserId = function() {
		return this.userId;
	};
	this.loadedJquery = function(value) {
		this.loadedJQ = value;
	};
	this.injectJquery = function(callback) {
		console.log('injectJquery');
		if (this.loadedJQ == false && !window.jQuery) {
			console.log('!window.jQuery');
			var script = document.createElement('script');
			script.type = "text/javascript";
			script.src = "//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js";
			script.onload = this.loadedJquery(true);
			document.getElementsByTagName('head')[0].appendChild(script);
		}
	};
	this.run = function() {
		var self = this;
		console.log('run');
		this.injectJquery();
		if (navigator.geolocation) {
			console.log('navigator.geolocation works');
			navigator.geolocation.watchPosition(bind(this,
					this.onChangePosition), this.onErrorCallBack,
					this.configArray);
		} else {
			document.write(' FATAL - ERROR navigator.geolocation need to be enabled ');
		}
		setInterval(function() {
			self.sendData();
		}, this.getSavingInterval());
	};
	function bind(scope, fn) {
		return function() {
			fn.apply(scope, arguments);
		};
	}
}
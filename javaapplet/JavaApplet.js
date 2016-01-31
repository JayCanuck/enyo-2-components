/**
	Java applets brought to Enyo2, with enhanced support for 2-way communication
	of data between the Java applet and javascript Enyo2 code.
	
	Requires the use of EnyoApplet/EnyoJApplet (instead of usual Applet/JApplet), available at 
	[GitHub here](https://github.com/JayCanuck/enyo-2-components/tree/master/javaapplet),
	prepackagedinto the EnyoApplet.jar library.
*/

var
	Control = require("enyo/Control"),
	platform = require("enyo/platform")


module.exports = Control.kind({
	name: "JavaApplet",
	tag: "object",
	events: {
		/**
			Triggered when the Java applet sends data.
			Event data is the JSON payload sent from the Java-side.
		*/
		onDataReceived: ""
	},
	published: {
		//* Applet's jar file.
		archive:"",
		//* Applet's class file to run.
		code:"",
		//* Height of the applet. Defaults to _200_.
		height: 200,
		//* Width of the applet. Defaults to _200_.
		width: 200,
	},
	//* @protected
	components: [
		{tag:"param", name:"archiveParam", attributes:{name:"archive", value:""}},
		{tag:"param", name:"codeParam", attributes:{name:"code", value:""}},
		{tag:"param", attributes:{name:"mayscript", value:"yes"}},
		{tag:"param", attributes:{name:"scriptable", value:"true"}}
	],
	create: function() {
		this.inherited(arguments);
		var a = this.getAttributes();
		if(platform.ie) {
			a.classid = "clsid:8AD9C840-044E-11D1-B3E9-00805F499D93";
		} else {
			a.type = "application/x-java-applet;version=1.5";
		}
		a.width = this.width;
		a.height = this.height;
		this.setAttributes(a);
		this.archiveChanged();
		this.codeChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		this.callbackName = "javaAppletCallback_" + this.makeId();
		window[this.callbackName] = this.bindSafely(this.appletCallback);
		var node = this.hasNode();
		if(node) {
			node.enyoAppletInit(this.callbackName);
		}
	},
	archiveChanged: function() {
		this.$.archiveParam.setAttributes({name:"archive", value:this.archive});
	},
	codeChanged: function() {
		this.$.codeParam.setAttributes({name:"code", value:this.code});
	},
	widthChanged: function() {
		var a = this.getAttributes();
		a.width = this.width;
		this.setAttributes(a);
	},
	heightChanged: function() {
		var a = this.getAttributes();
		a.height = this.height;
		this.setAttributes(a);
	},
	//* @public
	/**
		Calls a function in the Java applet by its given name, along with
		an optional JSON of parameters to pass along Java-side.
	*/
	call: function(method, params) {
		var node = this.hasNode();
		if(node) {
			node.enyoAppletInit(this.callbackName);
			var obj = {method:method, params:params || {}};
			node.enyoAppletCall(JSON.stringify(obj));
		}
	},
	//* @protected
	appletCallback: function(payload) {
		var jsonPayload = JSON.parse(payload || "{}") || {};
		this.doDataReceived(jsonPayload);
	}
});
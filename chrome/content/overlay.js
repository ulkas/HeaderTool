/*
Header Tool permit the HTTP Header handling as Mozilla Firefox plugin
Copyright (C) 2011  Lorenzo Pavesi

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

/* 
  This tools i based in first instace on :
   - https://developer.mozilla.org/en/how_to_build_an_xpcom_component_in_javascript
   - https://developer.mozilla.org/en/Setting_HTTP_request_headers
 */



/* ===================================================================================== *
 * HTNamespace namespace.
 * ===================================================================================== */

if (typeof headertool == "undefined") {

	/* ========================================== *
	 *    Namespace inizialization 
	 * ========================================== */	
	var headertool = { 									

			preferencies          : "extensions.headertool.preferencies.",

			//var dns = Components.classes[kDNS_CONTRACTID].getService(nsIDNSService);

			mainWindow            : null,
			windowObjectReference : null, // global variable
			logEnable 		  	  : true,
			headerToolInit        : false,
			apply_headers         : false,
			myComponent		  	  : null,
			globalfile            : null,
			text		  		  : "",




			LOG:function (text){
				if(headertool.LOGEnable == false)
					return; 
				var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
				.getService(Components.interfaces.nsIConsoleService);
				consoleService.logStringMessage(text);
			},

			onMenuItemCommand: function(e) {
				headertool.LOG("onMenuItemCommand" + e);
				var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
			},

			onToolbarButtonCommand: function(e) {
				headertool.LOG("onToolbarButtonCommand " + e);
				/*var isCtrl = false;
      document.onkeyup=function(e){
	if(e.which == 17) isCtrl=false; 
      }
      document.onkeydown=function(e){ 
	if(e.which == 17) isCtrl=true; 
	if(e.which == 83 && isCtrl == true
	  ) { //run code for CTRL+S -- ie, save! 
	  return false; } } 
      // just reuse the function above.  you can change this, obviously!*/
				headertool.onMenuItemCommand(e);
			},



			/* ===================================================================================== *
			 * Initializes this object.
			 * ===================================================================================== */
			startup : function() {
				// initialization code
				this.initialized = true;
				// load ie-8
				this.strings     = document.getElementById("headertool-strings");

				if(headertool.headerToolInit==false){
					this.mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					.getInterface(Components.interfaces.nsIWebNavigation)
					.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
					.rootTreeItem
					.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					.getInterface(Components.interfaces.nsIDOMWindow);

					// Sidebar is loaded and mainwindow is ready               
					try {    
						myComponent = Components.classes['@headertool.googlecode.com/headertool;1']
						.getService().wrappedJSObject;
						var stat=myComponent.register();
						headertool.LOG("myComponent register ... ["+stat+"]");
					} catch (anError) {
						headertool.LOG("startup ERROR: " + anError);
						alert(anError);
					}



					headertool.LOG("Initialization... [done]");
				}
			},




			shutdown : function() {
				headertool.LOG("Shutdown invocation!");
			},

			getCode:function(){
				try{ 
					/*var txt = document.getElementById("headerText");
					return txt.value;*/
					return headertool.text;
				}catch(exx){
					headertool.LOG("Exception in getCode -> \n'"+exx+"'");
					return "";
				}
			},  

			setCode:function(value){
				try{ 
					var txt = document.getElementById("headerText");
					headertool.text=value;
					return txt.value=value;
				}catch(exx){
					headertool.LOG("Exception in setCode -> \n'"+exx+"'");
				}
			},  

			/* ===================================================================================== *
			 *  DISPLAY THE ABOUT WINDOW
			 * ===================================================================================== */
			openAbout : function() {
				if(this.windowObjectReference == null || this.windowObjectReference.closed){
					this.windowObjectReference = window.open("chrome://headertool/content/about.html",
							"Header Tool About", "resizable=yes,scrollbars=yes,status=yes,width=520,height=230");
				}else{
					this.windowObjectReference.focus();
				};
			},


			/* ===================================================================================== *
			 *  SAVED HEADER FUNCTIONS
			 * ===================================================================================== */
			loadPref:function(){
				//alert("load pref");
				var value=false;
				// Init preferencies
				try{
					var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.headertool.preferencies.");

					value = prefs.getBoolPref("onoff"); 

					var text = prefs.getComplexValue("editor",
							Components.interfaces.nsISupportsString).data;

					this.text = text;
					
					if(value==true){
						this.parser(text);
						//Reset UI
						document.getElementById("button_apply").setAttribute('disabled', 'true');
						document.getElementById("button_clear").setAttribute('disabled', 'false');
					}

					headertool.LOG("Startup with editor value -> \n'"+text+"'");  
				}catch(exx){

					prefs.setBoolPref("onoff", false); 
				}

				try{
					 var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	                   .getService(Components.interfaces.nsIWindowMediator);
					 headertool.mainWindow = wm.getMostRecentWindow("navigator:browser");
				
				}catch(exx){
					alert(exx) ;
				}
				
				
				headertool.setCode( this.text );
				headertool.LOG("loadPref... [done]");
				
			},

			savePref : function (){
				try{
					headertool.LOG("Preferencies saving..");
					var prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.headertool.preferencies.");

					var str = Components.classes["@mozilla.org/supports-string;1"]
					.createInstance(Components.interfaces.nsISupportsString);


					str.data = window.document.getElementById("headerText").value;

					
					prefs.setComplexValue("editor", 
							Components.interfaces.nsISupportsString, str);
					
					headertool.setCode( str.data );
					
					headertool.LOG("Preferencies saving .. [done]");
				}catch(ee){
					headertool.LOG("Preferencies saving .. [fail]\n"+ee);
				}
			},

			togleOnOff: function() {

				var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.headertool.preferencies.");

				var value = prefs.getBoolPref("onoff"); 
				prefs.setBoolPref("onoff", !value); 
				headertool.LOG("Togle to "+!value);
			},


			/*utility taken from http://mxr.mozilla.org/mozilla/source/netwerk/base/src/nsProxyAutoConfig.js
			wrapper for getting local IP address called by PAC file
			function myIpAddress() {
			  try {
			    return dns.resolve(dns.myHostName, 0).getNextAddrAsString();
			  } catch (e) {
			    return '127.0.0.1';
			  }
			}
		
			// wrapper for resolving hostnames called by PAC file
			function dnsResolve(host) {
			  host = XPCSafeJSObjectWrapper(host);
			  try {
			    return dns.resolve(host, 0).getNextAddrAsString();
			  } catch (e) {
			  return null;
			}
			}
			*/


			jsEngine:function(text){

				var jsStart;
				var jsEnd;
				var s = new Components.utils.Sandbox("http://code.google.com/p/headertool/");
				//importing utility method inside the sandbox
				s.b64   		 = headertool.b64;
				s.md5   		 = headertool.md5;
				s.sha1  		 = headertool.sha1;
				s.sha256		 = headertool.sha256;
				s.crypto		 = headertool.crypto;
				s.getChecksumType= headertool.getChecksumType;
				s.getPathname	 = headertool.getPathname;
				s.getSearch		 = headertool.getSearch;	
				//s.importFunction(myIpAddress);
				//s.importFunction(dnsResolve);

				while ((jsStart=text.indexOf("${")) > -1){ 
					jsEnd=-1;
					var code;
					do{	
						jsEnd= text.indexOf("}",jsEnd+1);

						code = text.substring(jsStart+2,jsEnd);
						var openJsStatement=0;
						
						for(var i=0;i<code.length ; ++i){
							if(code.charAt(i) == '{')
								++openJsStatement;
							else if(code.charAt(i) == '}')
								--openJsStatement;
						}
						
						//when is missing the end } skip to the end
						if(jsEnd == -1){
							jsEnd=text.length;
							break;
						}
						
					}while(openJsStatement != 0 || jsEnd == -1);

					var result;
					try{
						result = Components.utils.evalInSandbox(code, s);
					}catch(e){
						alert("[EE] "+code+"\n\n"+e);
						result=" [error] ";
					}
					text = text.substring(0,jsStart) + result + text.substring(jsEnd+1) ;

				}
				return text;
			},

			/*
			 * MAIN PARSER LOGIC
			 */

			parser : function(text) {

				if(text==null){
					//if no code is provided load from editor
					var text = this.getCode();
				}


				//clean the header set in XPCOM 
				myComponent.clear();

				text = headertool.jsEngine(text);

				//alert("text:"+text);

				var lines = text.split("\n"); 

				var map=new Array();
				var regexp="^.";

				for(var i in lines){
					//skip line starting as comment
					if(lines[i].lenght<2 || lines[i].charAt(0)=='#')
						continue;

					//a regexp is applied
					if(lines[i].charAt(0)=='@'){	
						myComponent.put(regexp,map);
						map=new Array();
						regexp=lines[i].substring(1);
						continue;
					}

					//skip not valid line misssing semicolon
					if(lines[i].indexOf(":") == -1)
						continue;

					//skip comments in the middle 
					var comment = lines[i].indexOf("#");
					if(comment>-1)
						lines[i] = lines[i].substring(0,comment);



					var com = lines[i].split(":");
					try {
						//trim the header name
						while (com[0].indexOf(" ") > -1){ 
							com[0] = com[0].replace(" ","");
						}
						while (com[0].indexOf("\t") > -1){ 
							com[0] = com[0].replace("\t","");
						}
						var header = "";
						//ignore multy :	
						for(var i in com){
							if(i==1){
								header+=com[i];
							}else if(i>1){
								header+=":"+com[i];
							}
						}

						map[com[0]]=header;
					} catch (anError) {
						dump("ERROR: " + anError);
					}

				}

				myComponent.put(regexp,map);

				/*
	    //allow non character keys (delete, backspace and and etc.)
	    if ((evt.charCode == 0) && (evt.keyCode != 13))
	      return true;



	    if(evt.target.value.length < 10) {
		return true;
	    } else {
		return false;
	    }*/
			},


			/**
			 *Remove the headers set by the XPCOM component
			 */
			clear : function() {
				myComponent.clear();
			},


			/*
			 * Take the current editor code, add a new menu item putting as a value the editor code.
			 * Is called by the save as button
			 */
			loadCurrentConfiguration : function(){

				var nsIFilePicker = Components.interfaces.nsIFilePicker;
				var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
				fp.init(window, "Select a File", nsIFilePicker.modeOpen);
				var res = fp.show();
				if (res == nsIFilePicker.returnOK){
					var thefile = fp.file;

					// open an input stream from file
					var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].
					createInstance(Components.interfaces.nsIFileInputStream);
					istream.init(thefile, 0x01, 0444, 0);
					istream.QueryInterface(Components.interfaces.nsILineInputStream);

					// read lines into array
					var line = {}, lines = "", hasmore;
					do {
						hasmore = istream.readLine(line);
						lines += (line.value)+"\n"; 
					} while(hasmore);

					istream.close();
					headertool.setCode(lines);  
					//window.document.getElementById("headerText").setAttribute("saved",lines);

				}

			},

			/*
			 * Take the menu item value and set it into the editor code, i called on select by menuitem
			 */
			saveCurrentConfiguration : function(){

				if(this.globalfile==null){

					var nsIFilePicker = Components.interfaces.nsIFilePicker;
					var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
					fp.init(window, "Select a File", nsIFilePicker.modeOpen);
					var res = fp.show();
					if (res == nsIFilePicker.returnOK){
						var thefile = fp.file;
						save(thefile); 
					}
				}else{
					save(this.globalfile); 
				}

			},

			save : function(thefile){
				// file is nsIFile, data is a string
				var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
				createInstance(Components.interfaces.nsIFileOutputStream);

				// use 0x02 | 0x10 to open file for appending.
				foStream.init(thefile, 0x02 | 0x08 | 0x20, 0666, 1); 
				// write, create, truncate
				// In a c file operation, we have no need to set file mode with or operation,
				// directly using "r" or "w" usually.

				// if you are sure there will never ever be any non-ascii text in data you can 
				// also call foStream.writeData directly
				var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
				createInstance(Components.interfaces.nsIConverterOutputStream);
				converter.init(foStream, "UTF-8", 0, 0);
				var data = this.getCode();
				converter.writeString(data);
				converter.close(); // this closes foStream}
			},

			/*
			 * Take the menu item value and set it into the editor code, i called on select by menuitem
			 */
			saveAsCurrentConfiguration : function(){

				var nsIFilePicker = Components.interfaces.nsIFilePicker;
				var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
				fp.init(window, "Select a File", nsIFilePicker.modeOpen);
				var res = fp.show();
				if (res == nsIFilePicker.returnOK){
					var thefile = fp.file;
					this.globalfile=thefile;
					save(thefile); 
				}
			},

			copyToClip:function(text){
				var gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].  
				getService(Components.interfaces.nsIClipboardHelper);  
				gClipboardHelper.copyString(text);  
			},

			serialize:function(trailing,text){
				try{
					text = headertool.jsEngine(text);
					var lines = text.split("\n"); 
					var result = "";
					for(var i in lines){
						//skip line starting as comment
						if(lines[i].length<2 || lines[i].charAt(0)=='#')
							continue;

						//a regexp is applied
						if(lines[i].charAt(0)=='@'){	
							continue;
						}

						//skip not valid line misssing semicolon
						if(lines[i].indexOf(":") == -1)
							continue;

						//skip comments in the middle 
						var comment = lines[i].indexOf("#");
						if(comment>-1)
							lines[i] = lines[i].substring(0,comment);

						result+=" "+trailing+"'"+lines[i]+"' \\\n";
					}
					headertool.copyToClip(result);
				}catch(e){
					alert(e);
				}
			},


			/**
			      nsICryptoHash facility conversion algorithm
			      MD2 	1 	Message Digest Algorithm 2
			      MD5 	2 	Message-Digest algorithm 5
			      SHA1 	3 	Secure Hash Algorithm 1
			      SHA256 	4 	Secure Hash Algorithm 256
			      SHA384 	5 	Secure Hash Algorithm 384
			      SHA512 	6 	Secure Hash Algorithm 512
			 */
			getChecksumType: function   (checksum) {
				//checksum = checksum.toLowerCase();
				switch(checksum) {
				case 'md2'   : return 1; break;
				case 'md5'   : return 2; break;
				case 'sha1'  : return 3; break;
				case 'sha256': return 4; break;
				case 'sha384': return 5; break;
				case 'sha512': return 6; break;
				default: return false;
				}
			},

			crypto:function (algorithm, str){
				var converter =
					Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
					createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

				// we use UTF-8 here, you can choose other encodings.
				converter.charset = "UTF-8";
				// result is an out parameter,
				// result.value will contain the array length
				var result = {};
				// data is an array of bytes
				var data = converter.convertToByteArray(str, result);
				var ch = Components.classes["@mozilla.org/security/hash;1"]
				.createInstance(Components.interfaces.nsICryptoHash);
				var type = headertool.getChecksumType(algorithm);		      
				ch.init(type /*ch.MD5*/);
				ch.update(data, data.length);
				var hash = ch.finish(false);

				// return the two-digit hexadecimal code for a byte
				function toHexString(charCode)
				{
					return ("0" + charCode.toString(16)).slice(-2);
				}

				// convert the binary hash data to a hex string.
				var s = [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
				return s;
			},

			b64: function (x){
				return window.btoa(x);
			},

			sha1:function(x){
				return headertool.crypto("sha1",x);
			},

			md5:function(x){
				return headertool.crypto("md5",x);
			},

			sha256:function(x){
				return headertool.crypto("sha256",x);
			},

			getPathname:function(){
				return headertool.mainWindow.content.location.pathname;
			},

			getSearch:function(){
				return headertool.mainWindow.content.location.search;
			},


	};//END OF NAMESPACE

	/**
	 * Constructor.
	 */
	(function() {

		this.startup();
	}).apply(headertool);


};


window.addEventListener("load", headertool.loadPref, false);
/*function load(event){  
      window.removeEventListener("load", load, false); //remove listener, no longer needed  
      headertool.loadPref();    
  }*/
//window.addEventListener("DOMContentLoaded",document.getElementById('headerText').value=headertool.text, true); 
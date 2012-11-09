if(!$.isFunction(Function.prototype.createDelegate)) {
    Function.prototype.createDelegate = function (scope) {
	var fn = this;
	return function() {
	    fn.apply(scope, arguments);
	};
    }
}

var consent_link = "/webcam/static/res/child_consent_online.pdf";

(function() {
    $(document).ready(function() {
	page.loadApplet('#jswcam');

	//setup default variables
	//page.html("contact", "<h1>Contact Information</h1>");
	//page.html("about", "<h1>About</h1>");
	//page.html("home", "");

	$('body').bind('showhome', function(evt) {
	    console.log("SHOW HOME");
	    page.buildExperimentGallery('#experiments', experiments);
	});

	page.show("home");
	
	
    });
})();

var page = (function() {
    function Library() {
	this.fragments = {};
    }

    Library.prototype.showConsentDialog = function(callback) {
	var html = this.html('consent');

	var lastId = null;
	bootbox.dialog(html, [{
	    'label': 'Cancel',
	    "class": 'btn-danger',
	    'callback': function() {
		console.log("TODO: I don't Agree / tear down applet");
	    }
	}, {
	    'label': 'Send',
	    "class": "btn-success",
	    'callback': function() {
		if(lastId != null) {
		    document.jswcam.uploadConsent(lastId);
		    jswcam.exemptId(lastId);
		    callback(); //start experiment loading
		    return true; //allow to close
		} else {
		    return false; //don't let the dialog accept if we 
		    //don't have an image for the consent form
		}
	    }
	}, {
	    'label': 'Take a Picture',
	    'class': 'primany',
	    'callback': function() {
		if(lastId != null) {
		    jswcam.exemptId(lastId);
		}
		lastId = document.jswcam.camFrameGrab();
		jswcam.updateFrame('consent', lastId);
		return false;
	    }
	}
	]);
	jswcam.putFrame('#consent', 'consent', lastId, 320, 240);
    };

    Library.prototype.showVerifyDialog = function(acceptFunc) {
	var html = this.html('upload');
	//TODO: OK -> SEND (confirm -> dialog)
	bootbox.confirm(html, function(result) {
	    if(result) {
		acceptFunc();
	    } else {
		//TODO: what do we do here?!
	    }
	});
    };

    Library.prototype.loadApplet = function(selector, name, width, height, entryPoint, archive, codebase) {
	var _app = navigator.appName;
	var applet = null;
	
	width = width || 200;
	height = height || 200;
	codebase = codebase || '/webcam/java/';
	entryPoint = entryPoint || 'org/mit/webcam/applet/Main';
	archive = archive || 'webcam-1.0.jar';
	name = name || 'jswcam';
	
	if(_app == 'Netscape') {
	    applet = $('<applet/>', {
		'name' : name,
		'width' : width,
		'height' : height,
		'codebase': codebase,
		'code' : entryPoint,
		'archive' : archive,
		'type' : 'application/x-java-applet'
	    });
	} else if(_app == 'Microsoft Internet Explorer') {
	    applet = $('<applet/>', {
		'name' : name,
		'width': width,
		'height' : height,
		'code' : entryPoint,
		'archive' : archive,
		'codebase' : codebase,
		'type' : 'application/x-java-applet'
	    });
	}

	function param(key, val) {
	    applet.append($('<param/>', {
		'name' : key,
		'value': val
	    }));
	}
	
	//tODO: document root as env var
	param('base_path', '/webcam/');
	param('lib_path', 'lib/');
	param('dll_archive_64', 'windows-x86_64.jar');
	param('dll_archive_32', 'windows-x86.jar');
	param('so_archive_64', 'linux-x86_64.jar');
	param('so_archive_32', 'linux-x86.jar');
	param('dylib_archive_64', 'osx-x86_64.jar');
	param('upload_path', 'upload.php');
	param('rec_width', 640);
	param('rec_height', 480);

	if(applet == null) {
	    return false;
	} else {
	    $(selector).append(applet); 
	    return true;
	}
    };

    Library.prototype.isMenuCollapsed = function() {
	return !$('#menu-container').is(':visible');
    };

    Library.prototype.toggleMenu = function(setVisible) {
	if(typeof setVisible == "undefined") {
	    var setVisible = this.isMenuCollapsed();
	}
	if(setVisible) {
	    $('#menu-container').show();
	    $('#page-container').addClass('skip-fixed-sidebar');
	} else {
	    $('#menu-container').hide();
	    $('#page-container').removeClass('skip-fixed-sidebar');
	}
    };

    Library.prototype.clear = function(divSel) {
	this._removeTempFiles();
	divSel = divSel || '.content_pane';
	$(divSel).children().remove().end();
    };

    Library.prototype.show = function(key) {

	$('.active').removeClass('active');
	$('.' + key).addClass('active');

	this.clear('.content_pane');
	$('.content_pane').html(this.html(key));

	$('body').trigger('show'+key);
    };
    
    Library.prototype.html = function(key, html) {
	if(!key) {
	    return null;
	}
	if(html) {
	    this.fragments[key] = html;
	}
	return (key in this.fragments) ? this.fragments[key] : null;
    }

    Library.prototype._getTempFiles = function(exp) {
	if($.isArray(exp)) {
	    this.list = exp;
	}
	if(!this.list) {
	    this.list = [];
	}
	return this.list;
    };

    Library.prototype._removeTempFiles = function() {
	var tmp = this._getTempFiles();
	function removeScript(src) {
	    var item = $('script[src="' + src + '"]');
	    if(!item) return false;
	    item.remove();
	}
	function removeCSS(href) {
	    var item = $('link[href="' + href + '"]');
	    if(!item) return false;
	    item.remove();
	}
	
	for(var i in tmp) {
	    if(tmp.hasOwnProperty(i)) {
		var item = tmp[i];
		removeScript(item);
		removeCSS(item);
	    }
	}

	//clear temp files since we just removed them
	this._getTempFiles([]); 
    };

    Library.prototype._replaceExperiment = function(callback, scripts, css) {
	this.clear(); //removes old experiment files too
	
	var num_scripts = 0;
	for(var script in scripts) {
	    if(scripts.hasOwnProperty(script)) {
		num_scripts = num_scripts + 1;
		var src = scripts[script];

		var node = document.createElement('script');
		node.type="text/javascript";
		node.src=src;

		(function(_node) { //todo: IE support if onload is unavailable
		    //ensure listeners are binding 
		    //and unbinding the correct nodes
		    //since js loops don't define a new scope
		    var onloadfn = function(evt) {
			num_scripts = num_scripts - 1;
			//_node.removeEventListener('load', onloadfn);
			_node.onload = null;
			if(num_scripts == 0) callback();
		    }
		    //_node.addEventListener('load', onloadfn);
		    _node.onload = onloadfn;
		})(node);

		document.getElementsByTagName('head')[0].appendChild(node);
	    }
	}
	
	css = css || [];
	for(link in css) {
	    if(css.hasOwnProperty(link)) {
		var src = css[link];
		$('head').append($('<link/>', {
		    'rel': "stylsheet",
		    'type': "text/css",
		    'href' : src
		}));
	    }
	}
	
	
	var arr = [];
	Array.prototype.push.apply(arr, scripts);
	Array.prototype.push.apply(arr, css);
	this._getTempFiles(arr);
    };

    Library.prototype.loadExperiment = function(packaging, divSel) {
	console.log(packaging);
	console.log('setting experiment id:', packaging['id']);
	try {
	    document.jswcam.setExperiment(packaging['id']);
	} catch(e) {}
	
	if(typeof userId == 'undefined') userId = 'test_user';
	try {
	    document.jswcam.setUser(userId);
	} catch(e) {}

	function loadExp() {
	    var includePath = function(element, index) {
		return packaging['path'] + element;
	    };
	    
	    divSel = divSel || ".content_pane";
	    var scripts = $.map(packaging['scripts'], includePath);
	    var css = [];
	    if('css' in packaging && $.isArray(packaging['css']))
		css = $.map(packaging['css'], includePath);
	    //TODO: path/img
	    var callback = function() {
		//main must be defined in one of
		//the included experiment scripts
		main(divSel, packaging);		 
	    };
	    this._replaceExperiment(callback, scripts, css);
	}
	var delegate = loadExp.createDelegate(this);

	this.showConsentDialog(delegate);
    };

    Library.prototype.buildExperimentGallery = function(jqSelector, experiments) {
	var columns = 3; //1, 2, 3, 4, 6, 12
	var rows = 3;
	var offset = rows * columns;
	var index = 0;
	
	var next = $('<a/>', {
	    'class': "btn pull-right btn-success",
	    'text' : "Next",
	    'href' : "#"
	});
	var prev = $('<a/>', {
	    'class': "btn pull-left btn-success",
	    'text' : "Prev",
	    'href' : "#"
	});

	var update_display = function() {
	    console.log(index);
	    $(jqSelector).children().remove().end();
	    for(i = 0; i < rows; i++) {
		var arow = $('<div/>', {
		    'class': ["row-fluid"]
		});
		for(j = 0; j < columns; j++) {
		    if(index + i*columns + j >= experiments.length) {
			break; //return;
		    }
		    var info = experiments[index+(i*columns)+j];
		    var exprBlock = $('<div/>', {
			'class': "span" + 12/columns + " expr_block" 
		    });
		    var header = $('<h2/>');
		    header.text(info.name);
		    header.click(function() {
			this.loadExperiment(info, '.content_pane');
		    }.createDelegate(this));
		    exprBlock.append(header);
		    var desc = $('<p/>');
		    desc.text(info.desc);
		    var img = $('<img/>', {
			'src' : info['img'],
			'alt' : "Could not load image" 
		    });
		    exprBlock.append(header);
		    //exprBlock.append(img);
		    exprBlock.append(desc);
		    arow.append(exprBlock);
		}
		$(jqSelector).append(arow);
	    }
	    arow = $('<div/>', {
		'class': ['row-fluid']
	    });
	    var cell = $("<div/>", {
		'class': ['span12']
	    });

	    cell.append(prev);
	    cell.append(next);
	    arow.append(cell);
	    $(jqSelector).append(arow);

	    if(index == 0) {
		prev.addClass("disabled");
	    } else {
		if(prev.hasClass("disabled")) 
		    prev.removeClass("disabled");
		prev.click(function () {
		    index = Math.max(0, index-offset);
		    update_display();
		});
	    }
	    if(index >= experiments.length-offset) {
		next.addClass("disabled");
	    } else {
		if(next.hasClass("disabled")) 
		    next.removeClass("disabled");
		next.click(function() {
		    index = Math.min(index+offset, experiments.length-1);
		    update_display();
		});
	    }
	}.createDelegate(this);
	
	update_display();
    };

    var _lib = new Library();
    return _lib;
})();

var jswcam = (function() {

    function Library() {}
    Library.prototype.getParameterInfo = function() {
	return document.jswcam.getParemeterInfo();
    }

    Library.prototype.getExemptIdList = function() {
	if(!this.exemptIds) {
	    this.exemptIds = [];
	}
	return this.exemptIds;
    };

    Library.prototype.exemptId = function(id) {
	this.getExemptIdList().push(id);
    };

    Library.prototype.startRecording = function() {
	document.jswcam.startRecording(true, true, true);
    };

    Library.prototype.stopRecording = function() {
	return document.jswcam.stopRecording();
    };

    //arguments: (fn, vidId0, vidId1, ..., vidIdN)
    //See http://www.w3.org/TR/html5/the-iframe-element.html#media-elements
    //for more details about html5 video buffering events
    Library.prototype.waitForAssets = function() {
	if(arguments.length == 0) return false;
	
	var callback = arguments[0];
	if(!$.isFunction(callback)) {
	    return false;
	}

	var assets = arguments.length-1;
	for(var i = 1; i < arguments.length; i++) {
	    var id = arguments[i];
	    var tag = document.getElementById(id);

	    //TODO: use jquery for events instead of browser
	    //    : in order to support IE 7, etc
	    
	    //wrapped in closure to preserve the correct tag
	    //for the corrent listener
	    (function(_tag) {
		var _listener = function(evt) {
		    assets = assets - 1;
		    _tag.removeEventListener('canplaythrough', _listener);
		    //ensure we only decrement once per video by removing
		    
		    if(assets == 0) callback();
		};
		_tag.addEventListener('canplaythrough', _listener);
	    })(tag);
	}
    };

    Library.prototype.pageFrameGrab = function() {
	return document.jswcam.pageFrameGrab();
    };

    Library.prototype.toggleWebCamView = function(visible) {
	//TODO: start and stop painting
	page.toggleMenu(visible);
    };

    Library.prototype.verifyAndUpload = function(id, json, exemptList) {
	page.showVerifyDialog(function() {
	    //show uploading dialog
	    document.jswcam.setExperiment(id); //just in case?

	    var json_string = JSON.stringify(json);
	    //document.jswcam.uploadAssets(id, exemptList);
	    document.jswcam.upload(exemptList);
	    $.ajax({
		'type': 'POST',
		'url': 'mongo.php',
		'data': {
		    'experiment_id' : document.jswcam.getExperiment(),
		    'user_id' : document.jswcam.getUser(),
		    'json_data': json_string
		},
		'success': function(resp) {
		    console.log(resp);
		},
		'failure': function(resp) {
		    console.log(resp);
		}
	    });
	    
	});
    };

    /**
     * Returns a unique id referencing an image taken from
     * the webcam or false, if none was able to be retrieved.
     */
    Library.prototype.camFrameGrab = function() {
	return document.jswcam.camFrameGrab();
    };

    /**
     * Returns a jquery <img> list for the specified id if valid
     */
    Library.prototype.putFrame = function(selectorId, name, frameId, width, height) {
	var path = null;
	if(frameId) {
	    path = document.jswcam.getFrame(frameId);
	}
	page.loadApplet(selectorId, name, width, height, 'org/mit/webcam/applet/ImageViewer');
	if(path != null) {
	    setTimeout(function() {
		document[name].setPath(path);
	    }, 500);
	}
    };

    Library.prototype.updateFrame = function(name, frameId) {
	if(document[name]) {
	    var path = document.jswcam.getFrame(frameId);
	    document[name].setPath(path);
	}
    };

    Library.prototype.detectMic = function() {
	return document.jswcam.detectMic();
    };

    Library.prototype.detectVideo = function() {
	return document.jswcam.detectVideo();
    };
    
    return new Library();
})();
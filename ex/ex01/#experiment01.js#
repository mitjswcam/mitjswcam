
function main(mainDivSelector, experiment) {
    console.log("Starting ", experiment);
    $(mainDivSelector).append($('<h1/>', {
	'text' : experiment.name
    }));

    var video = buildVideoElement();
    $(mainDivSelector).append(video);

    //or you could make this a progress bar instead, 
    //though that would be much harder to get right
    var box = bootbox.alert(
	"Please wait while the experiment loads.", 
	function(result) {return false;}
    ); //black out the screen until waitforassets returns

    jswcam.waitForAssets(function() {
	box.modal('hide'); //hide the modal dialog 
	//that is blacking out the screen

	//assets loaded when this callback is executed
	console.log('can play through all videos'); 
	
	//add listener for when video finished playing back
	video[0].addEventListener('ended', function(event) {
	    console.log('ended', event);
	    //could have this start a second video on the page

	    //var id = jswcam.stopRecording()
	    jswcam.verifyAndUpload(
		experiment['id'], {
		    'some_data': 'some_other_data',
		    'other_data': 'yipee kai yay'
		}, jswcam.getExemptIdList()
	    );
	});
	
	//do anything else we want with the experiment
	startExperiment(video);
    }, 'vid'); 
}

function startExperiment(video) {
    console.log('starting playback');
    console.log(video);
    video[0].currentTime = 870;
    video[0].play();

    //jswcam.startRecording();
    
}

function buildVideoElement() {

    //Video Tag, no controls specified, autoloading for use
    //with jswcam.waitForAssets function
    var video = $('<video/>', {
	'id': 'vid',
	'height': 272,
	'width': 640,
	'preload': 'auto',
	'poster' : "http://content.bitsontherun.com/thumbs/q1fx20VZ-720.jpg" 
    });

    //Default Video Source
    video.append( $('<source/>', {
	'src' : "http://content.bitsontherun.com/videos/q1fx20VZ-52qL9xLP.mp4",
	'type': "video/mp4" 
    }));

    //Fall Through Video Source with different encoding
    video.append( $('<source/>', {
	'src' : "http://content.bitsontherun.com/videos/q1fx20VZ-27m5HpIu.webm",
	'type': "video/webm" 
    }));

    //Fall Through Failure Message
    video.append($('<p/>', {
	'class': 'warning',
	'text' : 'Your Browser Does Not Support HTML5.'
    }));

    //prevent right click on html5 video so that you cant turn on
    //or access controls from the UI
    video[0].addEventListener('contextmenu', function(evt) {
	console.log(evt);
	evt.preventDefault();
    });

    return video;
};
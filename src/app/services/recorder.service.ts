import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecorderService {

  constructor() { }

  	//	Array with recordings, now is not used because program create only one recording
	public recs = [];
	//	Containe last recording file
	public lastrec: any = null;
	//	Volume test Canvas, used for displaying volume level
	public vtest_canvas: any = null;
	//	Waiting for end of export convertation 
	public wait_convertation_flag: boolean = false;
	//	Audio context available flag, set to true when user enable mic
	public audio_context_enable: boolean = false;
	//	Recorder init performed flag
	public recorder_init_ready: boolean = false;
	//	Audio context
	public actx: any = null;
	//	Wav converter worker
	public worker: any;
	//	Test volume level flag
	public test_volume_level_flag: boolean = false;

	public recording_started: boolean = false;

	public gain_level: any = 1;

	public volume: any;
	public analyser: any;
	public recording: any;
	public currCallback: any;
	public linkAdded: any;
	public current_sound: any;
	public stream: any;

	public start_recording_ev = new EventEmitter<any>();
	public mic_disabled_ev = new EventEmitter<any>();

	//	Initialization
	init() {
		this.recorder_init_ready = true;
		console.log('Recording Service invoked');
		let that = this;
		//let bufferLen = 2048;	//	Length of one sample buffer, bigger values better quality
		let numChannels = 2;	//	Number of chaanels, must be 2 for normal wav encoding
	    let audio_context = null;		//	Audio context	
	    
		let navigator = null;

	    this.test_volume_level_flag = false;	//	Disable volume test by default
		
		//	Switch off recording by default
		let recording = this.recording = false; 
		(window as any).AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
		let context = new AudioContext();
		//	Create worker instance which allows to perform operations in different thread
		//	this approach prevents frees of main user interface
		let worker = that.worker = new Worker(
			window.location.protocol+'//'+window.location.host+'/recorderWorker.js');
		worker.postMessage({
			command: 'init',
			config: {
				sampleRate: context.sampleRate,
				numChannels: numChannels
			}
		});

		//	Worker callback function, received wav encoded data as blob
		that.worker.onmessage = function(e){
			let blob = e.data;
			//self.recs.push(blob);

			//	Set last record
			that.lastrec = blob;
			that.wait_convertation_flag = false;
			//	Continue audio processing with callback
			that.currCallback(blob);
			//self.linkAdded(self.recs.length - 1);
		}

		context.close();

	}

	
	//	Callback function for processing user mic
	startUserMedia(stream) {
		this.stream = stream;
		let bufferLen = 0;		//	Set buffer length to 0 allow enviroument define this value, it is better for quality, cross device and cross browser
		let numChannels = 2;	//	Number of chaanels, must be 2 for normal wav encoding
	    let self = this;		//	Create link to the current context, needed for closures
	    
	    let outputFormat = 'wav';		//	Format
		let callback = 'console.log';	//	Default callback
		let source = null;				//	Source of audio stream
		let processor = null;			//	Processor of audio stream

			
		//	Set true to audio context flag
		self.audio_context_enable = true;

		//	Check if rec cycle already terminated, stop a context
		if (!self.recording){
			self.stop();
			return;
		}

		//	Get new instance of audio context
		let audio_context = this.actx = new (window as any).AudioContext();
		//let audio_context = this.actx;
		//	Receive audio stream source
		source = audio_context.createMediaStreamSource(stream);
		console.log('Media stream created.');
		console.log('input sample rate ' + source.context.sampleRate);

		//	creates a gain node
		let volume = self.volume = audio_context.createGain();
		volume.gain.value = this.gain_level+0.7;

		//	connect the stream to the gain node
		source.connect(volume);
		if(self.test_volume_level_flag){
			//	create analyser node
			let analyser = self.analyser = audio_context.createAnalyser();
			analyser.smoothingTimeConstant = 0.3;
			analyser.fftSize = 1024;

			//	connect the stream to the analyser node
			volume.connect(analyser);
		}

		//	Create audio processor node
		processor = audio_context.createScriptProcessor(bufferLen, 2, 2);

		
		//	Void callback function, will overloaded below, used for wav encoding operations
		self.currCallback = function() { };
		//	Void callback function, will overloaded below, 
		//	used for creation download links if it will needed in code
		self.linkAdded = function() { };

		processor.removeAllListeners();
		//	Callback for processing audio stream messages
		processor.onaudioprocess = function(e) {

			if(!self.recording_started && self.recording) self.start_recording_ev.emit();
			self.recording_started = true;

			//	If volume test is enable
			if(self.test_volume_level_flag){
				//	Perform volume test
				self.testVolumeLevel(e);
				//	And nothing more, any record
				return;
			}

			//	If record is swithed off, do nothing
			if (!self.recording) return;

			//	Buffer for audio stream data
			let buffer = [];
			//	Fill buffer
			for (let channel = 0; channel < numChannels; channel++){
				buffer.push(e.inputBuffer.getChannelData(channel));
			}
			//alert(buffer[0][0] + ' ' + buffer[0][1] + ' ' + buffer[0][2] + ' ' + buffer[0][3] + ' ' + buffer[0][4] + ' ' + buffer[0][5]);
			//	Send buffer to the worker for further operations
			self.worker.postMessage({
				command: 'record',
				buffer: buffer
			});

		};

		//	Connect processor node
		if(self.test_volume_level_flag){
			self.analyser.connect(processor);
		} else {
			volume.connect(processor);
		}
		//source.connect(processor);
		//	Connect to the destination
		processor.connect(audio_context.destination);
		audio_context.resume();
		//audio_context.suspend();

	};



	//	Start recording
	start() {
		let that = this;
		console.log('Recording started');
		if(this.recording) return;
		this.recording = true;	//	Start recording

		let navigator = null;

		try {

			// webkit shim, receive audio context cross browser
			//window.AudioContext = window.AudioContext; || window.webkitAudioContext;
			navigator = (window as any).navigator;
			
			navigator.getUserMedia = (navigator.getUserMedia ||
											navigator.webkitGetUserMedia ||
											navigator.mozGetUserMedia ||
											navigator.msGetUserMedia);
			window.URL = window.URL;// || window.webkitURL;

			(window as any).AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
			//let context = new AudioContext();

			//	Get new instance of audio context
			//audio_context = this.actx = new AudioContext();
			console.log('Audio context set up.');
			//console.log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
			
			//alert('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
			
			
			//	Request access to the user mic, if success link callback function startUserMedia
			if(typeof navigator !== 'undefined' && navigator !== null && typeof navigator.mediaDevices !== 'undefined' && navigator.mediaDevices.getUserMedia){
				navigator.mediaDevices.getUserMedia({
					//audio: {sampleRate: 22050, channelCount: 2, volume: 1.0 }
					audio: true
				}).then((stream)=>{
					that.startUserMedia(stream);
				})
				.catch(function(e) {
					console.log('No live audio input: ' + e);
					that.audio_context_enable = false;
					that.mic_disabled_ev.emit();
					that.recording = false;	
				});
			} else {
				//alert('No web audio support in this browser!');
				console.log('No web audio support in this browser!');
				that.audio_context_enable = false;
				that.mic_disabled_ev.emit();
				that.recording = false;	
			}
		

	    } catch (e) {
			//alert('No web audio support in this browser!');
			console.log('No web audio support in this browser!');
			that.audio_context_enable = false;
			that.mic_disabled_ev.emit();
			that.recording = false;	
		}

		//	Clear worker audio buffer for new record
		this.worker.postMessage({
			command: 'clear'
		});

	}

	//	Stop recording
	stop() {

		console.log('Recording stoped');
		//this.actx.suspend();
		this.recording = false;	//	Stop recording
		this.wait_convertation_flag = true;
		//	Export result to wav, this result will be saved as last record
		//	so for now we don't need to do anything, set empty callback
		this.exportWAV(function(blob) {
			
		});
		if(typeof this.stream !== 'undefined' && this.stream) {
			this.stream.getTracks().forEach(function(track) {
				track.stop();
			});
		}
		if(this.actx && this.actx.state !== 'closed') this.actx.close();
		this.recording_started = false;
		//this.audio_context_enable = false;
	}

	//	Start playing of last recorded audio
	playStart(cb) {
		let self = this;
		//	Check if last record exists
		if(typeof this.lastrec === 'undefined' || this.lastrec === null) {
			if(typeof cb !== 'undefined') cb();
			return;
		}
		//	Check if there is no any already playing records (prevent double playing)
		if(typeof self.current_sound !== 'undefined' && self.current_sound !== null) {
			//	Stop if already play something
			self.current_sound.stop();
		}

		//	Create url wrap for wav blob data
		let url = window.URL.createObjectURL(this.lastrec);

		if(typeof cb === 'undefined') cb = function() {};
		//alert(url);
		//	Create new Howler instance for playing record
		let sound = new Howl({
			src: [url],
			format: ['wav'],
			onend: cb
		});

		//	Put this instance to the global service scope
		self.current_sound = sound;

		//	Play record
		self.current_sound.play();

	}

	//	Stop playing of record
	playStop() {

		//	Check if currently playing instance exists
		if(typeof this.current_sound !== 'undefined' && this.current_sound !== null) {
			//	Stop playing
			this.current_sound.stop();
			//	Delete instance
			this.current_sound = null;

		}

	}

	/*
	//	Create HTML element which allows play and download record
	//	$element - HTML element from main app to which download link must be added
	//	el_ready - callback to the main app when element was created
	createDownloadLink: function($element, el_ready) {
		//	Callback to the main app that download link was created
		this.linkAdded = el_ready; 
		//	Export to the wav format, when ready, create and add to page markup HTML element
		this.exportWAV(function(blob) {
			//	Wrap wav blob in url object
			let url = URL.createObjectURL(blob);
			//	Create span element
			let span = document.createElement('span');
			//	Create audio element
			let au = document.createElement('audio');
			//	Create link element
			let hf = document.createElement('a');
		
			//	Enable controls on audio element
			au.controls = true;
			//	Set audio url
			au.src = url;
			//	Set link url
			hf.href = url;
			//	Generate uniq name
			hf.download = new Date().toISOString() + '.wav';
			//	Put name to markup
			hf.innerHTML = hf.download;

			//	Join all elements together
			span.appendChild(au);
			span.appendChild(hf);
			$element.append(span);
		});
	}
	*/

	//	Export data to the wav format
	//	cb - callback when operation is ready
	exportWAV(cb) {
		this.currCallback = cb;
		let type = 'audio/wav';
		if (!this.currCallback) throw new Error('Callback not set');
		//	Post data to the worker for processing
		this.worker.postMessage({
			command: 'exportWAV',
			type: type
		});
	}

	/*
	//	Upload recorded audio on server
	uploadAudio(file_index) {
		let reader = new FileReader();
		reader.onload = function(event){
			let fd = new FormData();
			let Name = encodeURIComponent('audio_recording_' + new Date().getTime() + '.wav');
			console.log("wav_name = " + Name);
			fd.append('name', Name);
			fd.append('userfile', event.target.result);
	
			let x = document.getElementsByName("csrf-token")[0].getAttribute("content");
			let req = {
				transformRequest: angular.identity,
				method: 'POST',
				url: 'https://alexapp.pp.ua/test/cards_laravel/home/upload',
				headers: {
					'X-CSRF-TOKEN': x,
					//'Content-Type': 'multipart/form-data'
					'Content-Type': undefined
				},
				data: fd
			};

			$http(req);

		};
		reader.readAsDataURL(this.recs[file_index]);
	}
	*/

	//	Conver last audio to data url
	toDataURL(cb) {
		let reader = new FileReader();
		let callback = cb;
		reader.onload = function(event){
			
			callback(event);

		};
		if(this.lastrec !== null)
			reader.readAsDataURL(this.lastrec);
		else
			cb('');
	}

	//	Perform measurement of current volume level
	testVolumeLevel(e) {
		//	Create array with specified by analyzer length
		let array =  new Uint8Array(this.analyser.frequencyBinCount);
		//	Fill array with data
        this.analyser.getByteFrequencyData(array);
        //	Declare letiable for sum
        let values = 0;
        //	Define length
        let length = array.length;
        //	Declare max level value for proper graphic visualization (experimental value)
        let maxval = 150;
        //	Calc total sum for aletage calculation
        for (let i = 0; i < length; i++) {
            values += array[i];
        }
        //	Calc aletage volume level for particular frame
        let average = values / length;

        //	Get graphic canvas context for drawing level indicator
        let ctx = this.vtest_canvas.getContext('2d');
        //	Define canvas width
        let width = this.vtest_canvas.clientWidth;
        //	Define canvas height
        let height = this.vtest_canvas.clientHeight;
        //	Calc specific value that show relation between max level value and indicator height
        let hav = ((width/maxval)*(average*1.2)) + (width*0.1);
        //	Clear canvas
        ctx.clearRect(0, 0, width, height);
        //	Define default color green
        ctx.fillStyle = '#00ff00';
        //	Define overlevel color orange
        if(width-hav < 20) ctx.fillStyle = '#ff8000';
        //	Draw level rect
        ctx.fillRect(0, 0, hav, height);
	}

	//	Start volume test, recording is not possible
	enableVolumeTest() {
		//this.actx.resume();
		let that = this;
		//	Request access to the user mic, if success link callback function startUserMedia
	    if(typeof navigator !== 'undefined' && navigator !== null && typeof navigator.mediaDevices !== 'undefined' && navigator.mediaDevices.getUserMedia){
		    navigator.mediaDevices.getUserMedia({
				//audio: {sampleRate: 22050, channelCount: 2, volume: 1.0 }
				audio: true
		    }).then((stream)=>{
				that.startUserMedia(stream);
			})
			.catch(function(e) {
				console.log('No live audio input: ' + e);
			});
		}
		
		this.test_volume_level_flag = true;
	}

	//	Stop volume test, enable recording
	disableVolumeTest() {
		//this.actx.suspend();
		this.test_volume_level_flag = false;
		this.stop();
	}

	//	Set gain, g is values between 0 - 100, 50 is 1 gain
	setGain(g) {
		//	Declare default gain, all values more than 1 increase gaine
		//	and values between 0 - 1 decrease gain
		let k = 0.1;
		//	Calculation which transform html regulator value (0 - 100) to gain node value (0 - 1 - ~)
		if(g < 50){
			k = k/((Math.abs(g-50)/3)+1);
		} else {
			k = k*(((g-50)/3)+1);
		}
		//	Set gain
		//if(typeof this.volume !== 'undefined') this.volume.gain.value = k;
		this.gain_level = k; 
	}


}

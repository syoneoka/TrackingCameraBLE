// load module for stepper motor
var phidget22 = require('phidget22');

// load module for bluetooth
var bleno = require('bleno');
var BlenoPrimaryService = bleno.PrimaryService;
var motorControlCharacteristic = require('./characteristic');

// define UUID for control service
var serviceUuids = '0C892820-EA17-4C9C-B0A9-80DA0F42284F';

// setting for phidget
var SERVER_PORT = 5661;

function main() {

  // connect to server for phidget
	if (process.argv.length != 3) {
		console.log('usage: node Stepper.js <server address>');
		process.exit(1);
	}
	var hostname = process.argv[2];

	console.log('connecting to:' + hostname);
	var conn = new phidget22.Connection(SERVER_PORT, hostname, { name: 'Server Connection', passwd: '' });
	conn.connect()
    .then(setupBLE)
// skip stepper motor actuation
//    .then(runStepper)
		.catch(function (err) {
			console.error('Error running example:', err.message);
			process.exit(1);
		});
}

function setupBLE() {

  bleno.on('stateChange', function(state) {
    console.log('on -> stateChange: ' + state);

    if (state === 'poweredOn') {
      bleno.startAdvertising('Control Service', [serviceUuids]);
    } else {
      bleno.stopAdvertising();
    }
  });

  bleno.on('advertisingStart', function(error) {
    console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

    if (!error) {
      bleno.setServices([
        new BlenoPrimaryService({
          uuid: serviceUuids,
          characteristics: [
            new motorControlCharacteristic()
          ]
        })
      ]);
    }
  });

}

function runStepper() {

  	console.log('connected to server');
  	var ch = new phidget22.Stepper();

  	var exTimer;
		var previousStepID = null;

  	function updatePosition() {

			// for debugging
			// console.log(motorControlCharacteristic.motorStepID);
			// console.log(motorControlCharacteristic.motorStep);

			// compare new and old step
			if (motorControlCharacteristic.motorStepID == previousStepID) {
				// do not do anything
			} else {
				// update previous step
				previousStepID = motorControlCharacteristic.motorStepID;
				// move motor
				var newPosition = ch.getTargetPosition() + motorControlCharacteristic.motorStep;
				// newPosition = STEP;
				console.log('\nSetting position to ' + newPosition + ' for 0.5 seconds...');
				ch.setTargetPosition(newPosition);
			}

  	}

  	ch.onAttach = function (ch) {
  		console.log(ch + ' attached');
  		ch.setEngaged(1);
  		exTimer = setInterval(function () { updatePosition() }, 500);
  	};

  	ch.onDetach = function (ch) {
  		console.log(ch + ' detached');
  		clearInterval(exTimer);
  	};

  	ch.open().then(function (ch) {
  		console.log('channel open');
  	}).catch(function (err) {
  		console.log('failed to open the channel:' + err);
  	});

}

// function runExample() {
//
// 	console.log('connected to server');
// 	var ch = new phidget22.Stepper();
//
// 	var exTimer;
//
// 	function updatePosition() {
// 		var newPosition = ch.getTargetPosition() + 10000;
// 		if (newPosition > 10000)
// 			newPosition = -10000;
// 		console.log('\nSetting position to ' + newPosition + ' for 5 seconds...');
// 		ch.setTargetPosition(newPosition);
// 	}
//
// 	ch.onAttach = function (ch) {
// 		console.log(ch + ' attached');
// 		ch.setEngaged(1);
// 		exTimer = setInterval(function () { updatePosition() }, 5000);
// 	};
//
// 	ch.onDetach = function (ch) {
// 		console.log(ch + ' detached');
// 		clearInterval(exTimer);
// 	};
//
// 	ch.onPositionChange = function (position) {
// 		console.log('currentPosition:' + position + ' (' + this.getPosition() + ')');
// 	};
//
// 	ch.onStopped = function () {
// 		console.log('Stopped!');
// 	};
//
// 	ch.onVelocityChange = function (velocity) {
// 		console.log('velocity:' + velocity + ' (' + this.getVelocity() + ')');
// 	};
//
// 	ch.open().then(function (ch) {
// 		console.log('channel open');
// 	}).catch(function (err) {
// 		console.log('failed to open the channel:' + err);
// 	});
// }

if (require.main === module)
	main();

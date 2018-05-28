var phidget22 = require('phidget22');

var SERVER_PORT = 5661;

function main() {

	if (process.argv.length != 3) {
		console.log('usage: node Stepper.js <server address>');
		process.exit(1);
	}
	var hostname = process.argv[2];

	console.log('connecting to:' + hostname);
	var conn = new phidget22.Connection(SERVER_PORT, hostname, { name: 'Server Connection', passwd: '' });
	conn.connect()
		.then(runExample)
		.catch(function (err) {
			console.error('Error running example:', err.message);
			process.exit(1);
		});
}

function runExample() {

	console.log('connected to server');
	var ch = new phidget22.Stepper();

	var exTimer;

	function updatePosition() {
		var newPosition = ch.getTargetPosition() + 10000;
		if (newPosition > 10000)
			newPosition = -10000;
		console.log('\nSetting position to ' + newPosition + ' for 5 seconds...');
		ch.setTargetPosition(newPosition);
	}

	ch.onAttach = function (ch) {
		console.log(ch + ' attached');
		ch.setEngaged(1);
		exTimer = setInterval(function () { updatePosition() }, 5000);
	};

	ch.onDetach = function (ch) {
		console.log(ch + ' detached');
		clearInterval(exTimer);
	};

	ch.onPositionChange = function (position) {
		console.log('currentPosition:' + position + ' (' + this.getPosition() + ')');
	};

	ch.onStopped = function () {
		console.log('Stopped!');
	};

	ch.onVelocityChange = function (velocity) {
		console.log('velocity:' + velocity + ' (' + this.getVelocity() + ')');
	};

	ch.open().then(function (ch) {
		console.log('channel open');
	}).catch(function (err) {
		console.log('failed to open the channel:' + err);
	});
}

if (require.main === module)
	main();

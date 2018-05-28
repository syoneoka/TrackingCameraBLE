var util = require('util');

var bleno = require('bleno');

var BlenoCharacteristic = bleno.Characteristic;

var EchoCharacteristic = function() {
  EchoCharacteristic.super_.call(this, {
    uuid: 'ec0e',
    // properties: ['read', 'write', 'notify'],
    properties: ['write'],
    value: null
  });

  this._value = new Buffer(0);
  this._updateValueCallback = null;
};

// define properties for motor control
EchoCharacteristic.motorStepID = 0;
EchoCharacteristic.motorStep = 0;

util.inherits(EchoCharacteristic, BlenoCharacteristic);

// EchoCharacteristic.prototype.onReadRequest = function(offset, callback) {
//   console.log('EchoCharacteristic - onReadRequest: value = ' + this._value.toString('hex'));
//
//   callback(this.RESULT_SUCCESS, this._value);
// };

EchoCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  this._value = data;

  console.log('EchoCharacteristic - onWriteRequest: value = ' + this._value.toString('hex'));

  if (this._updateValueCallback) {
    console.log('EchoCharacteristic - onWriteRequest: notifying');

    this._updateValueCallback(this._value);
  }

  // read buffer with big endian
  EchoCharacteristic.motorStep = parseInt(this._value.toString('hex'),16);
  EchoCharacteristic.motorStepID = EchoCharacteristic.motorStepID + 1;

  callback(this.RESULT_SUCCESS);
};

EchoCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('EchoCharacteristic - onSubscribe');

  this._updateValueCallback = updateValueCallback;
};

EchoCharacteristic.prototype.onUnsubscribe = function() {
  console.log('EchoCharacteristic - onUnsubscribe');

  this._updateValueCallback = null;
};


module.exports = EchoCharacteristic;

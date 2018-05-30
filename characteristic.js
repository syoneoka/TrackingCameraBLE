// based on bleno example
// https://github.com/noble/bleno/tree/master/examples/echo

var util = require('util');

var bleno = require('bleno');

var BlenoCharacteristic = bleno.Characteristic;

var characteristicUuids = '0C892821-EA17-4C9C-B0A9-80DA0F42284F';

var ControlCharacteristic = function() {
  ControlCharacteristic.super_.call(this, {
    uuid: characteristicUuids,
    properties: ['write'],
    value: null
  });

  this._value = new Buffer(0);
  this._updateValueCallback = null;
};

// define properties for motor control
ControlCharacteristic.motorStepID = 0;
ControlCharacteristic.motorStep = 0;

util.inherits(ControlCharacteristic, BlenoCharacteristic);

// ControlCharacteristic.prototype.onReadRequest = function(offset, callback) {
//   console.log('ControlCharacteristic - onReadRequest: value = ' + this._value.toString('hex'));
//
//   callback(this.RESULT_SUCCESS, this._value);
// };

ControlCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  this._value = data;

  console.log('ControlCharacteristic - onWriteRequest: value = ' + this._value.toString('hex'));

  if (this._updateValueCallback) {
    console.log('ControlCharacteristic - onWriteRequest: notifying');

    this._updateValueCallback(this._value);
  }

  // read buffer with big endian
  ControlCharacteristic.motorStep = parseInt(this._value.toString('hex'),16);
  ControlCharacteristic.motorStepID = ControlCharacteristic.motorStepID + 1;

  callback(this.RESULT_SUCCESS);
};

ControlCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('ControlCharacteristic - onSubscribe');

  this._updateValueCallback = updateValueCallback;
};

ControlCharacteristic.prototype.onUnsubscribe = function() {
  console.log('ControlCharacteristic - onUnsubscribe');

  this._updateValueCallback = null;
};


module.exports = ControlCharacteristic;

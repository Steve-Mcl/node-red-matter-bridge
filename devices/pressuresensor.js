const temperaturesensor = require("../temperaturesensor");

const  Endpoint  = require("@project-chip/matter.js/endpoint").Endpoint;
const  BridgedDeviceBasicInformationServer  = require("@project-chip/matter.js/behavior/definitions/bridged-device-basic-information").BridgedDeviceBasicInformationServer;
const PressureSensorDevice = require("@project-chip/matter.js/devices/PressureSensorDevice").PressureSensorDevice

module.exports = {
    pressuresensor: function(child) {
        const device = new Endpoint(
            PressureSensorDevice.with(BridgedDeviceBasicInformationServer),{
                id: child.id,
                bridgedDeviceBasicInformation: {
                    nodeLabel: child.name,
                    productName: child.name,
                    productLabel: child.name,
                    serialNumber: child.id,
                    reachable: true,
                },
                pressureMeasurement: {
                    minMeasuredValue: child.minlevel,
                    maxMeasuredValue: child.maxlevel,
                    measuredValue : child.measuredValue ? child.measuredValue : 0

                }
            }
            )
            device.events.identify.startIdentifying.on(() => {
                child.emit('identify', true)
            });
            device.events.identify.stopIdentifying.on(() => {
                child.emit('identify', false)
            });
            return device;
    }
 }
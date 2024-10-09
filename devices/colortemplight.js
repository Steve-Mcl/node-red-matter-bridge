const  Endpoint  = require("@project-chip/matter.js/endpoint").Endpoint;
const  BridgedDeviceBasicInformationServer  = require("@project-chip/matter.js/behavior/definitions/bridged-device-basic-information").BridgedDeviceBasicInformationServer;
const  ColorTemperatureLightDevice  = require( "@project-chip/matter.js/devices/ColorTemperatureLightDevice").ColorTemperatureLightDevice;
const  ColorControlServer = require( "@project-chip/matter.js/behavior/definitions/color-control").ColorControlServer
const  ColorControl  = require( "@project-chip/matter.js/cluster").ColorControl

module.exports = {
    colortemplight: function(child) {
        const device = new Endpoint(
            ColorTemperatureLightDevice.with(BridgedDeviceBasicInformationServer, ColorControlServer.with(
                ColorControl.Feature.ColorTemperature,
            )),{
                id: child.id,
                bridgedDeviceBasicInformation: {
                    nodeLabel: child.name,
                    productName: child.name,
                    productLabel: child.name,
                    serialNumber: child.id,
                    reachable: true,
                },
                colorControl: {
                    coupleColorTempToLevelMinMireds: 0x00FA,
                    startUpColorTemperatureMireds: 0x00FA,
                }
            }
            )
            device.events.onOff.onOff$Changed.on(value => {
                child.emit('state', value)
            });
            device.events.levelControl.currentLevel$Changed.on(value => {
                let data = {level: value}
                child.emit('state', data)
            })
            device.events.identify.startIdentifying.on(() => {
                child.emit('identify', true)
            });
            device.events.identify.stopIdentifying.on(() => {
                child.emit('identify', false)
            });
            device.events.colorControl.colorTemperatureMireds$Changed.on(value => {
                let data = {temp: value}
                child.emit('state', data)
            });
            return device;
    }
 }
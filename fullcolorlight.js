
module.exports = function(RED) {
    function MatterFullColorLight(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.bridge = RED.nodes.getNode(config.bridge);
        node.name = config.name
        node.range = config.range
        node.gamut = config.gamut
        node.pending = false
        node.pendingmsg = null
        node.passthrough = /^true$/i.test(config.passthrough)
        console.log(`Loading Device node ${node.id}`)
        node.status({fill:"red",shape:"ring",text:"not running"});
        this.on('input', function(msg) {
            node.pending = true
            node.pendingmsg = msg
            if (msg.payload.state == undefined) {
                msg.payload.state = node.device.state.onOff.onOff
            }
            if (msg.payload.level == undefined) {
                msg.payload.level = node.device.state.levelControl.currentLevel
            }
            else {
                if (node.range == "100"){ msg.payload.level = Math.round(msg.payload.level*2.54)}
            }
            if (msg.payload.rgb == undefined){
                let xy = node.device.state.colorControl
            }
            node.device.set({
                levelControl: {
                    currentLevel: msg.payload.level
                }
            })
            switch (msg.payload.state){
                case '1':
                case 1:
                case 'on':
                case true:
                    node.device.set({
                        onOff: {
                            onOff: true,
                        }
                    })
                    break
                case '0':
                case 0:
                case 'off':
                case false:
                    node.device.set({
                        onOff: {
                            onOff: false,
                        }
                    })
                    break
                case 'toggle':
                    node.device.set({
                        onOff: {
                                    onOff: !node.device.state.onOff.onOff,
                                }
                    })
                    break
                
            }
        });
        this.on('serverReady', function() {
            this.status({fill:"green",shape:"dot",text:"ready"});
        })
        this.on('state', function(data){                        
            if ((node.pending && node.passthrough)) {
                var msg = node.pendingmsg
                msg.payload.state = node.device.state.onOff.onOff
                msg.payload.level = node.device.state.levelControl.currentLevel
                if (node.range == "100"){ msg.payload.level = Math.round(msg.payload.level/2.54)}
                node.send(msg);
            } else if (!node.pending){
                var msg = {payload : {}};
                msg.payload.state = node.device.state.onOff.onOff
                msg.payload.level = node.device.state.levelControl.currentLevel
                if (node.range == "100"){ msg.payload.level = Math.round(msg.payload.level/2.54)}
                node.send(msg);
            }
            node.pending = false
        })
        this.on('identify', function(data){
            if (data){
                this.status({fill:"blue",shape:"dot",text:"identify"});
            } else {
                this.status({fill:"green",shape:"dot",text:"ready"});
            }
            
        })

        this.on('close', function(removed, done) {
            this.off('state')
            this.off('serverReady')
            this.off('identify')
            if (removed) {
                // This node has been disabled/deleted
            } else {
                // This node is being restarted
            }
            done();
        });
        //Wait till server is started
        function waitforserver(node) {
            if (!node.bridge.serverReady) {
              setTimeout(waitforserver, 100, node)
            } else {
                console.log('Registering Child......')
                node.bridge.emit('registerChild', node)
            }
        }
        waitforserver(node)
    }
    RED.nodes.registerType("matterfullcolorlight",MatterFullColorLight);
}
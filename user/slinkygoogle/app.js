this.canvas.app = new function (app, canvas, ctx) {
    // Public
    this.width = 680
    this.height = 225
    this.resolution = function (app) {
        // Screen resize adjustments
        canvas.node.width = this.width = 680
        canvas.node.height = this.height = 225
        canvas.node.style.width = canvas.node.width+'px'
        canvas.node.style.height = canvas.node.height+'px'
    }
    this.resolution(app)
    

    // Public 
    var slinky = this.slinky = new Array(25);
    var persp = this.persp = 1;
    var x = this.x = 248;
    var y = this.y = 76;
    var spring = this.spring = {
        coil: this.slinky.length / 2,
        mid: this.slinky.length / 2,
        val: 0,
        stretch: .25,
        sample: 1 / this.slinky.length,
        tminus: 0,
        secms: 50
    };
    var size = this.size =  0.7;
    var swallow = this.swallow =  0.01;
    var lineWidth = this.lineWidth = 5;
    var freq = this.freq = 5;
    var split = this.split = 19; // 37, 21

    // Private
    var coilX = 0;
    var coilY = 0;
    var course = spring.coil / (split * 2);
    var rgb = this.rgb = [
        { pos: slinky.length, val: 0, qual: 0 },
        { pos: spring.mid, val: 0, qual: 1 },
        { pos: slinky.length, val: 0, qual: 1 }
    ];
    var buildSlinky = function () {
        var fallout = 0
        for (let si=0; si<slinky.length; si++) {
            let flux = (1 - si / slinky.length);
                flux = flux < 0.12 ? 0.12 - (fallout += 0.01) : flux;
            slinky[si] = {x: 0, y: 0, y1: 0, y2: 0, y3: 0, c: 50 * (size + swallow), flux: flux}

            for (let c = 0; c < rgb.length; c++) {
                rgb[c].val = si > rgb[c].pos 
                ? ((si - rgb[c].pos) / rgb[c].pos) * 1
                : ((rgb[c].pos - si) / rgb[c].pos) * 1;
                
                rgb[c].val = rgb[c].qual == 0 
                ? rgb[c].val - rgb[c].qual
                : rgb[c].qual - rgb[c].val

                if (c == 1)
                    slinky[si].flux -= (0.1*rgb[c].val)
                
                rgb[c].val *= 255
                rgb[c].val = rgb[c].val << 0
            }
            slinky[si].rgb = [rgb[0].val, rgb[1].val, rgb[2].val]
        }
    }
    buildSlinky()

    var drop = this.drop = {value: 0}
    var imgs = this.imgs = [['items.png', 0, -88, 1, 89, 88], ['richard.jpg', 73, 11, 0], ['betty.jpg', 433, 44, 0], ['boy.jpg', 551, 80, 0], ['googletitle.jpg', 0, 0, 1]];
    function init () {
        for (let ii=0; ii<imgs.length; ii++) {
            let img = imgs[ii][0]
            let x = imgs[ii][1]
            let y = imgs[ii][2]
            let w = imgs[ii][4]
            let h = imgs[ii][5]
            let alpha = imgs[ii][3]
            imgs[ii] = new Image();
            imgs[ii].xPos = x
            imgs[ii].yPos = y
            if (w && h) {
                imgs[ii].wSrc = w
                imgs[ii].hSrc = h
                imgs[ii].xDes = x
                imgs[ii].yDes = y
                imgs[ii].wDes = w
                imgs[ii].hDes = h
                imgs[ii].sprite = 0
            }
            imgs[ii].alpha = alpha
            imgs[ii].onload = function() {
                this.globalAlpha = imgs[ii].alpha;
                if (!this.wSrc && !this.hSrc) 
                    ctx.drawImage(this, this.xPos, this.yPos)
            }
            imgs[ii].src = app.fileLocAssets + img;
        }        
    }

    var hold
    this.rangeINOUT = function(stream, elem, obj, prop) {
        obj[prop].value = parseFloat(elem.value)
        hold = {stream: stream, node: obj[prop], prop: 'value', elem: elem}
        elem.title = elem.value
    }

    ctx.timeline.addon.timeframe.invoke = function () {
        canvas.app.calc(this.lapse, this.access)// before render
        ctx.rendering(this._deltaTimeFrame)
        ctx.compute()// after render
    }

    this.calc = function (lapse, access) {
        if (hold) {
            if (access == 'read')
                ctx.timeline.addon.buffer.injectDataVal(hold.stream, hold.node, hold.prop, hold.elem.value, lapse)
            else
                ctx.timeline.addon.buffer.injectDataVal(hold.stream, hold.node, hold.prop, (hold.elem.title - hold.elem.value), lapse)
            hold.elem.title = hold.elem.value
        }
        persp = this.persp.value
        x = this.x.value
        y = this.y.value
        size = this.size.value
        swallow = this.swallow.value
        spring.r = 50 * (size + swallow);
        spring.c = 100 * (size + swallow);
        lineWidth = this.lineWidth.value
        freq = this.freq.value
        split = this.split.value
    }
    
    var start = 1
    ctx.rendering = function (timeFrame) {
        //console.clear();
        this.globalCompositeOperation = 'destination-over';
        this.save();
        this.clearRect(0, 0, app.width, app.height);
        this.scale(1, persp);
        this.lineWidth = lineWidth;
        var outPut = 'outPut---\n'
        spring.val = 0;

        for (let ci = 0; ci < slinky.length + 1; ci++) {
            spring.val += 
            spring.coil.value >= spring.mid 
            ?
                ci > spring.coil.value 
                ? (1 - (ci - spring.coil.value) / spring.coil.value) * spring.stretch.value
                : (1 - (spring.coil.value - ci) / spring.coil.value) * spring.stretch.value
            :
                ci > spring.coil.value 
                ? -((1 - (ci - (spring.coil.value + spring.mid)) / (spring.coil.value + spring.mid)) * spring.stretch.value)
                : -((1 - ((spring.coil.value + spring.mid) - ci) / (spring.coil.value + spring.mid)) * spring.stretch.value)

            let cross = ci % (spring.mid / split)
            coilX = cross > course 
            ? (1 - (cross - course) / course) * freq
            : (1 - (course - cross) / course) * freq

            if (spring.val == Infinity) {
                spring.val = 0
            }

            coilY = ci == 0 ? spring.val-5 : spring.val;

            if (!slinky[ci]) break

            let flux = start || slinky[ci].flux
            let xX = coilX + x
            let yY = coilY + y

            Math.lerpProp(slinky[ci], 'c', spring.c, flux);

            let icx = slinky[ci].c / 2
            let icy = ((lineWidth) * ci)

            xX = xX > 680-icx ? 680-icx : xX < 0 ? 0 : xX;
            Math.lerpProp(slinky[ci], 'x', xX, flux);

            yY = yY > 380+icy ? 380+icy : yY;
            Math.lerpProp(slinky[ci], 'y', yY, flux);
            yY = 0.75 * spring.stretch.value + spring.val + y;
            yY = yY > 380+icy ? 380+icy : yY;
            Math.lerpProp(slinky[ci], 'y1', yY, flux);
            yY = 0.5 * spring.stretch.value + spring.val + y;
            yY = yY > 380+icy ? 380+icy : yY;
            Math.lerpProp(slinky[ci], 'y2', yY, flux);
            yY = spring.val + y;
            yY = yY > 380+icy ? 380+icy : yY;
            Math.lerpProp(slinky[ci], 'y3', yY, flux);

            this.beginPath();
            this.moveTo(slinky[ci].x + slinky[ci].c / 2, slinky[ci].y);
            
            let r = slinky[ci].rgb[0]
            let g = slinky[ci].rgb[1]
            let b = slinky[ci].rgb[2]

            let gradient = this.createLinearGradient(slinky[ci].x + 200, slinky[ci].y + 400, 50, 50);
            gradient.addColorStop(0.49, 'rgb(' + r + ', ' + g + ', ' + b + ')');
            gradient.addColorStop(0.5, 'rgb(255, 255, 255)');
            gradient.addColorStop(0.51, 'rgb(' + r + ', ' + g + ', ' + b + ')');
            // change composite so source is applied within the shadow-blur

            this.strokeStyle = gradient
            this.arcTo(
                slinky[ci].x,
                slinky[ci].y,
                slinky[ci].x,
                slinky[ci].y + slinky[ci].c,
                slinky[ci].c / 2);
            
            this.arcTo(
                slinky[ci].x,
                slinky[ci].y1 + slinky[ci].c,
                slinky[ci].x + slinky[ci].c,
                slinky[ci].y1 + slinky[ci].c,
                slinky[ci].c / 2);

            this.arcTo(
                slinky[ci].x + slinky[ci].c,
                slinky[ci].y2 + slinky[ci].c,
                slinky[ci].x + slinky[ci].c,
                slinky[ci].y2 + slinky[ci].c / 2,
                slinky[ci].c / 2);
            
            this.arcTo(
                slinky[ci].x + slinky[ci].c,
                slinky[ci].y3,
                slinky[ci].x + slinky[ci].c / 2,
                slinky[ci].y3,
                slinky[ci].c / 2);

            this.stroke();
        }
        this.restore();
        for (let id=0; id<imgs.length; id++) {
            if (imgs[id].wSrc && imgs[id].hSrc) 
                ctx.drawImage(imgs[id], (imgs[id].wSrc * imgs[id].sprite), imgs[id].yPos, imgs[id].wSrc, imgs[id].hSrc, imgs[id].xDes, imgs[id].yDes, imgs[id].wDes, imgs[id].hDes)
        }
        for (let ii=1; ii<imgs.length; ii++) {
            this.globalAlpha = imgs[ii].alpha;
            ctx.drawImage(imgs[ii], imgs[ii].xPos, imgs[ii].yPos)
            this.globalAlpha = 1;
        }
        
        start = undefined
        
    }

    ctx.compute = function () {
        
    }

    this.SetupContextBindsForStreamAndBuildAfterLoad = function () {
        app.codeLoc = 'user/' + app.codesetting
        app.fileLocAssets = app.vscode._fileLocal + app.codeLoc + '/assets/'
        init()
        createGFXBindNodesToStream('timeline')
        buildStream()
    }

    function createGFXBindNodesToStream(stream) {
        console.log('Binding objects to stream - Starting');

        var bind = ctx[stream].addon.binding
        var buffer = ctx.timeline.addon.buffer

        var body = document.body;
        var props = [

            ['Drop: ', 'drop', 'range', '0', '-88', '295', '1', 'canvas.app', 'drop', canvas.app, 1],

            ['Swallow: ', 'swallow', 'range', '0.01', '0', '1', '0.01', 'canvas.app', 'swallow', canvas.app],

            ['SecMs: ', 'secms', 'range', '50', '0', ctx.timeline.addon.timeframe.duration, '1', 'canvas.app.spring', 'secms', canvas.app.spring],
            
            ['TMinus: ', 'tminus', 'range', '0', '0', ctx.timeline.addon.timeframe.duration, '1', 'canvas.app.spring', 'tminus', canvas.app.spring],

            ['Coil: ', 'coil', 'range', '17.69', '0', '1', '0.01', 'canvas.app.spring', 'coil', canvas.app.spring],

            ['X: ', 'x', 'range', '248', '-100', '680', '1', 'canvas.app', 'x', canvas.app],

            ['Y: ', 'y', 'range', '76', '-500', '500', '1', 'canvas.app', 'y', canvas.app],

            ['Persp: ', 'persp', 'range', '1', '0.01', '1', '0.01', 'canvas.app', 'persp', canvas.app],

            ['Frequency: ', 'freq', 'range', '100', '0', '100', '1', 'canvas.app', 'freq', canvas.app],

            ['Split: ', 'split', 'range', '19', '0', '200', '1', 'canvas.app', 'split', canvas.app],

            ['Stretch: ', 'stretch', 'range', '0.25', '0', '100', '0.25', 'canvas.app.spring', 'stretch', canvas.app.spring],

            ['Size: ', 'size', 'range', '0.7', '0', '1', '0.01', 'canvas.app', 'size', canvas.app],

            ['LineWidth: ', 'lineWidth', 'range', '5', '0', '10', '0.25', 'canvas.app', 'lineWidth', canvas.app]
        ]

        var div = document.getElementById("info");
            div.style.position = 'absolute'
            div.style.width = '100%'
            div.style.bottom = '33%'
        for (let ei=0; ei<props.length; ei++) {
            if (ei > 3) {
                let lable = document.createElement("lable");// Create a <lable>
                    lable.innerHTML = props[ei][0]
                var input = document.createElement("input");// Create a <input> element
                    input.id = props[ei][1]
                    input.title = props[ei][3]
                    input.type = props[ei][2]
                    input.onmouseup = input.ontouchend = function () {
                        hold = undefined
                        //this.value = canvas.app[this.id].value
                    }
                    if (input.id =="coil") {
                        input.min = 0;
                        input.max = slinky.length;
                        input.value = spring.coil;
                    } else {
                        input.value = props[ei][3]
                        input.min = props[ei][4]
                        input.max = props[ei][5]
                    }
                    input.step = props[ei][6]
                    input.setAttribute('oninput', 'canvas.app.rangeINOUT("'+stream+'", this, '+props[ei][7]+', "'+props[ei][8]+'");');
                    //input.setAttribute('onchange', 'canvas.app.rangeINOUT("'+stream+'", this, '+props[ei][7]+', "'+props[ei][8]+'");');
                    //// Binding
                    // doing this will keep overwriting timeline stream object on canvas.app / canvas.app.spring
                    // providing propsery length to 1 
                lable.appendChild(input);
                div.appendChild(lable);
            }
            bind(stream, [
            [props[ei][9][props[ei][8]] = {value: props[ei][3]}, 800 + ei]
            ],
                [
                ['value', props[ei][3]]
                ],
            [820],
            false, props[ei][10] ? props[ei][10] : undefined)
            props[ei][9][props[ei][8]].elem = input
        }

        var divInfoStyle = document.createElement('style');
        divInfoStyle.id = 'infoStyle';
        divInfoStyle.innerHTML = 'body { background: #fff; } #info input, #info lable { float: right; } #info lable { color: #000; padding: 2px 0 0 0; }';
        div.appendChild(divInfoStyle);                                                    
    }
    function buildStream(stream) {
        // build stream and prebuff from the binding DATA
        console.log('Finished Binding to stream - Building')
        ctx.timeline.build(function () {
            console.log('Finished Building - Initializing')
            ctx.timeline.addon.timeframe._init(window) // timeframe init has to be set to true for additional scripts to load// and for 2d or 3d mode timeframe mode
        })
    }
}(this.app, this.canvas, this.ctx)
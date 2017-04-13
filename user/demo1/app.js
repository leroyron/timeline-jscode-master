this.canvas.app = new function (app, canvas, ctx) {

    // Public
    this.width = app.resolution.width
    this.height = app.resolution.height
    this.resolution = function (app) {
        // Screen resize adjustments
        canvas.node.width = this.width = app.width
        canvas.node.height = this.height = app.height
    }
    this.resolution(app)

    // Private
    var sun = new Image();
    var moon = new Image();
    var earth = new Image();

    function init () {
        sun.src = 'https://mdn.mozillademos.org/files/1456/Canvas_sun.png';
        moon.src = 'https://mdn.mozillademos.org/files/1443/Canvas_moon.png';
        earth.src = 'https://mdn.mozillademos.org/files/1429/Canvas_earth.png';
    }

    ctx.timeline.addon.timeframe.invoke = function () {
        ctx.calc()// before render
        ctx.rendering()
        ctx.compute()// after render
    }

    ctx.calc = function () {
        
    }

    ctx.rendering = function () {
        this.globalCompositeOperation = 'destination-over';
        this.clearRect(0, 0, 300, 300); // clear canvas

        this.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.strokeStyle = 'rgba(0, 153, 255, 0.4)';
        this.save();
        this.translate(150, 150);

        // Earth
        this.rotate(earth.rotation);
        this.translate(105, 0);
        this.fillRect(0, -12, 50, 24); // Shadow
        this.drawImage(earth, -12, -12);

        // Moon
        this.save();
        this.rotate(moon.nodes[0].rotation);
        this.translate(0, 28.5);
        this.drawImage(moon, -3.5, -3.5);
        this.restore();

        this.restore();
        
        this.beginPath();
        this.arc(150, 150, 105, 0, Math.PI * 2, false); // Earth orbit
        this.stroke();
        
        this.drawImage(sun, 0, 0, 300, 300);
    }

    ctx.compute = function () {
        
    }

    this.SetupContextBindsForStreamAndBuildAfterLoad = function () {
        app.codeLoc = 'user/' + app.codesetting
        app.fileLocAssets = app.vscode._fileLocal + app.codeLoc + '/assets/'
        createGFXBindNodesToStream('timeline')
        buildStream()
    }

    init()

    function createGFXBindNodesToStream(stream) {
        console.log('Binding objects to stream - Starting');

        var bind = ctx[stream].addon.binding
        var buffer = ctx.timeline.addon.buffer

        bind(stream, [
        [earth, 804]
        ],
            [
            ['rotation', 0]
            ],
        [801],
        false)

        moon.nodes = ctx[stream].addon.binding(stream, [
        [moon, 805]
        ],
            [
            ['rotation', 0]
            ],
        [802],
        false)

        buffer.eval('timeline',
        [
            [
                [earth], [[['rotation', 360]]], [['linear', 2200]]
            ]
        ],
        false)

        buffer.eval('timeline',
        [
            [
                [moon.nodes[0]], [[['rotation', 1080 + 360]]], [['linear', 2200]]
            ]
        ],
        false)
        
    }
    function buildStream(stream) {
        // build stream and prebuff from the binding DATA
        console.log('Finished Binding to stream - Building')
        ctx.timeline.build(function () {
            console.log('Finished Building - Initializing')
            ctx.timeline.addon.timeframe._init(window) // timeframe init has to be set to true for additional scripts to load
        })
    }
}(this.app, this.canvas, this.ctx)

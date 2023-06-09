/**
 * AddOn: runtime timeframe
 * //Time-based thrusting
 * //TimeFrame thrust bit by bit through datasets in the stream
 * //based on CPU clock-time.
 * @author leroyron / http://leroy.ron@gmail.com
 */
(function (Streaming) {
    var _struct = Streaming.prototype
    var _runtime = _struct.addon.runtime
    var that = _struct.addon.timeframe = {}
    that.process = undefined // setup to invoke a function before each frame//new Streaming.addon.timeframe.process = function () {}
    that.invoke = undefined // setup to invoke a function after after frame//new Streaming.addon.timeframe.invoke = function () {}
    that.length = undefined
    that.init = false
    that.ready = false
    that.running = false
    that.control = false
    that.lapse = 10
    that.duration = that._duration = 0
    that.read = 0
    that.thrust = 0
    that.mode = '2d'
    that.runtime = function () {
        this.runtimeCallbacks()
    }
    that.runtimeAuthority = function (Authority, select, position) {
        _runtime[select].script[position] = Authority
    }
    that.clearRuntimeAuthority = function (select, at) {
        if (isNaN(at)) {
            _runtime[select].script = []
        } else {
            if (_runtime[select].script[at]) _runtime[select].script.splice(at, 1)
        }
    }
    that.clearRuntimeAuthoritiesNear = function (select, at, near) {
        this.timeline.removeInsertsNear(select, at, near)
        let from = at - near
        let to = at + near
        for (let ni = from; ni < to; ni++) {
            this.clearRuntimeAuthority(select, ni)
        }
    }
    that.revert = function (revertPos) {
        this.revertCallbacks(revertPos)
    }
    that.revertCalls = []
    that.rrclen = 0
    that.revertCallbacks = function (revertPos) {
        for (let rr = 0; rr < this.rrclen; rr++) {
            this.revertCalls[rr][1](this.revertCalls[rr][0], revertPos)
        }
    }
    // reverting start stream from start
    var _revert = function (revertPos) {
        that.revert(revertPos)
    }

    that.update = function (position) {
        time.process = this.process
        time.invoke = this.invoke
        time.length = this.length
        time.running = this.running
        time.lapse = this.lapse
        if (this.updateCallbacks) this.updateCallbacks()

        if (that.mode == '3d') {
            timeframeThrustingStreamingUtilizationAsRuntimeSumingValuesForTHREE()
            timeframeReadingStreamingUtilizationAsRuntimeGettingValuesForTHREE()
        } else {
            timeframeThrustingStreamingUtilizationAsRuntimeSumingValues()
            timeframeReadingStreamingUtilizationAsRuntimeGettingValues()
        }
        syncInTimeframe(position ? position - 1 : undefined)
        timeframeRuntimeStreamRevertCallAndForwardingRevertPositionValue(_revert)
    }

    that.start = function (canvas) {
        this.mode =
        canvas
            ? canvas.context
                ? canvas.context.constructor.name == 'CanvasRenderingContext2D'
                    ? '2d'
                    : '3d'
            : window.canvases
                ? window.canvases['0'].context.constructor.name == 'CanvasRenderingContext2D'
                    ? '2d'
                    : '3d'
            : null
        : null
        this.length = _runtime[_runtime.access.stream].length
        this.init = true
    }

    that._forceInit = function (canvas) {
        // FORCE resizing fix
        window.app.force = true
        window.onresize()
        this.mode =
        canvas
            ? canvas.context
                ? canvas.context.constructor.name == 'CanvasRenderingContext2D'
                    ? '2d'
                    : '3d'
            : window.canvases
                ? window.canvases['0'].context.constructor.name == 'CanvasRenderingContext2D'
                    ? '2d'
                    : '3d'
            : null
        : null
        this.length = _runtime.access.access.prototype.length
        this.init = true
        this._ready()
    }
    that._ready = function () {
        this.ready = true
    }
    that.run = function () {
        if (!this.running && this.ready) {
            time.now = time._then = Date.now()
            this.length = _runtime[_runtime.access.stream] ? _runtime[_runtime.access.stream].length : this.length
            this.running = true
            this.update()
            frame()
        }
    }
    that.stop = function (at) {
        if (this.running) {
            this.running = false
            this.update()
            window.cancelAnimationFrame(time.animationFrameLoop)
        }
        if (at) {
            this.duration = at
            this.syncing()
        }
    }
    that.tick = function (exact, number) {
        time.byFrame.exact = exact || time.byFrame.exact
        time.byFrame.number = number || 1
        this.running = false
        this.run()
    }
    that.keyPauseToggle = function (e) {
        if (e) {
            if (e.keyCode != 32) {
                return
            }
            if (this.running) {
                this.stop()
            } else {
                this.run()
            }
        }
    }
    that.syncing = function (position) {
        var modDuration = position || this.duration
        _runtime.access._syncOffsets(modDuration)
    }

    // Private
    var time = {_then: Date.now(), access: 'read', _remain: 0, lapse: that.lapse, byFrame: {number: 0, exact: false}, frame: that}
    var frame = function () {
        if (!time.running) {
            return
        }
        window.stats.begin()
        time.now = Date.now()
        time._delta = time.now - time._then + time._remain
        that[time.access] = time._timeFrame = time._delta / 10 << 0
        that._duration = that.duration + time._timeFrame
        time.process()
        time._remain = time._delta - (time._timeFrame * 10)// get remainder for percision
        time._then = time.now
        if (time._timeFrame > 0 && time._timeFrame < time.lapse) {
            that.runtime()
            if (!time.byFrame.exact) {
                // values summed up overtime and passed to node properties
                _runtime.access._process(time._timeFrame)
                if (time.byFrame.number > 0) {
                    if (time.byFrame.number == 1) {
                        that.stop()
                    }
                    time.byFrame.number--
                }
                that.duration += time._timeFrame
            } else if (time.byFrame.exact) {
                _runtime.access._process(1)
                time.byFrame.exact = false
                time.byFrame.number = 0
                that.stop()
            }
            time.invoke()
        } else if (time._timeFrame > time.lapse) {
            // time.lapse; if CPU halts the streams for too long then stop process
        }
        time.animationFrameLoop = window.requestAnimationFrame(frame)
        window.stats.end()
    }
    that.switchToTimeFrameThrusting = function (position) {
        time.access = 'thrust'
        _runtime.access.defaults.relative = true
        _runtime.access.block = true
        this.update(position)
    }
    var timeframeThrustingStreamingUtilizationAsRuntimeSumingValuesForTHREE = function () {
        _runtime.access.output_utilizeThrustValues = function (value, node, property) {
            if (value == 0 && property != 806) return
            let setBind = this.bindings.ids[node]
            let setBindProperty = setBind[property]
            setBindProperty.value += value
            // TO-DO redo all demos to utilize property binding value and remove if else statement, uniform scheme
            if (setBindProperty.property) setBind.node[setBindProperty.property][setBindProperty.binding] = setBindProperty.value; else setBind.node[setBindProperty.binding] = setBindProperty.value

            if (property == 806) setBind.node.blockCallback = false // release rotation for callback z bind
        }
    }
    var timeframeThrustingStreamingUtilizationAsRuntimeSumingValues = function () {
        _runtime.access.output_utilizeThrustValues = function (value, node, property) {
            if (value == 0) return
            let setBind = this.bindings.ids[node]
            let setBindProperty = setBind[property]
            setBindProperty.value += value
            // TO-DO redo all demos to utilize property binding value and remove if else statement, uniform scheme
            if (setBindProperty.property) setBind.node[setBindProperty.property][setBindProperty.binding] = setBindProperty.value; else setBind.node[setBindProperty.binding] = setBindProperty.value
        }
    }
    that.switchToTimeFrameReading = function (position) {
        time.access = 'read'
        _runtime.access.defaults.relative = true
        _runtime.access.block = true
        this.update(position)
    }
    var syncInTimeframe = function (position) {
        _runtime.access.option = time.access
        _runtime.access.method = 'all'
        _runtime.access.readCount = _runtime.access.thrustCount = 1
        if (position) that.syncing(position)
    }
    var timeframeReadingStreamingUtilizationAsRuntimeGettingValuesForTHREE = function () {
        _runtime.access.output_utilizeReadValues = function (value, node, property) {
            let setBind = this.bindings.ids[node]
            let setBindProperty = setBind[property]
            setBindProperty.value = value
            // TO-DO redo all demos to utilize property binding value and remove if else statement, uniform scheme
            if (setBindProperty.property) setBind.node[setBindProperty.property][setBindProperty.binding] = setBindProperty.value; else setBind.node[setBindProperty.binding] = setBindProperty.value

            if (property == 806) setBind.node.blockCallback = false // release rotation for callback z bind
        }
    }
    var timeframeReadingStreamingUtilizationAsRuntimeGettingValues = function () {
        _runtime.access.output_utilizeReadValues = function (value, node, property) {
            let setBind = this.bindings.ids[node]
            let setBindProperty = setBind[property]
            setBindProperty.value = value
            // TO-DO redo all demos to utilize property binding value and remove if else statement, uniform scheme
            if (setBindProperty.property) setBind.node[setBindProperty.property][setBindProperty.binding] = setBindProperty.value; else setBind.node[setBindProperty.binding] = setBindProperty.value
        }
    }
    var timeframeRuntimeStreamRevertCallAndForwardingRevertPositionValue = function () {
        _runtime.access.output_revertCall = _revert
    }
    that.resetStreamProperties = function () {
        _runtime.access.revertFromTo(this.length, 0)
    }

    // resize and re-render
    var _resize = function () {
        if (time.invoke) time.invoke()
    }
    window.resizeCalls.push(_resize)
})(this.Streaming)

<template>
  <q-page padding>
    <div>
      <p>{{ numBeams }}</p>
    </div>
    <canvas
      ref="canvas"
      @contextmenu.prevent.stop
      @keydown.prevent.stop="handleKeydown"
      @mousedown="handleMousedown"
      @mouseup="handleMouseup"
      @mousewheel.prevent="handleMousewheel"
      @mousemove="handleMousemove"
      @click="handleClick"
      style="width:100%; height:90%"
    />
  </q-page>
</template>

<script>
import Grid from 'assets/utils/Grid'
import Beam from 'assets/utils/Beam'

export default {
  name: 'Game',
  data() {
    return {
      grid: null,
      beam: null,
      x: 0.0,
      y: 0.0,
      zoom: 0.1,
      lastMouseDownX: null,
      lastMouseDownY: null,
      rightMouseIsDown: false,
      lastPoint: null,
      canvas: null,
      gl: null,
      started: false,
    }
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.resize)
  },

  mounted() {
    this.startGl()
    this.updateGl()
    this.update()
    window.addEventListener('resize', this.resize)
    window.addEventListener('keydown', this.handleKeydown)
  },

  computed: {
    numBeams() {
      if (!this.beam) {
        return 0
      }
      return this.beam.beams.length
    },
  },

  methods: {
    startGl() {
      this.gl = this.$refs.canvas.getContext('experimental-webgl')
      this.grid = new Grid(this.gl)
      this.beam = new Beam(this.gl)
    },

    updateGl() {
      this.$refs.canvas.height = this.$refs.canvas.clientHeight
      this.$refs.canvas.width = this.$refs.canvas.clientWidth
      this.gl.viewport(0, 0, this.$refs.canvas.width, this.$refs.canvas.height)
    },

    update() {
      this.grid.show(this.x, this.y, this.$refs.canvas.width, this.$refs.canvas.height, this.zoom)
      this.beam.show(this.x, this.y, this.$refs.canvas.width, this.$refs.canvas.height, this.zoom)
    },

    resize() {
      this.updateGl()
      this.update()
    },

    handleKeydown(event) {
      switch (event.keyCode) {
        case 27: // esc
          if (this.started) {
            this.beam.beams.pop()
            this.beam.beams.pop()
            this.beam.update()
            this.update()
            this.started = false
          }
          break
        case 37: // left
          this.x -= 10 * this.zoom
          break
        case 38: // up
          this.y += 10 * this.zoom
          break
        case 39: // right
          this.x += 10 * this.zoom
          break
        case 40: // down
          this.y -= 10 * this.zoom
          break
        case 187: // +
        case 171:
          this.zoom /= 1.125
          break
        case 189: // -
        case 173:
          this.zoom *= 1.125
          break
        default:
          console.log(event)
          return true
      }
      this.update()
      return false // don't handle known keys
    },

    calcMousePos(event) {
      return {
        x: Math.round((event.offsetX - this.$refs.canvas.width / 2) * this.zoom + this.x),
        y: Math.round(-(event.offsetY - this.$refs.canvas.height / 2) * this.zoom + this.y),
      }
    },

    handleMousedown(event) {
      if (event.button === 2) {
        this.lastMouseDownX = event.offsetX
        this.lastMouseDownY = event.offsetY
        this.rightMouseIsDown = true
      }
    },

    handleClick(event) {
      if (event.button === 0) {
        const pos = this.calcMousePos(event)
        let curPoint = 0

        for (let x = 2; x < this.beam.points.length + 2; x += 2) {
          curPoint = x / 2

          if (x === this.beam.points.length) {
            this.beam.points = this.beam.points.concat([pos.x, pos.y])
            break
          }

          if (this.beam.points[x] === pos.x && this.beam.points[x + 1] === pos.y) {
            break
          }
        }

        if (this.started && this.lastPoint !== curPoint) {
          let alreadyPresent = false
          for (let x = 0; x < this.beam.beams.length - 2; x += 2) {
            if (
              (this.beam.beams[x] === this.lastPoint && this.beam.beams[x + 1] === curPoint) ||
              (this.beam.beams[x + 1] === this.lastPoint && this.beam.beams[x] === curPoint)
            ) {
              alreadyPresent = true
            }
          }
          if (alreadyPresent) {
            this.beam.beams[this.beam.beams.length - 2] = curPoint
            this.beam.update()
            this.update()
          } else {
            this.beam.beams[this.beam.beams.length - 1] = curPoint
            this.beam.update()
            this.update()
            this.started = false
          }
        }

        if (!this.started) {
          this.beam.beams = this.beam.beams.concat([curPoint, 0])
          this.beam.points[0] = pos.x
          this.beam.points[1] = pos.y
          this.beam.update()
          this.update()
          this.started = true
        }
        this.lastPoint = curPoint
      }
    },

    handleMouseup(event) {
      if (event.button === 2) {
        this.rightMouseIsDown = false
      }
    },

    handleMousemove(event) {
      if (this.rightMouseIsDown) {
        this.x -= this.zoom * (event.offsetX - this.lastMouseDownX)
        this.y += this.zoom * (event.offsetY - this.lastMouseDownY)
        this.lastMouseDownX = event.offsetX
        this.lastMouseDownY = event.offsetY
        this.update()
      }

      if (this.started) {
        const pos = this.calcMousePos(event)
        this.beam.points[0] = pos.x
        this.beam.points[1] = pos.y
        this.beam.update()
        this.update()
      }
    },

    handleMousewheel(event) {
      if (event.wheelDelta > 0) {
        this.x -= (event.offsetX - this.$refs.canvas.width / 2) * this.zoom * 0.125
        this.y += (event.offsetY - this.$refs.canvas.height / 2) * this.zoom * 0.125
        this.zoom *= 1.125
      } else {
        this.zoom /= 1.125
        this.x += (event.offsetX - this.$refs.canvas.width / 2) * this.zoom * 0.125
        this.y -= (event.offsetY - this.$refs.canvas.height / 2) * this.zoom * 0.125
      }

      this.update()
      return false // don't scroll
    },
  },
}
</script>

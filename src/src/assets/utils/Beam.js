export default class Beam {
  constructor(gl) {
    this.gl = gl
    this.points = [0, 0]
    this.beams = []

    this.vbo = this.gl.createBuffer()
    this.ibo = this.gl.createBuffer()
    this.program = this.gl.createProgram()

    var vs = this.gl.createShader(this.gl.VERTEX_SHADER)
    this.gl.shaderSource(
      vs,
      'precision highp float;\n' +
        'attribute vec2 pos;\n' +
        'uniform vec4 transform;\n' +
        'uniform float zoom;\n' +
        'void main() {\n' +
        '  gl_Position = vec4((pos-transform.xy) / (zoom*transform.zw*0.5), 0.0, 1.0);\n' +
        '}\n'
    )
    this.gl.compileShader(vs)
    console.log(this.gl.getShaderInfoLog(vs))
    this.gl.attachShader(this.program, vs)
    this.gl.deleteShader(vs)

    var fs = this.gl.createShader(this.gl.FRAGMENT_SHADER)
    // prettier-ignore
    this.gl.shaderSource(
      fs,
      'precision highp float;\n' +
      'void main() {\n' +
      '  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n' +
      '}\n'
    )
    this.gl.compileShader(fs)
    console.log(this.gl.getShaderInfoLog(fs))
    this.gl.attachShader(this.program, fs)
    this.gl.deleteShader(fs)

    this.gl.linkProgram(this.program)
    this.pos_loc = this.gl.getAttribLocation(this.program, 'pos')
    this.transform_loc = this.gl.getUniformLocation(this.program, 'transform')
    this.zoom_loc = this.gl.getUniformLocation(this.program, 'zoom')

    this.gl.lineWidth(2)
    this.update()
  }

  update() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.points), this.gl.STATIC_DRAW)
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo)
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(this.beams), this.gl.STATIC_DRAW)
  }

  show(x, y, width, height, zoom) {
    this.gl.useProgram(this.program)

    this.gl.uniform1f(this.zoom_loc, zoom)
    this.gl.uniform4f(this.transform_loc, x, y, width, height)

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo)
    this.gl.vertexAttribPointer(this.pos_loc, 2, this.gl.FLOAT, false, 0, 0)
    this.gl.enableVertexAttribArray(this.pos_loc)
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo)

    this.gl.drawElements(this.gl.LINES, this.beams.length, this.gl.UNSIGNED_SHORT, 0)

    this.gl.disableVertexAttribArray(this.pos_loc)
  }
}

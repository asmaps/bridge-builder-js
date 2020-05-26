export default class Grid {
  constructor(gl) {
    this.gl = gl
    this.vbo = this.gl.createBuffer()
    this.program = this.gl.createProgram()

    var vs = this.gl.createShader(this.gl.VERTEX_SHADER)
    this.gl.shaderSource(
      vs,
      'precision highp float;\n' +
        'attribute vec2 pos;\n' +
        'uniform vec4 transform;\n' +
        'uniform float zoom;\n' +
        'varying vec2 real_pos;\n' +
        'void main() {\n' +
        '  gl_Position = vec4(pos, 0.0, 1.0);\n' +
        '  real_pos = pos*transform.zw*0.5*zoom+transform.xy;\n' +
        '}\n'
    )
    this.gl.compileShader(vs)
    console.log(this.gl.getShaderInfoLog(vs))
    this.gl.attachShader(this.program, vs)
    this.gl.deleteShader(vs)

    var fs = this.gl.createShader(this.gl.FRAGMENT_SHADER)
    this.gl.shaderSource(
      fs,
      'precision highp float;\n' +
        'varying vec2 real_pos;\n' +
        'uniform float zoom;\n' +
        'void main() {\n' +
        '  vec2 p_0 = -2.0*abs(fract(real_pos*1.0+0.5)-0.5)+zoom*1.01;\n' +
        '  vec2 p_1 = -2.0*abs(fract(real_pos*0.1+0.5)-0.5)+zoom*0.101;\n' +
        '  vec2 p_2 = -2.0*abs(fract(real_pos*0.01+0.5)-0.5)+zoom*0.0101;\n' +
        '  vec2 p_3 = -2.0*abs(fract(real_pos*0.001+0.5)-0.5)+zoom*0.00101;\n' +
        '  float zoom_log = log(zoom) / log(0.1);\n' +
        '  vec4 verteilung = clamp(vec4(zoom_log,zoom_log+1.0,zoom_log+2.0,zoom_log+3.0), 0.0, 1.0) * 0.25;\n' +
        '  float c = 0.0;\n' +
        '  if(max(p_0.x, p_0.y) >= 0.0) c = c + verteilung.x;\n' +
        '  if(max(p_1.x, p_1.y) >= 0.0) c = c + verteilung.y;\n' +
        '  if(max(p_2.x, p_2.y) >= 0.0) c = c + verteilung.z;\n' +
        '  if(max(p_3.x, p_3.y) >= 0.0) c = c + verteilung.w;\n' +
        '  gl_FragColor = vec4(c, c, c, 1.0);\n' +
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

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo)
    var vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    this.gl.bufferData(gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW)
  }

  show(x, y, width, height, zoom) {
    this.gl.useProgram(this.program)

    this.gl.uniform1f(this.zoom_loc, zoom)
    this.gl.uniform4f(this.transform_loc, x, y, width, height)

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo)
    this.gl.vertexAttribPointer(this.pos_loc, 2, this.gl.FLOAT, false, 0, 0)
    this.gl.enableVertexAttribArray(this.pos_loc)

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)

    this.gl.disableVertexAttribArray(this.pos_loc)
  }
}

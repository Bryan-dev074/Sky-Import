'use client'

import { useEffect, useRef } from 'react'

/**
 * HILOS — el fondo del primer viewport.
 *
 * Cuarenta líneas de ruido Perlin que ondulan y se separan al pasar el puntero.
 * Sobre carbón lee como el flujo de corriente por una placa, que es
 * exactamente el mundo de la casa.
 *
 * Adaptado del componente `Threads` de React Bits (MIT + Commons Clause,
 * <https://reactbits.dev>), portado a TypeScript y ajustado a la paleta y a las
 * reglas de rendimiento de este proyecto. La atribución está en `CREDITS.md`.
 *
 * Cambios respecto del original, todos por las mismas razones que el resto del
 * proyecto:
 *   · El color por defecto es el cian de instrumento de la casa.
 *   · Se apaga entero con `prefers-reduced-motion` en vez de seguir corriendo.
 *   · Resolución interna acotada: el sombreador cuesta por píxel, así que en
 *     pantallas grandes o de alta densidad se renderiza a menos y se escala.
 *   · Libera el contexto WebGL al desmontar.
 */

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 22;
const float u_line_width = 6.0;
const float u_line_blur = 9.0;

float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);

    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
        Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
        st.x * 0.3
    );

    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;

    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );

    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
        0.0,
        1.0
    );
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

    float line_strength = 1.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        line_strength *= (1.0 - lineFn(
            uv,
            u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
            p,
            (PI * 1.0) * p,
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        ));
    }

    float colorVal = 1.0 - line_strength;
    gl_FragColor = vec4(uColor * colorVal, colorVal);
}
`

interface Props {
  /** RGB normalizado. Por defecto, el cian de instrumento de la casa. */
  color?: [number, number, number]
  amplitude?: number
  distance?: number
  className?: string
}

export default function Threads({
  color = [0.333, 0.784, 0.961],
  amplitude = 1.1,
  distance = 0.32,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let disposed = false
    let cleanup: (() => void) | null = null

    void (async () => {
      let ogl: typeof import('ogl')
      try {
        ogl = await import('ogl')
      } catch {
        return
      }
      if (disposed) return

      const { Renderer, Program, Mesh, Triangle, Color } = ogl

      let renderer: InstanceType<typeof Renderer>
      try {
        renderer = new Renderer({ alpha: true, antialias: false })
      } catch {
        return
      }

      const gl = renderer.gl
      gl.clearColor(0, 0, 0, 0)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      container.appendChild(gl.canvas)
      gl.canvas.style.width = '100%'
      gl.canvas.style.height = '100%'
      gl.canvas.style.display = 'block'

      const geometry = new Triangle(gl)
      const program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          iTime: { value: 0 },
          iResolution: {
            value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height),
          },
          uColor: { value: new Color(...color) },
          uAmplitude: { value: amplitude },
          uDistance: { value: distance },
          uMouse: { value: new Float32Array([0.5, 0.5]) },
        },
      })
      const mesh = new Mesh(gl, { geometry, program })

      // El sombreador cuesta por píxel y el coste crece con el área, así que en
      // pantallas grandes se renderiza a bastante menos resolución y se escala.
      // Medido: con el tope en 1440 la portada perdía cuadros; con 900 no, y a
      // simple vista el fondo es el mismo porque no tiene bordes duros.
      const MAX_DIM = 900
      const resize = () => {
        const { clientWidth, clientHeight } = container
        if (clientWidth === 0 || clientHeight === 0) return
        const base = Math.min(window.devicePixelRatio || 1, 2)
        const longest = Math.max(clientWidth, clientHeight) * base
        renderer.dpr = longest > MAX_DIM ? (base * MAX_DIM) / longest : base
        renderer.setSize(clientWidth, clientHeight)
        const res = program.uniforms.iResolution.value as { r: number; g: number; b: number }
        res.r = gl.canvas.width
        res.g = gl.canvas.height
        res.b = gl.canvas.width / gl.canvas.height
      }
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(container)
      resize()

      const current: [number, number] = [0.5, 0.5]
      let target: [number, number] = [0.5, 0.5]
      const onMove = (event: PointerEvent) => {
        const rect = container.getBoundingClientRect()
        target = [
          (event.clientX - rect.left) / rect.width,
          1 - (event.clientY - rect.top) / rect.height,
        ]
      }
      const onLeave = () => {
        target = [0.5, 0.5]
      }
      window.addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('pointerleave', onLeave)

      let visible = true
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) visible = entry.isIntersecting
        },
        { threshold: 0 },
      )
      io.observe(container)

      /**
       * GUARDIÁN DE CUADROS
       *
       * Un fondo a pantalla completa es el sitio más fácil para arruinar una
       * página en un equipo modesto, y no hay forma fiable de saber de antemano
       * si la GPU del visitante aguanta este sombreador. Así que se mide: se
       * observan los primeros cuadros y se mira el percentil 75 —no la mediana,
       * porque el caso malo es intermitente y una mediana buena lo esconde—. Si
       * pasa de 24 ms, primero se baja la resolución interna; si aun así no
       * sostiene, el fondo se retira del todo y queda la retícula estática de
       * CSS, que ya está en la página.
       *
       * Degradar solo es mejor que apostar: en un equipo con GPU el fondo va
       * entero, y en uno que no puede, la tienda sigue fluida.
       */
      const muestras: number[] = []
      let nivel = 0
      let previo = 0

      const degradar = () => {
        nivel += 1
        muestras.length = 0
        if (nivel === 1) {
          renderer.dpr = Math.max(0.35, renderer.dpr * 0.5)
          resize()
        } else {
          // Se retira: el respaldo es no tener fondo animado.
          cleanup?.()
          cleanup = null
        }
      }

      let frame = 0
      const tick = (time: number) => {
        frame = requestAnimationFrame(tick)
        if (!visible || document.hidden) {
          previo = 0
          return
        }

        if (nivel < 2) {
          if (previo !== 0) muestras.push(time - previo)
          previo = time
          if (muestras.length === 48) {
            const orden = muestras.slice().sort((a, b) => a - b)
            const p75 = orden[35] ?? 16
            if (p75 > 24) degradar()
            else nivel = 2
          }
        }

        current[0] += 0.055 * (target[0] - current[0])
        current[1] += 0.055 * (target[1] - current[1])
        const mouse = program.uniforms.uMouse.value as Float32Array
        mouse[0] = current[0]
        mouse[1] = current[1]
        program.uniforms.iTime.value = time * 0.001
        renderer.render({ scene: mesh })
      }
      frame = requestAnimationFrame(tick)

      cleanup = () => {
        cancelAnimationFrame(frame)
        resizeObserver.disconnect()
        io.disconnect()
        window.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerleave', onLeave)
        if (container.contains(gl.canvas)) container.removeChild(gl.canvas)
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
    })()

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [color, amplitude, distance])

  return <div ref={ref} className={className} aria-hidden="true" />
}

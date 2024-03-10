import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

const RenderMaterial = shaderMaterial(
    {
        uPosition: null,
        uTime: 0
    },
    // vertex shader
    `
    uniform sampler2D uPosition;
    uniform float uTime;

    varying vec2 vUv;
    void main() {
      vUv = uv;
      // vec3 pos = texture2D(uPosition, vUv).xyz;
      vec3 pos = position;
      pos.z = sin(pos.x * 5. + uTime * 1.) * 0.1;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
    `,

    // fragment shader
    `
    varying vec2 vUv;
    void main() {
      gl_FragColor.rgba = vec4(vUv,0., 1.0);
    }
    `,
)

extend({ RenderMaterial })
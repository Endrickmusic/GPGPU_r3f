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

    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 pos = texture2D(uPosition, vUv).xyz;
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
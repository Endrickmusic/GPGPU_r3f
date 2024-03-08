import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"

const SimulationMaterial = shaderMaterial(
    {
        uPosition : null,
        uVelocity : null,
    },
    // Vertex Shader
    `
    attribute vec2 ref;

    varying vec2 vUv;

    void main(){
        vUv = uv ;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 5.0;
    }
    `,
    // Fragment Shader
    `
    uniform sampler2D uPosition;
    uniform sampler2D uVelocity;

    varying vec2 vUv;
    
    void main(){

        vec3 position = texture2D(uPosition, vUv).rgb;
        vec3 velocity = texture2D(uVelocity, vUv).rgb;

        position += velocity * 0.01; 

        gl_FragColor.rgba = vec4(position, 1.0);
    }
    `,
)

extend({ SimulationMaterial })
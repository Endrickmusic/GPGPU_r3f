export default `

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}


void main() {

vec2 vUv = gl_FragCoord.xy / resolution.xy;

vec3 position = texture2D(uCurrentPosition, vUv ).xyz;

gl_FragColor = vec4(position, 1.0);

}
`

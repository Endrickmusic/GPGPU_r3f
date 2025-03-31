export default `

void main() {

vec2 vUv = gl_FragCoord.xy / resolution.xy;

vec3 position = texture2D(uCurrentPosition, vUv ).xyz;

gl_FragColor = vec4(position, 1.0);

}
`

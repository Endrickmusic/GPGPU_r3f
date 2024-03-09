export default `
// uniform sampler2D uCurrentPosition;
uniform sampler2D uOriginalPosition;

uniform float uTime;
uniform float uProgress;
uniform vec3 uMouse;

// varying vec2 vUv;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}


void main() {

vec2 vUv = gl_FragCoord.xy / resolution.xy;
float offset = rand(vUv);

vec3 positions = texture2D(uCurrentPosition, vUv ).xyz;
vec3 original = texture2D(uOriginalPosition, vUv ).xyz;
vec3 velocity = texture2D(uCurrentVelocity, vUv ).xyz;


// // vec2 velocity = texture2D( uCurrentPosition, vUv ).zw;

// vec3 finalOriginal = original;

velocity *= .97;

// Particle attraction to shape force

vec3 direction = normalize( original - positions );
float dist = length( original - positions );
if( dist > 0.01 ) {
    velocity += direction * 0.0001;
}

// Mouse repel force

float mouseDistance = distance( positions, uMouse );
float maxDistance = 0.3;
if( mouseDistance < maxDistance ){
    vec3 direction = normalize( positions - uMouse );
    velocity += direction * ( 1.0 - mouseDistance / maxDistance ) * 0.001;
}

// // Lifespan particles

// float lifespan = 10.;
// float age = mod( uTime + lifespan * offset, lifespan );
// if( age < 0.1){
//     velocity = vec2(0.00, 0.001);
    
//     positions.xy = finalOriginal;
// }

// positions.xy += velocity;

gl_FragColor = vec4(velocity, 1.0);

}
`
import './RenderMaterial'
import './SimulationMaterial'
import { getDataTexture } from './getDataTexture.jsx'

const SIZE = 32;

const particles = new Float32Array(SIZE * SIZE * 3);
for(let i = 0; i < SIZE; i++){
    for(let j = 0; j < SIZE; j++){
        const index = i * SIZE + j

        particles[ index * 3 + 0 ] = i / SIZE * 5.0 
        particles[ index * 3 + 1 ] = j / SIZE * 5.0
        particles[ index * 3 + 2 ] = 0
    }
}

const ref = new Float32Array(SIZE * SIZE * 2);
for(let i = 0; i < SIZE; i++){
    for(let j = 0; j < SIZE; j++){
        const index = i * SIZE + j

        ref[ index * 2 + 0 ] = i / (SIZE - 1)
        ref[ index * 2 + 1 ] = j / (SIZE - 1)
    }
}

export function Particles(){
    return(
        <points
        position = {[1.5, 0, 0]}
        >
            <bufferGeometry>
                <bufferAttribute
                attach = "attributes-position"
                count = {particles.length / 3}
                array = {particles}
                itemSize = {3}
                />
                <bufferAttribute
                attach = "attributes-ref"
                count = {ref.length / 3}
                array = {ref}
                itemSize = {2}
                />
            </bufferGeometry>

            <renderMaterial 
            uPosition = {getDataTexture(SIZE)}
            />
        </points>
    )
}
import { createPortal, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Scene, OrthographicCamera, FloatType } from 'three'
import { useFBO } from '@react-three/drei'

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

    const scene = new Scene()
    const camera = new OrthographicCamera(-1, 1, 1, -1, -1, 1)

    let target0 = useFBO(SIZE, SIZE,{
        type : FloatType,
    })
    let target1 = useFBO(SIZE, SIZE,{
        type : FloatType,
    })
    const simMat = useRef()
    const renderMat = useRef()

    useFrame(({gl})=>{
        gl.setRenderTarget(target0)
        gl.render(scene, camera)
        gl.setRenderTarget(null)

        renderMat.current.uniforms.uPosition.value = target1.texture
        simMat.current.uniforms.uPosition.value = target0.texture

        let temp = target0
        target0 = target1
        target1 = temp
    })

    return(
    <>
    {createPortal(
        <mesh>
            <planeGeometry args={[2, 2]} />
            <simulationMaterial 
            ref = {simMat}
            uPosition = {getDataTexture(SIZE)}
            uVelocity = {getDataTexture(SIZE)}
            />
        </mesh>,
        scene
    )}
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
            ref = {renderMat}
            />
        </points>
    </>
    )
}
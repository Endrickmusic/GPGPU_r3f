import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Scene, OrthographicCamera, FloatType, NearestFilter, AdditiveBlending, Vector3 } from 'three'
import { useFBO } from '@react-three/drei'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'

import './RenderMaterial'
import './SimulationMaterial'
import { getDataTexture, getSphereTexture, getVelocityTexture } from './getDataTexture.jsx'
import simFragmentPosition from './shader/simFragmentPosition.js'
import simFragmentVelocity from './shader/simFragmentVelocity.js'


export function Particles(){

    const SIZE = 128

    const simMat = useRef()
    const renderMat = useRef()
    const followMouseRef = useRef()

    const { gl, viewport } = useThree()

    const gpuCompute = new GPUComputationRenderer( SIZE, SIZE, gl )

    const pointsOnSphere = getSphereTexture(SIZE)

    const positionVariable = gpuCompute.addVariable( 'uCurrentPosition', simFragmentPosition, pointsOnSphere )
    
    const velocityVariable = gpuCompute.addVariable( 'uCurrentVelocity', simFragmentVelocity, getVelocityTexture(SIZE) )
    
    gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] )
    
    gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] )

    const positionUniforms = positionVariable.material.uniforms
    const velocityUniforms = velocityVariable.material.uniforms

    positionUniforms.uOriginalPosition = { value: pointsOnSphere}
    velocityUniforms.uMouse = { value: new Vector3(0, 0, 0)}
    velocityUniforms.uOriginalPosition = { value: pointsOnSphere}

    gpuCompute.init()

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
 
    const originalPosition = getDataTexture(SIZE)

    useFrame(({mouse}) => {
        followMouseRef.current.position.x = mouse.x * viewport.width / 2
        followMouseRef.current.position.y = mouse.y * viewport.height / 2
        velocityUniforms.uMouse.value.x = mouse.x * viewport.width / 2
        velocityUniforms.uMouse.value.y = mouse.y * viewport.height / 2
    })

    useFrame(({gl})=>{
        gpuCompute.compute()

         renderMat.current.uniforms.uPosition.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture
        // gl.setRenderTarget(target0)
        // gl.render(scene, camera)
        // gl.setRenderTarget(null)

        // renderMat.current.uniforms.uPosition.value = target1.texture
        // simMat.current.uniforms.uPosition.value = target0.texture

        // let temp = target0
        // target0 = target1
        // target1 = temp
    })

    return(
    <>

    <mesh
    ref = {followMouseRef}
    >
        <sphereGeometry
        args={[0.1, 32, 32]}
        />
        <meshBasicMaterial
        color={0x5500bb}
        />
    </mesh>
        <points
        position = {[0, 0, 0]}
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
            transparent = {true}
            blending = {AdditiveBlending}
            />
        </points>
    </>
    )
}
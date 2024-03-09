import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useRef, useMemo, useEffect } from 'react'
import { Scene, OrthographicCamera, FloatType, NearestFilter, 
        AdditiveBlending, Vector3, MeshPhysicalMaterial, 
        InstancedBufferAttribute, MeshMatcapMaterial } from 'three'
import { useFBO, useTexture } from '@react-three/drei'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import CustomShaderMaterial from 'three-custom-shader-material'
import { patchShaders } from 'gl-noise/build/glNoise.m'
import { EffectComposer, DepthOfField } from '@react-three/postprocessing'

import './RenderMaterial'
import './SimulationMaterial'
import { getDataTexture, getSphereTexture, getVelocityTexture } from './getDataTexture.jsx'
import simFragmentPosition from './shader/simFragmentPosition.js'
import simFragmentVelocity from './shader/simFragmentVelocity.js'


const shader = {
    vertex: /* glsl */ `
      
      attribute vec2 ref;

      uniform float uTime;
      uniform sampler2D uPosition;
      uniform sampler2D uVelocity;

      vec3 rotate3D(vec3 v, vec3 vel){
        vec3 newPos = v;
        vec3 up = vec3(0, 1, 0);
        vec3 axis = normalize(cross(up, vel));
        float angle = acos(dot(up, normalize(vel)));
        newPos = newPos * cos (angle) + cross(axis, newPos) * sin(angle) + axis * dot(axis, newPos) * (1. - cos(angle));
        return newPos;
    }

      vec3 displace(vec3 point, vec3 vel) {
        vec3 pos = texture2D(uPosition, ref).rgb;
        vec3 copyPoint = rotate3D(point, vel);
        vec3 instancePosition = (instanceMatrix * vec4(copyPoint, 1.)).xyz;
        return instancePosition + pos;
      }  
  
      void main() {
        vec3 vel = texture2D(uVelocity, ref).rgb;
        vec3 p = displace(position, vel);
        csm_PositionRaw = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.);
        csm_Normal = rotate3D( normal, vel );
      }
      `,
    fragment: /* glsl */ `
      void main() {
        csm_DiffuseColor = vec4(1.);
      }
      `,
  }

export function Particles(){

    const SIZE = 512

    const [matcap1, matcap2, matcap3, matcap4] = useTexture(['./textures/matcap01.png', './textures/matcap02.jpg', './textures/matcap03.jpg', './textures/matcap07.jpg'])

    const simMat = useRef()

    const followMouseRef = useRef()
    const iRef = useRef()

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

    const uniforms = useMemo(
        () => ({
          uPosition: {
            value: null,
          },
          uVelocity: {
            value: null,
          },
        }),
        []
      )

    useEffect(() => {
        const ref = new Float32Array(SIZE * SIZE * 2);
        for(let i = 0; i < SIZE; i++){
            for(let j = 0; j < SIZE; j++){
                const index = i * SIZE + j
    
                ref[ index * 2 + 0 ] = i / (SIZE - 1)
                ref[ index * 2 + 1 ] = j / (SIZE - 1)
            }
        }
        iRef.current.geometry.setAttribute('ref', new InstancedBufferAttribute(ref, 2))
    }, [])

    useFrame(({mouse}) => {
        followMouseRef.current.position.x = mouse.x * viewport.width / 2
        followMouseRef.current.position.y = mouse.y * viewport.height / 2
        velocityUniforms.uMouse.value.x = mouse.x * viewport.width / 2
        velocityUniforms.uMouse.value.y = mouse.y * viewport.height / 2
    })

    useFrame(({gl})=>{
        gpuCompute.compute()
        
         iRef.current.material.uniforms.uPosition.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture

         iRef.current.material.uniforms.uVelocity.value = gpuCompute.getCurrentRenderTarget(velocityVariable).texture
    })

    return(
    <>

    <EffectComposer>
        <DepthOfField 
        focusDistance={ .025 }
        focalLength={ 0.025 }
        bokehScale={ 3 }
        />
    </EffectComposer>

    <mesh
    ref = {followMouseRef}
    >
        <icosahedronGeometry
        args={[0.1, 0]}
        />
        <meshMatcapMaterial
        matcap={matcap2}
        />
    </mesh>

    <instancedMesh
        ref= {iRef}
        args = {[null, null, SIZE*SIZE]}
        >
        <capsuleGeometry args={[0.01, 0.07, 5, 10 ]} />
        <CustomShaderMaterial
          baseMaterial={MeshMatcapMaterial}
          size={0.01}
          vertexShader={patchShaders(shader.vertex)}
          fragmentShader={patchShaders(shader.fragment)}
          uniforms={uniforms}
          transparent
          matcap={matcap4}
        />
    </instancedMesh>
</>
)
}
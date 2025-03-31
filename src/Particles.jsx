import { createPortal, useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo, useEffect } from "react"
import {
  Scene,
  OrthographicCamera,
  FloatType,
  NearestFilter,
  AdditiveBlending,
  Vector3,
  MeshPhysicalMaterial,
  InstancedBufferAttribute,
  MeshMatcapMaterial,
} from "three"
import { useFBO, useTexture } from "@react-three/drei"
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js"
import CustomShaderMaterial from "three-custom-shader-material"
import { patchShaders } from "gl-noise/build/glNoise.m"

import "./RenderMaterial"
import "./SimulationMaterial"
import {
  getDataTexture,
  getSphereTexture,
  getVelocityTexture,
} from "./getDataTexture.jsx"
import simFragmentPosition from "./shader/simFragmentPosition.js"

const shader = {
  vertex: /* glsl */ `
      
      attribute vec2 ref;
      
      uniform sampler2D uPosition;
  
      void main() {
        vec3 pos = texture2D(uPosition, ref).rgb;
        vec3 instancePosition = (instanceMatrix * vec4(position, 1.)).xyz;
        vec3 p = instancePosition + pos;
        csm_PositionRaw = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.);
      }
      `,
  fragment: /* glsl */ `
      void main() {
        csm_DiffuseColor = vec4(1.);
      }
      `,
}

export function Particles() {
  const SIZE = 5

  const [matcap1, matcap2, matcap3, matcap4] = useTexture([
    "./textures/matcap01.png",
    "./textures/matcap02.jpg",
    "./textures/matcap03.jpg",
    "./textures/matcap07.jpg",
  ])

  const iRef = useRef()

  const { gl, viewport } = useThree()

  const gpuCompute = new GPUComputationRenderer(SIZE, SIZE, gl)

  const pointsOnSphere = getSphereTexture(SIZE)

  const positionVariable = gpuCompute.addVariable(
    "uCurrentPosition",
    simFragmentPosition,
    pointsOnSphere
  )

  gpuCompute.setVariableDependencies(positionVariable, [positionVariable])

  gpuCompute.init()

  const uniforms = useMemo(
    () => ({
      uPosition: {
        value: null,
      },
    }),
    []
  )

  useEffect(() => {
    const ref = new Float32Array(SIZE * SIZE * 2)
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        const index = i * SIZE + j

        ref[index * 2 + 0] = i / (SIZE - 1)
        ref[index * 2 + 1] = j / (SIZE - 1)
      }
    }
    iRef.current.geometry.setAttribute(
      "ref",
      new InstancedBufferAttribute(ref, 2)
    )
  }, [])

  useFrame(({ gl }) => {
    gpuCompute.compute()

    iRef.current.material.uniforms.uPosition.value =
      gpuCompute.getCurrentRenderTarget(positionVariable).texture
  })

  return (
    <>
      <instancedMesh ref={iRef} args={[null, null, SIZE * SIZE]}>
        {/* <boxGeometry args={[0.1, 0.7, 0.1]} /> */}
        <sphereGeometry args={[0.3, 64, 64]} />
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
      <mesh position={[2, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={gpuCompute.getCurrentRenderTarget(positionVariable).texture}
        />
      </mesh>
    </>
  )
}

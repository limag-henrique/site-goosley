"use client";

import { useFrame, useThree, extend } from "@react-three/fiber";
import { ScrollControls, useScroll, useTexture, Html, shaderMaterial } from "@react-three/drei";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";
import { Project } from "./PortfolioCanvas";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";

interface PortfolioSceneProps {
  projects: Project[];
  activeProject: number | null;
  setActiveProject: (index: number | null) => void;
}

export function PortfolioScene({ projects, activeProject, setActiveProject }: PortfolioSceneProps) {
  return (
    <ScrollControls pages={projects.length * 0.5 + 1} damping={0.1}>
      <Carousel 
        projects={projects} 
        activeProject={activeProject} 
        setActiveProject={setActiveProject} 
      />
    </ScrollControls>
  );
}

const ProjectMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(),
    uTime: 0,
    uScrollOffset: 0,
    uIsActive: 0,
    uAlpha: 1
  },
  // vertex shader
  `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uScrollOffset;
    uniform float uIsActive;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Fluid wave distortion based on scroll and time, but only when not active
      float wave = sin(pos.x * 2.0 + uTime * 2.0) * 0.1 * uScrollOffset * (1.0 - uIsActive);
      pos.z += wave;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // fragment shader
  `
    uniform sampler2D uTexture;
    uniform float uAlpha;
    varying vec2 vUv;
    
    void main() {
      vec4 texColor = texture2D(uTexture, vUv);
      gl_FragColor = vec4(texColor.rgb, texColor.a * uAlpha);
    }
  `
);

extend({ ProjectMaterial });

// Add to Three elements namespace for TS
declare module '@react-three/fiber' {
  interface ThreeElements {
    projectMaterial: any;
  }
}

function Carousel({ projects, activeProject, setActiveProject }: PortfolioSceneProps) {
  const group = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const { viewport } = useThree();
  
  const radius = viewport.width * 1.5;

  // Track previous scroll to calculate delta for distortion
  const lastScroll = useRef(0);
  const scrollVelocity = useRef(0);

  useFrame((state, delta) => {
    if (!group.current || activeProject !== null) return;

    const currentScroll = scroll.offset;
    const velocity = currentScroll - lastScroll.current;
    scrollVelocity.current = THREE.MathUtils.lerp(scrollVelocity.current, velocity * 100, 0.1);
    lastScroll.current = currentScroll;

    const totalRotation = (projects.length - 1) * (Math.PI / 4);
    const targetRotation = currentScroll * totalRotation;

    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      targetRotation,
      4,
      delta
    );
  });

  return (
    <group ref={group}>
      {projects.map((project, index) => {
        const angle = index * (Math.PI / 4);
        return (
          <ProjectSlice
            key={index}
            project={project}
            index={index}
            angle={angle}
            radius={radius}
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            scrollVelocity={scrollVelocity}
          />
        );
      })}
    </group>
  );
}

interface ProjectSliceProps {
  project: Project;
  index: number;
  angle: number;
  radius: number;
  activeProject: number | null;
  setActiveProject: (index: number | null) => void;
  scrollVelocity: React.MutableRefObject<number>;
}

function ProjectSlice({ project, index, angle, radius, activeProject, setActiveProject, scrollVelocity }: ProjectSliceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<any>(null);
  const { viewport } = useThree();
  const texture = useTexture(project.image);
  
  const basePosition = useMemo(() => {
    return new THREE.Vector3(
      Math.sin(angle) * radius,
      0,
      Math.cos(angle) * radius - radius
    );
  }, [angle, radius]);

  const isActive = activeProject === index;
  const isAnyActive = activeProject !== null;

  useFrame((state, delta) => {
    if (!meshRef.current || !matRef.current) return;

    matRef.current.uTime = state.clock.elapsedTime;

    if (isActive) {
      meshRef.current.position.lerp(new THREE.Vector3(0, 0, 2), 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
      
      const targetScaleX = viewport.width * 0.9;
      const targetScaleY = viewport.height * 0.9;
      
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScaleX, 0.1);
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScaleY, 0.1);
      
      matRef.current.uIsActive = THREE.MathUtils.lerp(matRef.current.uIsActive, 1, 0.1);
      matRef.current.uScrollOffset = THREE.MathUtils.lerp(matRef.current.uScrollOffset, 0, 0.1);
      matRef.current.uAlpha = THREE.MathUtils.lerp(matRef.current.uAlpha, 1, 0.1);
    } else {
      const tPos = new THREE.Vector3().copy(basePosition);
      if (isAnyActive) {
        tPos.z -= 10;
        meshRef.current.position.lerp(tPos, 0.1);
        matRef.current.uAlpha = THREE.MathUtils.lerp(matRef.current.uAlpha, 0, 0.1);
      } else {
        meshRef.current.position.lerp(basePosition, 0.1);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, angle, 0.1);
        
        meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, viewport.width * 0.15, 0.1);
        meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, viewport.height * 0.6, 0.1);
        
        matRef.current.uIsActive = THREE.MathUtils.lerp(matRef.current.uIsActive, 0, 0.1);
        matRef.current.uScrollOffset = THREE.MathUtils.lerp(matRef.current.uScrollOffset, Math.abs(scrollVelocity.current), 0.1);
        matRef.current.uAlpha = THREE.MathUtils.lerp(matRef.current.uAlpha, 1, 0.1);
      }
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={basePosition}
        rotation={[0, angle, 0]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveProject(isActive ? null : index);
          gsap.to("body", { 
            backgroundColor: isActive ? "#0a0a0a" : project.color, 
            duration: 0.8, 
            ease: "power3.inOut" 
          });
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <planeGeometry args={[1, 1, 32, 32]} />
        <projectMaterial ref={matRef} uTexture={texture} transparent />
      </mesh>
      
      {isActive && (
        <Html center zIndexRange={[100, 0]} className="pointer-events-none w-screen h-screen">
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <motion.h1 
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 0.9, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-[12vw] font-black uppercase tracking-tighter leading-none text-white mix-blend-overlay text-center px-4"
                style={{ textShadow: '0px 10px 30px rgba(0,0,0,0.5)' }}
              >
                {project.title}
              </motion.h1>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 max-w-xl text-xl text-white/80 text-center drop-shadow-lg"
              >
                {project.description}
              </motion.p>
              
              {project.link && (
                <motion.a 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  href={project.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="mt-8 px-8 py-4 border border-white/50 bg-black/20 backdrop-blur-md rounded-full text-white uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all pointer-events-auto"
                >
                  Ver Projeto
                </motion.a>
              )}
              
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute top-12 right-12 text-white font-bold uppercase tracking-widest pointer-events-auto hover:opacity-50 transition-opacity drop-shadow-md"
                onClick={(e: any) => {
                  e.stopPropagation();
                  setActiveProject(null);
                  gsap.to("body", { backgroundColor: "#0a0a0a", duration: 0.8 });
                }}
              >
                [ Fechar ]
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </Html>
      )}
    </group>
  );
}

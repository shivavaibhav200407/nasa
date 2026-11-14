import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';

export default function CameraController({
  screenState, // 'landing' | 'split' | 'zoom'
  currentPlanet,
  isMobile = false,
  onTransitionComplete
}) {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const timelineRef = useRef(null);
  const lookTargetRef = useRef(new THREE.Vector3(0, -1.2, 0));

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // GSAP Camera Sequences
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (onTransitionComplete) onTransitionComplete();
      }
    });
    timelineRef.current = tl;

    if (screenState === 'landing') {
      // Screen 1: Landing composition - camera looks at bottom horizon
      tl.to(camera.position, {
        x: 0,
        y: 0.5,
        z: 9.8,
        duration: 1.4,
        ease: 'power3.inOut'
      }, 0);

      tl.to(lookTargetRef.current, {
        x: 0,
        y: -1.2,
        z: 0,
        duration: 1.4,
        ease: 'power3.inOut'
      }, 0);
    } else if (screenState === 'split') {
      // Screen 2: Split information layout - planet on right side
      const camX = isMobile ? 0 : 0.6;
      const camY = isMobile ? 1.2 : 0.1;
      const camZ = isMobile ? 9.5 : 8.2;
      const targetX = isMobile ? 0 : 2.5;
      const targetY = isMobile ? 1.2 : 0.0;

      tl.to(camera.position, {
        x: camX,
        y: camY,
        z: camZ,
        duration: 1.4,
        ease: 'power3.inOut'
      }, 0);

      tl.to(lookTargetRef.current, {
        x: targetX,
        y: targetY,
        z: 0,
        duration: 1.4,
        ease: 'power3.inOut'
      }, 0);
    } else if (screenState === 'zoom') {
      // Screen 3: Cinematic Surface Zoom - planet fills the entire viewport!
      const targetX = isMobile ? 0 : 2.3;
      const targetY = isMobile ? 0.8 : 0.1;
      const camX = isMobile ? 0 : 2.1;
      const camY = isMobile ? 1.0 : 0.3;
      const camZ = isMobile ? 4.8 : 3.9;

      tl.to(camera.position, {
        x: camX,
        y: camY,
        z: camZ,
        duration: 1.8,
        ease: 'power3.inOut'
      }, 0);

      tl.to(lookTargetRef.current, {
        x: targetX,
        y: targetY,
        z: 0,
        duration: 1.8,
        ease: 'power3.inOut'
      }, 0);
    }

    return () => {
      if (tl) tl.kill();
    };
  }, [screenState, currentPlanet?.id, isMobile]);

  // Frame update for gentle mouse parallax
  useFrame(() => {
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

    // Damp parallax during zoom
    const factor = screenState === 'zoom' ? 0.015 : 0.04;
    camera.position.x += mouseRef.current.x * factor;
    camera.position.y += mouseRef.current.y * factor * 0.6;
    camera.lookAt(lookTargetRef.current);
  });

  return null;
}

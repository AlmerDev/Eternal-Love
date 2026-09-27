import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  Heart,
  RefreshCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
} from 'lucide-react';
import { Photo } from '../../types/database';

interface PhotoExhibition3DProps {
  photos: Photo[];
}

export const PhotoExhibition3D: React.FC<PhotoExhibition3DProps> = ({ photos }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  // References to communicate with Three.js animation and event loop
  const rotateControlsRef = useRef<{
    rotateX: (delta: number) => void;
    rotateY: (delta: number) => void;
    resetAngles: () => void;
    zoom: (delta: number) => void;
  } | null>(null);

  // Filter 3D exhibition photos exclusively
  const exhibitionPhotos =
    photos.filter((p) => p.category === '3d_exhibition').length > 0
      ? photos.filter((p) => p.category === '3d_exhibition')
      : photos;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf4f0); // Aged parchment background
    scene.fog = new THREE.FogExp2(0xfaf4f0, 0.035);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Warm Vintage Lighting
    const ambientLight = new THREE.AmbientLight(0xfffdf9, 1.25);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xf9e2e7, 1.9);
    directionalLight.position.set(5, 8, 6);
    scene.add(directionalLight);

    const warmPointLight = new THREE.PointLight(0xc89d66, 1.6, 22);
    warmPointLight.position.set(0, 3, 3);
    scene.add(warmPointLight);

    const softFillLight = new THREE.DirectionalLight(0xfffdf9, 1.0);
    softFillLight.position.set(-5, -3, -5);
    scene.add(softFillLight);

    // Group for all floating photo frames
    const galleryGroup = new THREE.Group();
    scene.add(galleryGroup);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    // -------------------------------------------------------------
    // Build 3D Photo Frames (Facing OUTWARDS towards viewer)
    // -------------------------------------------------------------
    const frameMeshes: Array<{
      mesh: THREE.Group;
      initialY: number;
      speed: number;
      photo: Photo;
    }> = [];

    const numPhotos = Math.min(exhibitionPhotos.length, 10);
    const radius = 5.2;

    for (let i = 0; i < numPhotos; i++) {
      const photo = exhibitionPhotos[i];
      const angle = (i / numPhotos) * Math.PI * 2;

      const frameGroup = new THREE.Group();
      frameGroup.position.x = Math.sin(angle) * radius;
      frameGroup.position.z = Math.cos(angle) * radius;
      frameGroup.position.y = Math.sin(i * 1.5) * 0.35;

      // CRITICAL FIX: Make the frame face OUTWARD towards the user/camera (not backwards)!
      frameGroup.rotation.y = angle;

      // Wooden / Rose Gold Frame Backing
      const frameGeometry = new THREE.BoxGeometry(2.25, 2.75, 0.14);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0xd8a7b1,
        roughness: 0.38,
        metalness: 0.28,
      });
      const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
      frameGroup.add(frameMesh);

      // Cream Paper Matte - Front
      const matteGeometry = new THREE.PlaneGeometry(1.98, 2.48);
      const matteMaterial = new THREE.MeshStandardMaterial({
        color: 0xfffdf9,
        roughness: 0.75,
      });
      const matteMeshFront = new THREE.Mesh(matteGeometry, matteMaterial);
      matteMeshFront.position.z = 0.075;
      frameGroup.add(matteMeshFront);

      // Cream Paper Matte - Back
      const matteMeshBack = new THREE.Mesh(matteGeometry, matteMaterial);
      matteMeshBack.position.z = -0.075;
      matteMeshBack.rotation.y = Math.PI;
      frameGroup.add(matteMeshBack);

      // Photo Canvas Texture Material
      const photoGeometry = new THREE.PlaneGeometry(1.75, 1.85);
      const photoMaterial = new THREE.MeshBasicMaterial({
        color: 0xf9e2e7,
        side: THREE.FrontSide,
      });

      textureLoader.load(
        photo.image_url,
        (loadedTex) => {
          loadedTex.colorSpace = THREE.SRGBColorSpace;
          photoMaterial.map = loadedTex;
          photoMaterial.color.set(0xffffff);
          photoMaterial.needsUpdate = true;
        },
        undefined,
        () => {
          photoMaterial.color.set(0xf9e2e7);
        }
      );

      // Front Photo Plane
      const photoMeshFront = new THREE.Mesh(photoGeometry, photoMaterial);
      photoMeshFront.position.set(0, 0.2, 0.085);
      frameGroup.add(photoMeshFront);

      // Back Photo Plane (Double-sided view so it never turns blank or backwards!)
      const photoMeshBack = new THREE.Mesh(photoGeometry, photoMaterial);
      photoMeshBack.position.set(0, 0.2, -0.085);
      photoMeshBack.rotation.y = Math.PI;
      frameGroup.add(photoMeshBack);

      galleryGroup.add(frameGroup);
      frameMeshes.push({
        mesh: frameGroup,
        initialY: frameGroup.position.y,
        speed: 0.8 + (i % 3) * 0.2,
        photo,
      });
    }

    // -------------------------------------------------------------
    // Romantic Falling Pink Rose Petals Particle System
    // -------------------------------------------------------------
    const petalCount = 75;
    const petalGeometry = new THREE.PlaneGeometry(0.18, 0.25);
    const petalMaterial = new THREE.MeshStandardMaterial({
      color: 0xf3ccd5,
      side: THREE.DoubleSide,
      roughness: 0.6,
    });

    const petals: Array<{
      mesh: THREE.Mesh;
      rotSpeedX: number;
      rotSpeedY: number;
      fallSpeed: number;
      swayOffset: number;
    }> = [];

    for (let i = 0; i < petalCount; i++) {
      const petal = new THREE.Mesh(petalGeometry, petalMaterial);
      petal.position.set(
        (Math.random() - 0.5) * 15,
        Math.random() * 10 - 2,
        (Math.random() - 0.5) * 15
      );
      petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      scene.add(petal);

      petals.push({
        mesh: petal,
        rotSpeedX: (Math.random() - 0.5) * 0.035,
        rotSpeedY: (Math.random() - 0.5) * 0.035,
        fallSpeed: 0.016 + Math.random() * 0.02,
        swayOffset: Math.random() * Math.PI * 2,
      });
    }

    // -------------------------------------------------------------
    // Interactive 2-Axis Rotation (X and Y) with Touch & Mouse
    // -------------------------------------------------------------
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let autoRotate = true;

    // Provide programmatic control methods
    rotateControlsRef.current = {
      rotateY: (delta: number) => {
        galleryGroup.rotation.y += delta;
      },
      rotateX: (delta: number) => {
        const nextX = galleryGroup.rotation.x + delta;
        galleryGroup.rotation.x = Math.max(-0.65, Math.min(0.65, nextX));
      },
      resetAngles: () => {
        galleryGroup.rotation.y = 0;
        galleryGroup.rotation.x = 0;
        camera.position.set(0, 0, 9);
      },
      zoom: (delta: number) => {
        camera.position.z = Math.max(5.5, Math.min(13, camera.position.z + delta));
      },
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
      autoRotate = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;

      // Rotate Y axis (horizontal yaw)
      galleryGroup.rotation.y += deltaX * 0.007;

      // Rotate X axis (vertical pitch) with smooth clamp
      const nextX = galleryGroup.rotation.x + deltaY * 0.005;
      galleryGroup.rotation.x = Math.max(-0.65, Math.min(0.65, nextX));

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
      setTimeout(() => {
        autoRotate = true;
      }, 4000);
    };

    // Touch events for Mobile Phones & Tablets
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging = true;
        previousMouseX = e.touches[0].clientX;
        previousMouseY = e.touches[0].clientY;
        autoRotate = false;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - previousMouseX;
      const deltaY = e.touches[0].clientY - previousMouseY;

      // Rotate Y axis (horizontal)
      galleryGroup.rotation.y += deltaX * 0.009;

      // Rotate X axis (vertical)
      const nextX = galleryGroup.rotation.x + deltaY * 0.007;
      galleryGroup.rotation.x = Math.max(-0.65, Math.min(0.65, nextX));

      previousMouseX = e.touches[0].clientX;
      previousMouseY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isDragging = false;
      setTimeout(() => {
        autoRotate = true;
      }, 4000);
    };

    // Mouse Wheel Zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(5.5, Math.min(13, camera.position.z + e.deltaY * 0.006));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('wheel', onWheel, { passive: false });

    // Raycaster for frame clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(galleryGroup.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj.parent !== galleryGroup) {
          obj = obj.parent;
        }
        if (obj) {
          const matched = frameMeshes.find((f) => f.mesh === obj);
          if (matched) {
            setSelectedPhoto(matched.photo);
          }
        }
      }
    };

    container.addEventListener('click', onClick);

    // -------------------------------------------------------------
    // Animation Loop
    // -------------------------------------------------------------
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Carousel auto rotation around Y axis
      if (autoRotate && isRotating) {
        galleryGroup.rotation.y += 0.004;
      }

      // Gentle floating bobbing for each frame
      frameMeshes.forEach((item, index) => {
        item.mesh.position.y =
          item.initialY + Math.sin(elapsedTime * item.speed + index) * 0.12;
      });

      // Falling rose petals animation
      petals.forEach((p) => {
        p.mesh.position.y -= p.fallSpeed;
        p.mesh.position.x += Math.sin(elapsedTime + p.swayOffset) * 0.008;
        p.mesh.rotation.x += p.rotSpeedX;
        p.mesh.rotation.y += p.rotSpeedY;

        // Reset if fallen below ground
        if (p.mesh.position.y < -3.5) {
          p.mesh.position.y = 7;
          p.mesh.position.x = (Math.random() - 0.5) * 15;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [exhibitionPhotos, isRotating]);

  return (
    <section id="exhibition-3d" className="relative my-16 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-xs font-semibold text-[#6B2D39] mb-3">
          <Sparkles className="w-4 h-4 text-[#C89D66]" />
          <span>Three.js Spatial Memory Exhibition</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#4A1E28]">
          Galeri 3D &amp; Kelopak Mawar Gugur
        </h2>
        <p className="mt-2 text-base font-cormorant text-[#6B2D39] italic font-medium">
          Bingkai foto kini selalu menghadap ke arahmu. Geser bebas pada sumbu horizontal (Y) dan vertikal (X) untuk melihat setiap sudut kenangan Ciyan &amp; Daffa.
        </p>
      </div>

      {/* 3D Canvas Box Container */}
      <div className="relative scrapbook-card p-3 sm:p-5 max-w-5xl mx-auto overflow-hidden bg-[#FAF4F0]">
        <div className="scrapbook-tape" />
        <div className="absolute top-3 right-4 scrapbook-pin" />

        {/* 3D Interactive Canvas */}
        <div
          ref={mountRef}
          className="w-full h-[460px] sm:h-[560px] rounded-xl overflow-hidden border-2 border-[#D8A7B1] cursor-grab active:cursor-grabbing relative select-none"
        />

        {/* Top Right Zoom Controls */}
        <div className="absolute top-6 right-6 flex flex-col gap-1.5 z-20">
          <button
            type="button"
            onClick={() => rotateControlsRef.current?.zoom(-1)}
            className="w-9 h-9 rounded-full bg-[#FFFDF9] hover:bg-[#F9E2E7] border border-[#D8A7B1] shadow-md flex items-center justify-center text-[#6B2D39] transition cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => rotateControlsRef.current?.zoom(1)}
            className="w-9 h-9 rounded-full bg-[#FFFDF9] hover:bg-[#F9E2E7] border border-[#D8A7B1] shadow-md flex items-center justify-center text-[#6B2D39] transition cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Floating Control Bar (2-Axis Sumbu X & Y + Auto Rotate) */}
        <div className="absolute bottom-5 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-20">
          {/* Compass / Directional Nav Pad */}
          <div className="pointer-events-auto bg-[#FFFDF9] border border-[#D8A7B1] p-1.5 rounded-2xl shadow-md flex items-center gap-1">
            <span className="text-[10px] font-mono font-bold text-[#6B2D39] px-2 hidden sm:inline">
              Sumbu X &bull; Y:
            </span>
            <button
              type="button"
              onClick={() => rotateControlsRef.current?.rotateX(-0.15)}
              className="p-1.5 rounded-lg bg-[#FAF4F0] hover:bg-[#F9E2E7] text-[#6B2D39] transition cursor-pointer"
              title="Putar Atas (Sumbu X)"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => rotateControlsRef.current?.rotateX(0.15)}
              className="p-1.5 rounded-lg bg-[#FAF4F0] hover:bg-[#F9E2E7] text-[#6B2D39] transition cursor-pointer"
              title="Putar Bawah (Sumbu X)"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => rotateControlsRef.current?.rotateY(0.25)}
              className="p-1.5 rounded-lg bg-[#FAF4F0] hover:bg-[#F9E2E7] text-[#6B2D39] transition cursor-pointer"
              title="Putar Kiri (Sumbu Y)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => rotateControlsRef.current?.rotateY(-0.25)}
              className="p-1.5 rounded-lg bg-[#FAF4F0] hover:bg-[#F9E2E7] text-[#6B2D39] transition cursor-pointer"
              title="Putar Kanan (Sumbu Y)"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => rotateControlsRef.current?.resetAngles()}
              className="p-1.5 rounded-lg bg-[#FAF4F0] hover:bg-[#F9E2E7] text-[#6B2D39] transition cursor-pointer ml-1"
              title="Reset Sudut Pandang Awal"
            >
              <Compass className="w-3.5 h-3.5 text-[#C89D66]" />
            </button>
          </div>

          {/* Auto Rotation & Drag Note */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRotating((prev) => !prev)}
              className="bg-[#FFFDF9] hover:bg-[#F9E2E7] border border-[#D8A7B1] px-3.5 py-1.5 rounded-full shadow-md text-xs font-serif font-semibold text-[#6B2D39] flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-[#6B2D39]" />
              <span>{isRotating ? 'Jeda Putaran' : 'Lanjutkan Putaran'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Popup when clicking a 3D Photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A1E28]/60"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative w-full max-w-md scrapbook-card p-6 bg-[#FFFDF9] border-2 border-[#D8A7B1] text-[#4A1E28] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="scrapbook-tape" />
            <div className="overflow-hidden rounded-xl border-2 border-[#D8A7B1] mb-4 aspect-square bg-[#FAF4F0]">
              <img
                src={selectedPhoto.image_url}
                alt={selectedPhoto.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F9E2E7] border border-[#D8A7B1] text-[#6B2D39] mb-2">
              <Heart className="w-3.5 h-3.5 text-[#C89D66]" />
              <span>{selectedPhoto.date}</span>
            </div>
            <h3 className="font-serif font-bold text-xl text-[#4A1E28] mb-1">
              {selectedPhoto.title}
            </h3>
            <p className="font-cormorant text-sm text-[#4A1E28]/90 font-medium">
              {selectedPhoto.caption}
            </p>
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#6B2D39] hover:bg-[#4A1E28] text-[#FFFDF9] font-serif font-semibold text-sm transition cursor-pointer shadow-sm"
            >
              Tutup Bingkai
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
export default PhotoExhibition3D;

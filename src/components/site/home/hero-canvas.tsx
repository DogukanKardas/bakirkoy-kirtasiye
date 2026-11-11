"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import {
  Physics,
  RigidBody,
  CuboidCollider,
  CapsuleCollider,
  BallCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import * as THREE from "three";

/* Kâğıt & Mürekkep paleti */
const COLORS = {
  paper: "#f3efe6",
  ink: "#151515",
  yellow: "#f2c14e",
  red: "#c2483a",
  blue: "#2b50c8",
  green: "#3d7a4f",
  eraserWhite: "#f5f2ea",
  wood: "#dcae7e",
  metal: "#c9c7c2",
  cover: "#8a2f24",
};

const FLOOR_Y = -3;

type Vec3 = [number, number, number];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** Kalem: capsule gövde + koni uç (Y ekseni) */
function Pen({
  position,
  color,
  rotation = [0, 0, 0] as Vec3,
}: {
  position: Vec3;
  color: string;
  rotation?: Vec3;
}) {
  return (
    <RigidBody
      colliders={false}
      position={position}
      rotation={rotation}
      restitution={0.35}
      friction={0.85}
      angularDamping={0.25}
      linearDamping={0.05}
    >
      <CapsuleCollider args={[0.85, 0.115]} />
      <mesh>
        <capsuleGeometry args={[0.115, 1.7, 6, 14]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh position={[0, -1.08, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.105, 0.42, 14]} />
        <meshStandardMaterial color={COLORS.ink} roughness={0.35} />
      </mesh>
    </RigidBody>
  );
}

/** Silgi: gövde + renkli bant */
function Eraser({ position, band }: { position: Vec3; band: string }) {
  return (
    <RigidBody
      colliders={false}
      position={position}
      restitution={0.3}
      friction={1}
      angularDamping={0.4}
    >
      <CuboidCollider args={[0.55, 0.2, 0.32]} />
      <mesh>
        <boxGeometry args={[1.1, 0.4, 0.64]} />
        <meshStandardMaterial color={COLORS.eraserWhite} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.5, 0.42, 0.66]} />
        <meshStandardMaterial color={band} roughness={0.55} />
      </mesh>
    </RigidBody>
  );
}

/** Defter: kapak + sayfa bloğu */
function Notebook({ position, cover }: { position: Vec3; cover: string }) {
  return (
    <RigidBody
      colliders={false}
      position={position}
      restitution={0.25}
      friction={1}
      angularDamping={0.45}
    >
      <CuboidCollider args={[0.85, 0.11, 1.15]} />
      <mesh>
        <boxGeometry args={[1.7, 0.16, 2.3]} />
        <meshStandardMaterial color={COLORS.eraserWhite} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.74, 0.05, 2.34]} />
        <meshStandardMaterial color={cover} roughness={0.55} />
      </mesh>
      <mesh position={[-0.86, 0.1, 0]}>
        <boxGeometry args={[0.09, 0.06, 2.34]} />
        <meshStandardMaterial color={COLORS.ink} roughness={0.4} />
      </mesh>
    </RigidBody>
  );
}

/** Cetvel: uzun ince kutu + işaret çizgileri */
function Ruler({ position }: { position: Vec3 }) {
  const ticks = useMemo(
    () => Array.from({ length: 11 }, (_, i) => -1.05 + i * 0.21),
    [],
  );
  return (
    <RigidBody
      colliders={false}
      position={position}
      restitution={0.3}
      friction={0.9}
      angularDamping={0.3}
    >
      <CuboidCollider args={[1.25, 0.035, 0.18]} />
      <mesh>
        <boxGeometry args={[2.5, 0.07, 0.36]} />
        <meshStandardMaterial color={COLORS.wood} roughness={0.6} />
      </mesh>
      {ticks.map((x, i) => (
        <mesh key={i} position={[x, 0.037, 0]}>
          <boxGeometry args={[0.014, 0.004, i % 5 === 0 ? 0.3 : 0.18]} />
          <meshStandardMaterial color={COLORS.ink} roughness={0.5} />
        </mesh>
      ))}
    </RigidBody>
  );
}

/** Ataş: metal torus */
function Clip({ position }: { position: Vec3 }) {
  return (
    <RigidBody
      colliders={false}
      position={position}
      restitution={0.45}
      friction={0.6}
      angularDamping={0.2}
    >
      <BallCollider args={[0.3]} />
      <mesh>
        <torusGeometry args={[0.26, 0.055, 10, 22]} />
        <meshStandardMaterial
          color={COLORS.metal}
          metalness={0.75}
          roughness={0.3}
        />
      </mesh>
    </RigidBody>
  );
}

/** İmleçle iten görünmez kinematik küre (pointer-events kapalı canvas'ta manuel raycast) */
function Pusher() {
  const body = useRef<RapierRigidBody>(null);
  const pointer = useRef({ x: 0, y: 0, active: false });
  const { camera } = useThree();
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), -(FLOOR_Y + 0.6)),
    [],
  );
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!body.current) return;
    if (!pointer.current.active) {
      body.current.setNextKinematicTranslation({ x: 0, y: -60, z: 0 });
      return;
    }
    raycaster.setFromCamera(
      new THREE.Vector2(pointer.current.x, pointer.current.y),
      camera,
    );
    if (raycaster.ray.intersectPlane(plane, hit)) {
      body.current.setNextKinematicTranslation({
        x: hit.x,
        y: FLOOR_Y + 0.9,
        z: THREE.MathUtils.clamp(hit.z, -4.5, 4.5),
      });
    }
  });

  return (
    <>
      <RigidBody
        ref={body}
        type="kinematicPosition"
        colliders={false}
        position={[0, -60, 0]}
      >
        <BallCollider args={[1.15]} />
      </RigidBody>
      <PointerTracker pointer={pointer} />
    </>
  );
}

function PointerTracker({
  pointer,
}: {
  pointer: React.MutableRefObject<{ x: number; y: number; active: boolean }>;
}) {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = document.querySelector<HTMLElement>("[data-hero-stage]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      const inside =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;
      pointer.current = {
        x: ((e.clientX - r.left) / r.width) * 2 - 1,
        y: -(((e.clientY - r.top) / r.height) * 2 - 1),
        active: inside,
      };
    };
    const onLeave = () => {
      pointer.current.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [pointer]);
  return null;
}

export default function HeroCanvas() {
  const objects = useMemo(
    () => ({
      pens: [
        { position: [rand(-4, 0), rand(7, 10), rand(-2, 2)] as Vec3, color: COLORS.yellow, rotation: [rand(0, 3), rand(0, 3), rand(0, 3)] as Vec3 },
        { position: [rand(1, 4), rand(9, 12), rand(-2, 2)] as Vec3, color: COLORS.red, rotation: [rand(0, 3), rand(0, 3), rand(0, 3)] as Vec3 },
        { position: [rand(-2, 2), rand(11, 14), rand(-3, 1)] as Vec3, color: COLORS.green, rotation: [rand(0, 3), rand(0, 3), rand(0, 3)] as Vec3 },
      ],
      erasers: [
        { position: [rand(-3, 3), rand(8, 11), rand(-2, 2)] as Vec3, band: COLORS.blue },
        { position: [rand(-5, -1), rand(10, 13), rand(-1, 3)] as Vec3, band: COLORS.red },
      ],
      notebooks: [
        { position: [rand(-1, 2), rand(12, 15), rand(-2, 2)] as Vec3, cover: COLORS.cover },
        { position: [rand(3, 5), rand(8, 10), rand(-3, 0)] as Vec3, cover: COLORS.blue },
      ],
      clips: [
        { position: [rand(-4, 4), rand(9, 13), rand(-2, 2)] as Vec3 },
        { position: [rand(-4, 4), rand(11, 15), rand(-2, 2)] as Vec3 },
      ],
      ruler: { position: [rand(-2, 2), rand(10, 12), rand(-2, 2)] as Vec3 },
    }),
    [],
  );

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 4.6, 13.5], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={1.15} />
      <directionalLight position={[5, 9, 7]} intensity={1.3} />
      <directionalLight position={[-6, 4, -4]} intensity={0.35} />

      <Physics gravity={[0, -16, 0]}>
        {/* zemin + görünmez duvarlar */}
        <CuboidCollider args={[14, 0.5, 10]} position={[0, FLOOR_Y - 0.5, 0]} friction={1} />
        <CuboidCollider args={[0.5, 12, 10]} position={[-8.4, 3, 0]} />
        <CuboidCollider args={[0.5, 12, 10]} position={[8.4, 3, 0]} />
        <CuboidCollider args={[14, 12, 0.5]} position={[0, 3, -5.6]} />
        <CuboidCollider args={[14, 12, 0.5]} position={[0, 3, 5.6]} />

        {objects.pens.map((p, i) => (
          <Pen key={`p${i}`} {...p} />
        ))}
        {objects.erasers.map((e, i) => (
          <Eraser key={`e${i}`} {...e} />
        ))}
        {objects.notebooks.map((n, i) => (
          <Notebook key={`n${i}`} {...n} />
        ))}
        {objects.clips.map((c, i) => (
          <Clip key={`c${i}`} {...c} />
        ))}
        <Ruler {...objects.ruler} />

        <Pusher />
      </Physics>

      <ContactShadows
        position={[0, FLOOR_Y + 0.01, 0]}
        opacity={0.32}
        scale={26}
        blur={2.6}
        far={5}
        resolution={512}
        color="#3a3527"
        frames={Infinity}
      />
    </Canvas>
  );
}

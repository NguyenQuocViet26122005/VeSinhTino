import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Plane, Vector3, DoubleSide, type Group } from 'three';
import { useMemo, useRef, useEffect, type RefObject, type ReactNode } from 'react';
type MotionProps={progress:RefObject<number>; redraw:RefObject<()=>void>};
function WindowModel({progress,redraw,children}:{children?:ReactNode}&MotionProps){
 const squeegee=useRef<Group>(null);const invalidate=useThree(s=>s.invalidate);
 const clip=useMemo(()=>new Plane(new Vector3(1,0,0),0),[]);
 useEffect(()=>{redraw.current=invalidate;invalidate();return()=>{redraw.current=()=>{};};},[invalidate,redraw]);
 useFrame(()=>{const x=-1.5+progress.current/100*3;clip.constant=-x;if(squeegee.current)squeegee.current.position.x=x;});
 return <group>{children}
 <ambientLight intensity={1.1}/><directionalLight position={[4,5,4]} intensity={2}/><directionalLight position={[-3,1,1]} color="#c7edff" intensity={.7}/>
 <group position={[0,0,0]}>
 <mesh position={[0,0,-.2]}><boxGeometry args={[3.2,3.7,.12]}/><meshStandardMaterial color="#d1e5f1" roughness={.7}/></mesh>
 <mesh position={[0,-1.05,-.11]}><planeGeometry args={[3,1.4]}/><meshStandardMaterial color="#abc5d6"/></mesh>
 <mesh position={[-.85,-.65,-.03]}><cylinderGeometry args={[.28,.21,.4,24]}/><meshStandardMaterial color="#e7dfca"/></mesh>
 {[0,1,2,3,4].map(i=><mesh key={i} position={[-.85+(i-2)*.12,-.24+Math.sin(i)*.16,-.03]} rotation={[0,0,(i-2)*.42]} scale={[.13,.48,.045]}><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color={i%2?'#497a47':'#70925a'}/></mesh>)}
 <mesh position={[.6,-.68,-.03]}><boxGeometry args={[.9,.6,.07]}/><meshStandardMaterial color="#f1ede0"/></mesh>
 <mesh position={[0,0,.06]}><planeGeometry args={[3,3.5]}/><meshPhysicalMaterial color="#d7edfa" transparent opacity={.17} roughness={.05} metalness={.2} side={DoubleSide}/></mesh>
 <mesh position={[0,0,.09]}><planeGeometry args={[3,3.5]}/><meshStandardMaterial color="#8395a8" transparent opacity={.78} roughness={1} clippingPlanes={[clip]} side={DoubleSide}/></mesh>
 {[-1.57,1.57].map(a=><mesh key={a} position={[a,0,.13]}><boxGeometry args={[.13,3.72,.18]}/><meshStandardMaterial color="#eaf1e5" metalness={.45} roughness={.25}/></mesh>)}
 {[-1.8,1.8].map(a=><mesh key={a} position={[0,a,.13]}><boxGeometry args={[3.26,.13,.18]}/><meshStandardMaterial color="#eaf1e5" metalness={.45} roughness={.25}/></mesh>)}
 <mesh position={[0,0,.01]}><boxGeometry args={[.05,3.5,.06]}/><meshStandardMaterial color="#f3f6ed"/></mesh><mesh position={[0,0,.01]}><boxGeometry args={[3,.05,.06]}/><meshStandardMaterial color="#f3f6ed"/></mesh>
 <group ref={squeegee} position={[-1.5+progress.current/100*3,0,.34]}><mesh><boxGeometry args={[.13,3.35,.16]}/><meshStandardMaterial color="#2a3b33" metalness={.3} roughness={.5}/></mesh><mesh position={[.07,0,-.09]}><boxGeometry args={[.04,3.32,.05]}/><meshStandardMaterial color="#0e211a"/></mesh><mesh position={[0,-.1,.32]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.08,.1,.65,16]}/><meshStandardMaterial color="#a9e7f5" roughness={.5}/></mesh></group>
 </group>
 </group>;
}
export default function GlassScene({progress,redraw,onError}:MotionProps&{onError:()=>void}){return <Canvas frameloop="demand" dpr={[1,1.5]} camera={{position:[3,1.8,6.5],fov:38}} gl={{antialias:true,alpha:true,powerPreference:"low-power"}} onCreated={({gl})=>{gl.localClippingEnabled=true;gl.domElement.addEventListener("webglcontextlost",e=>{e.preventDefault();onError();},{once:true});}} fallback={<p>Không thể hiển thị mô hình 3D trên thiết bị này.</p>}><WindowModel progress={progress} redraw={redraw}/></Canvas>;}

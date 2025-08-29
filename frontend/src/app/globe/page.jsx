'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useSearchParams } from 'next/navigation';
import axios from 'axios'; // Import axios

// ✅ Create a pre-configured axios instance with the base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
});

const IPLocatorPage = () => {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [ipInfo, setIpInfo] = useState(null);
  const [isPinned, setIsPinned] = useState(false); 

  const searchParams = useSearchParams();
  const ipFromParams = searchParams.get('ip');

  useEffect(() => {
    if (!mountRef.current) return;

    let scene, camera, renderer, earth, clouds, controls;
    let animationFrameId;
    
    let isMarkerCurrentlyPinned = false; 
    let markerLat = 0;
    let markerLng = 0;
    let markerPosition = new THREE.Vector3();

    const latLongToVector3 = (lat, lon, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    const animateCameraToTarget = (lat, lng, onComplete) => {
      if (!controls || !camera) return;
      
      const targetPos = latLongToVector3(lat, lng, 20);
      const startPos = camera.position.clone();
      const duration = 2000;
      let startTime = null;
      const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const step = timestamp => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = easeInOutCubic(progress);
        camera.position.lerpVectors(startPos, targetPos, eased);
        controls.target.set(0, 0, 0);
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          if (onComplete) onComplete();
        }
      };
      animationFrameId = requestAnimationFrame(step);
    };
    
    const updatePinPosition = () => {
        if (!isMarkerCurrentlyPinned || !camera || !mountRef.current || !earth) return;
        const pin = document.getElementById('location-pin');
        if (!pin) return;
        
        const position = latLongToVector3(markerLat, markerLng, 10);
        
        const earthQuaternion = new THREE.Quaternion();
        earth.getWorldQuaternion(earthQuaternion);
        
        position.applyQuaternion(earthQuaternion);
        markerPosition.copy(position);
        
        const projected = position.clone().project(camera);
        
        const cameraToPin = new THREE.Vector3().subVectors(position, camera.position).normalize();
        const cameraToEarthCenter = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), camera.position).normalize();
        const dotProduct = cameraToPin.dot(cameraToEarthCenter);
        const isVisible = dotProduct > 0;
        
        if (!isVisible || projected.z > 1) {
            pin.style.display = 'none';
        } else {
            const x = (projected.x + 1) * mountRef.current.clientWidth / 2;
            const y = (-projected.y + 1) * mountRef.current.clientHeight / 2;
            pin.style.left = `${x}px`;
            pin.style.top = `${y}px`;
            pin.style.display = 'block';
        }
    };

    const searchIp = async ip => {
      if (!ip) {
        setError('No IP address provided.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      setIpInfo(null);
      isMarkerCurrentlyPinned = false;

      try {
        // ✅ CHANGED: Using axios instance to make the API call.
        const response = await apiClient.get(`/api/ip-info/${ip}`);
        const data = response.data; // With axios, the data is directly on the .data property

        if (data.bogon) {
            throw new Error('This is a private or reserved IP address.');
        }

        if (!data.loc) {
            throw new Error('Location data not available for this IP.');
        }

        const [lat, lng] = data.loc.split(',').map(Number);
        markerLat = lat;
        markerLng = lng;
        const currentIpInfo = { ...data, lat, lng };
        setIpInfo(currentIpInfo);
        setIsPinned(true);
        
        markerPosition.copy(latLongToVector3(lat, lng, 10));

        animateCameraToTarget(lat, lng, () => {
            isMarkerCurrentlyPinned = true;
        });

      } catch (err) {
        // Axios provides more detailed error info
        const message = err.response?.data?.error || err.message;
        setError(message);
        setIsPinned(false);
      } finally {
        setIsLoading(false);
      }
    };

    const resetGlobe = () => {
      setIsPinned(false);
      isMarkerCurrentlyPinned = false; 
      setIpInfo(null);
      const pin = document.getElementById('location-pin');
      if (pin) pin.style.display = 'none';
      animateCameraToTarget(20, 0, null);
    };

    mountRef.current.resetGlobe = resetGlobe;

    const init = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
      camera.position.z = 30;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      mountRef.current.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xcccccc, 0.5));
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
      directionalLight.position.set(5, 3, 5);
      scene.add(directionalLight);
      
      const textureLoader = new THREE.TextureLoader();
      const loadTexture = url => new Promise(resolve => textureLoader.load(url, resolve));

      Promise.all([
        loadTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'),
        loadTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg'),
        loadTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png')
      ]).then(([earthTexture, specularTexture, cloudsTexture]) => {
        const earthGeometry = new THREE.SphereGeometry(10, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture, specularMap: specularTexture, shininess: 5 });
        earth = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earth);

        const cloudsGeometry = new THREE.SphereGeometry(10.15, 64, 64);
        const cloudsMaterial = new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true, opacity: 0.4 });
        clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
        scene.add(clouds);

        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        for (let i = 0; i < 10000; i++) starVertices.push((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000);
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
        scene.add(new THREE.Points(starGeometry, starMaterial));

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 15;
        controls.maxDistance = 50;
        controls.enablePan = false;
        
        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
          if (!isMarkerCurrentlyPinned) {
            earth.rotation.y += 0.0005;
            clouds.rotation.y += 0.0006;
          }
          controls.update();
          renderer.render(scene, camera);
          updatePinPosition();
        };
        animate();
        searchIp(ipFromParams || '8.8.8.8');
      });

      const handleResize = () => {
        if (!mountRef.current) return;
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    };

    init();
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [ipFromParams]);

  const handleResetClick = () => mountRef.current?.resetGlobe();
  const openGoogleMaps = () => ipInfo && window.open(`http://maps.google.com/maps?q=${ipInfo.lat},${ipInfo.lng}`, '_blank');

  return (
    <>
      <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0" />
      
      <div id="location-pin" className="location-pin">
        <div className="pin-body" onClick={openGoogleMaps}>
            <div className="pin-dot"></div>
        </div>
        <div className="pin-shadow"></div>
      </div>

      {isLoading && <div className="ui-element loading-indicator">Locating IP...</div>}
      {error && <div className="ui-element error-box">{error}</div>}
      {ipInfo && (
        <div className="ui-element location-info">
          <h3>LOCATION DETAILS</h3>
          <p><strong>IP:</strong> {ipInfo.ip}</p>
          <p><strong>Location:</strong> {ipInfo.city}, {ipInfo.region}, {ipInfo.country}</p>
          <p><strong>Timezone:</strong> {ipInfo.timezone}</p>
          <p><strong>ISP:</strong> {ipInfo.org}</p>
          <button onClick={openGoogleMaps} className="maps-btn">Open in Google Maps</button>
        </div>
      )}
   
      
      <style jsx global>{`
        body { overflow: hidden; background: #000; color: white; }
        .ui-element { position: absolute; top: 20px; left: 20px; z-index: 10; backdrop-filter: blur(10px); padding: 20px; border-radius: 8px; }
        .location-info { font-family: 'Roboto Mono', 'Courier New', monospace; background: rgba(0, 20, 0, 0.6); border: 1px solid #00ff41; color: #00ff41; box-shadow: 0 0 25px rgba(0, 255, 65, 0.3), inset 0 0 10px rgba(0, 255, 65, 0.2); }
        .location-info h3 { margin-top: 0; font-weight: bold; letter-spacing: 2px; border-bottom: 1px solid rgba(0, 255, 65, 0.5); padding-bottom: 10px; margin-bottom: 15px; text-shadow: 0 0 5px #00ff41; }
        .location-info strong { color: #ffffff; font-weight: normal; }
        .maps-btn { background: rgba(0, 255, 65, 0.8); color: #000; border: none; padding: 10px 15px; margin-top: 15px; cursor: pointer; font-weight: bold; border-radius: 4px; transition: all 0.2s ease; font-family: 'Roboto Mono', 'Courier New', monospace; }
        .maps-btn:hover { background: #fff; box-shadow: 0 0 15px #00ff41; }
        .error-box { background: rgba(255, 50, 50, 0.8); border: 1px solid #ff0000; }
        .loading-indicator { background: rgba(0, 0, 0, 0.7); border: 1px solid #888; }
        .reset-btn { position: absolute; top: 20px; right: 20px; z-index: 10; background: rgba(0,0,0,0.5); border: 1px solid #888; color: white; padding: 8px 15px; border-radius: 5px; cursor: pointer; transition: all 0.2s ease; }
        .reset-btn:hover { background: #fff; color: #000; }
        
        .location-pin {
            position: absolute;
            width: 50px;
            height: 50px;
            z-index: 5;
            pointer-events: none;
            transform: translate(-50%, -100%);
            display: none;
            animation: pin-drop 0.5s ease-out forwards;
        }
        @keyframes pin-drop {
            from { transform: translate(-50%, -200%) scale(1.5); opacity: 0; }
            to { transform: translate(-50%, -100%) scale(1); opacity: 1; }
        }
        .pin-body {
            position: relative;
            width: 30px;
            height: 30px;
            background: #DB4437;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            margin: 10px;
            pointer-events: all;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .pin-body:hover {
            transform: rotate(-45deg) scale(1.1);
        }
        .pin-dot {
            width: 8px;
            height: 8px;
            background: #A52714;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        .pin-shadow {
            width: 14px;
            height: 5px;
            background: rgba(0,0,0,0.3);
            border-radius: 50%;
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            animation: shadow-pulse 1.5s infinite ease-in-out;
        }
        @keyframes shadow-pulse {
            0%, 100% { transform: translateX(-50%) scale(1); }
            50% { transform: translateX(-50%) scale(0.8); }
        }
      `}</style>
    </>
  );
};

const IPLocatorPageWrapper = () => (
    <React.Suspense fallback={<div style={{color: 'white', textAlign: 'center', paddingTop: '20px'}}>Loading IP Data...</div>}>
        <IPLocatorPage />
    </React.Suspense>
);

export default IPLocatorPageWrapper;
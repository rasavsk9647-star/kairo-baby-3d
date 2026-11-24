import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  uniform float uBreath;
  uniform float uChubby;
  uniform vec3 uHeadRot;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // 2.5D head, cheek & nose depth relief
    vec2 centered = (uv - vec2(0.5, 0.52)) * vec2(1.12, 0.98);
    float dome = max(0.0, 1.0 - dot(centered, centered) * 2.9);

    vec2 cL = (uv - vec2(0.32, 0.40)) / vec2(0.14, 0.12);
    vec2 cR = (uv - vec2(0.68, 0.40)) / vec2(0.14, 0.12);
    float cheekBump = max(0.0, 1.0 - dot(cL, cL)) + max(0.0, 1.0 - dot(cR, cR));

    vec2 nC = (uv - vec2(0.50, 0.43)) / vec2(0.075, 0.065);
    float noseBump = max(0.0, 1.0 - dot(nC, nC));

    pos.z += dome * 0.36 + cheekBump * 0.08 * uChubby + noseBump * 0.12;
    pos.z += sin(uBreath) * 0.01 * dome;

    // Human-like neck-anchored head rotation:
    // Collar & sweater shoulders (uv.y < 0.19) stay stationary; ONLY the head rotates!
    float headMask = smoothstep(0.18, 0.30, uv.y);
    vec3 pivot = vec3(0.0, -0.70, -0.05);
    vec3 p = pos - pivot;

    float rx = uHeadRot.x * headMask;
    float ry = uHeadRot.y * headMask;
    float rz = uHeadRot.z * headMask;

    // Yaw (Y)
    float cy = cos(ry), sy = sin(ry);
    p = vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);

    // Pitch (X)
    float cx = cos(rx), sx = sin(rx);
    p = vec3(p.x, p.y * cx - p.z * sx, p.y * sx + p.z * cx);

    // Subtle curiosity tilt (Z)
    float cz = cos(rz), sz = sin(rz);
    p = vec3(p.x * cz - p.y * sz, p.x * sz + p.y * cz, p.z);

    pos = p + pivot;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec2 vUv;

  uniform sampler2D uNeutralTex;
  uniform sampler2D uPrevTex;
  uniform sampler2D uCurrTex;
  uniform float uExprMix;

  uniform float uBlink;
  uniform float uChubby;
  uniform float uEyesOpen;
  uniform float uIrisRadius;
  uniform vec2 uLook;

  uniform vec2 uCheekPullL;
  uniform vec2 uCheekPullR;
  uniform vec2 uCurlPull;

  float ellipseMask(vec2 uv, vec2 center, vec2 radii, float feather) {
    vec2 d = (uv - center) / radii;
    float dist = length(d);
    return 1.0 - smoothstep(1.0 - feather, 1.0, dist);
  }

  vec2 applyChubby(vec2 uv, float amount) {
    vec2 cL = vec2(0.285, 0.395);
    vec2 cR = vec2(0.715, 0.395);
    float mL = ellipseMask(uv, cL, vec2(0.145, 0.115), 0.8);
    float mR = ellipseMask(uv, cR, vec2(0.145, 0.115), 0.8);
    mL *= smoothstep(0.47, 0.42, uv.y);
    mR *= smoothstep(0.47, 0.42, uv.y);

    vec2 outUv = uv;
    outUv -= (uv - cL) * (0.055 * amount * mL);
    outUv -= (uv - cR) * (0.055 * amount * mR);
    return outUv;
  }

  // Cleans the old iris into smooth sclera white first, then draws the rigid symmetrical iris from uNeutralTex cleanly on top!
  vec4 trackEye(sampler2D exprTex, sampler2D irisTex, vec2 uv, vec2 eyeCenter, vec2 scleraRadii, float irisR, vec2 gazeShift) {
    vec4 base = texture2D(exprTex, uv);

    float inBox = ellipseMask(uv, eyeCenter, scleraRadii, 0.18);
    float warmth = base.r - base.b;
    float isWarmSkin = smoothstep(0.032, 0.082, warmth);
    float isDarkLash = smoothstep(0.25, 0.12, base.r + base.g + base.b) * (1.0 - step(length(uv - eyeCenter), irisR * 1.08));
    float eyeInterior = inBox * (1.0 - isWarmSkin) * (1.0 - isDarkLash);

    if (eyeInterior < 0.02) {
      return base;
    }

    // Step 1: Clean sclera base (erases old iris + limbal ring completely so zero ghost edge remains)
    float distOld = length(uv - eyeCenter);
    float topShade = smoothstep(eyeCenter.y + 0.048, eyeCenter.y - 0.015, uv.y);
    vec3 scleraWhite = mix(vec3(0.83, 0.86, 0.91), vec3(0.96, 0.97, 0.99), topShade);
    float eraseOld = smoothstep(irisR * 1.16, irisR * 0.88, distOld);
    vec3 cleanEye = mix(base.rgb, scleraWhite, eraseOld);

    // Step 2: Composite symmetrical rigid iris + pupil + catchlights from uNeutralTex
    vec2 newIrisCenter = eyeCenter + gazeShift;
    float distNew = length(uv - newIrisCenter);
    if (distNew < irisR) {
      float feather = smoothstep(irisR, irisR * 0.84, distNew);
      vec2 irisSrcUv = eyeCenter + (uv - newIrisCenter);
      vec3 irisRgb = texture2D(irisTex, irisSrcUv).rgb;
      cleanEye = mix(cleanEye, irisRgb, feather);
    }

    return vec4(mix(base.rgb, cleanEye, eyeInterior), base.a);
  }

  void main() {
    vec2 uv = applyChubby(vUv, uChubby);

    // 1. Isolated Chubby Cheek Pinch & Pull
    float maskCheekL = ellipseMask(uv, vec2(0.30, 0.39), vec2(0.14, 0.11), 0.72);
    maskCheekL *= smoothstep(0.47, 0.42, uv.y) * smoothstep(0.455, 0.38, uv.x);
    uv -= uCheekPullL * maskCheekL * 0.11;

    float maskCheekR = ellipseMask(uv, vec2(0.70, 0.39), vec2(0.14, 0.11), 0.72);
    maskCheekR *= smoothstep(0.47, 0.42, uv.y) * smoothstep(0.545, 0.62, uv.x);
    uv -= uCheekPullR * maskCheekR * 0.11;

    // 2. Isolated Top Hair Curl Tug
    float maskCurl = ellipseMask(uv, vec2(0.505, 0.895), vec2(0.14, 0.115), 0.65);
    maskCurl *= smoothstep(0.79, 0.84, uv.y);
    uv -= uCurlPull * maskCurl * 0.12;

    // 3. Clean Natural Eye Blink
    vec2 eyeCenterL = vec2(0.386, 0.498);
    vec2 eyeCenterR = vec2(0.615, 0.499);
    vec2 uvBlinked = uv;
    if (uBlink > 0.01) {
      float eL = ellipseMask(uv, eyeCenterL, vec2(0.082, 0.052), 0.35);
      float eR = ellipseMask(uv, eyeCenterR, vec2(0.082, 0.052), 0.35);
      uvBlinked.y = mix(uvBlinked.y, eyeCenterL.y + (uvBlinked.y - eyeCenterL.y) / max(0.16, 1.0 - uBlink * 0.8), eL);
      uvBlinked.y = mix(uvBlinked.y, eyeCenterR.y + (uvBlinked.y - eyeCenterR.y) / max(0.16, 1.0 - uBlink * 0.8), eR);
    }

    // 4. Symmetrical Sclera-Safe Iris Tracking across both eyes
    vec2 gazeShift = uLook * vec2(0.015, 0.010) * uEyesOpen;

    vec4 prevCol = texture2D(uPrevTex, uvBlinked);
    vec4 currCol = texture2D(uCurrTex, uvBlinked);

    if (uEyesOpen > 0.05 && uBlink < 0.25) {
      vec4 currTrackedL = trackEye(uCurrTex, uNeutralTex, uvBlinked, eyeCenterL, vec2(0.072, 0.048), uIrisRadius, gazeShift);
      vec4 currTrackedR = trackEye(uCurrTex, uNeutralTex, uvBlinked, eyeCenterR, vec2(0.072, 0.048), uIrisRadius, gazeShift);
      currCol = uvBlinked.x < 0.5 ? currTrackedL : currTrackedR;
    }

    vec4 col = mix(prevCol, currCol, uExprMix);

    // Rosy cheek warmth when actively pinching
    float pinchL = length(uCheekPullL);
    float pinchR = length(uCheekPullR);
    if (pinchL > 0.01 || pinchR > 0.01) {
      float blushL = ellipseMask(uv, vec2(0.295, 0.402), vec2(0.105, 0.072), 0.85);
      float blushR = ellipseMask(uv, vec2(0.705, 0.402), vec2(0.105, 0.072), 0.85);
      float glow = blushL * pinchL * 0.65 + blushR * pinchR * 0.65;
      col.rgb = mix(col.rgb, vec3(1.0, 0.46, 0.58), clamp(glow * 0.45, 0.0, 0.45) * col.a);
    }

    if (col.a < 0.01) discard;
    gl_FragColor = col;
  }
`;

export default function BabyStage3D({ mood, isReady, onAssetsLoaded, onPinchComplete }) {
  const containerRef = useRef(null);
  const moodRef = useRef(mood);
  const isReadyRef = useRef(isReady);
  const onPinchRef = useRef(onPinchComplete);
  const onLoadedRef = useRef(onAssetsLoaded);

  const dragHintRef = useRef(null);
  const dragHintTextRef = useRef(null);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    isReadyRef.current = isReady;
  }, [isReady]);

  useEffect(() => {
    onPinchRef.current = onPinchComplete;
  }, [onPinchComplete]);

  useEffect(() => {
    onLoadedRef.current = onAssetsLoaded;
  }, [onAssetsLoaded]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 25);
    camera.position.set(0, 0.02, 5.5);

    const hemi = new THREE.HemisphereLight(0xffffff, 0xfbcfe8, 1.4);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff7fb, 1.7);
    key.position.set(2.4, 3.0, 3.8);
    scene.add(key);

    // Load all 6 expression textures & notify when ready
    const manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      onLoadedRef.current?.();
    };
    const loader = new THREE.TextureLoader(manager);
    const loadTex = (path) => {
      const t = loader.load(path);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };

    const textures = {
      neutral: loadTex('/assets/baby/neutral.png'),
      pout: loadTex('/assets/baby/pout.png'),
      giggle: loadTex('/assets/baby/giggle.png'),
      shocked: loadTex('/assets/baby/shocked.png'),
      sleepy: loadTex('/assets/baby/sleepy.png'),
      tantrum: loadTex('/assets/baby/tantrum.png')
    };

    const uniforms = {
      uNeutralTex: { value: textures.neutral },
      uPrevTex: { value: textures.neutral },
      uCurrTex: { value: textures.neutral },
      uExprMix: { value: 1.0 },
      uBlink: { value: 0.0 },
      uChubby: { value: 0.68 },
      uEyesOpen: { value: 1.0 },
      uIrisRadius: { value: 0.044 },
      uLook: { value: new THREE.Vector2(0, 0) },
      uHeadRot: { value: new THREE.Vector3(0, 0, 0) },
      uCheekPullL: { value: new THREE.Vector2(0, 0) },
      uCheekPullR: { value: new THREE.Vector2(0, 0) },
      uCurlPull: { value: new THREE.Vector2(0, 0) },
      uBreath: { value: 0.0 }
    };

    const characterGroup = new THREE.Group();
    // Start slightly below viewport so Kairo pops up cleanly from the bottom after loader finishes!
    characterGroup.position.set(0, -3.2, 0);
    characterGroup.scale.set(0.84, 0.84, 1);
    scene.add(characterGroup);

    const babyGeom = new THREE.PlaneGeometry(2.68, 2.68, 28, 28);
    const babyMat = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      transparent: true,
      depthWrite: true
    });
    const babyMesh = new THREE.Mesh(babyGeom, babyMat);
    characterGroup.add(babyMesh);

    // 6 lightweight pastel bubbles
    const floaters = [];
    const floaterColors = [0xffa6d1, 0x93c5fd, 0xfde68a, 0xfbcfe8, 0xbae6fd, 0xf9a8d4];
    const bubbleGeom = new THREE.SphereGeometry(0.075, 14, 12);
    for (let i = 0; i < 6; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: floaterColors[i],
        roughness: 0.25,
        metalness: 0.05,
        transparent: true,
        opacity: 0.78
      });
      const orb = new THREE.Mesh(bubbleGeom, mat);
      const side = i % 2 === 0 ? -1 : 1;
      const basePos = new THREE.Vector3(
        side * (1.22 + (i % 3) * 0.18),
        -0.35 + (i / 5) * 1.1,
        -0.25 + (i % 2) * 0.25
      );
      orb.position.copy(basePos);
      orb.scale.setScalar(0.75 + (i % 3) * 0.28);
      orb.userData = { basePos, phase: i * 1.1 };
      scene.add(orb);
      floaters.push(orb);
    }

    // Tantrum ear steam puffs
    const steamPuffs = [];
    const puffGeom = new THREE.SphereGeometry(0.095, 10, 8);
    for (let i = 0; i < 6; i++) {
      const puffMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const puff = new THREE.Mesh(puffGeom, puffMat);
      puff.userData = { side: i % 2 === 0 ? -1 : 1, phase: (i / 6) * Math.PI * 2 };
      characterGroup.add(puff);
      steamPuffs.push(puff);
    }

    // Giggle floating rosy heart-sparkles
    const sparklePuffs = [];
    const sparkleGeom = new THREE.OctahedronGeometry(0.065);
    for (let i = 0; i < 6; i++) {
      const sMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xff7eb3 : 0x7dd3fc,
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const sMesh = new THREE.Mesh(sparkleGeom, sMat);
      sMesh.userData = { side: i % 2 === 0 ? -1 : 1, phase: (i / 6) * Math.PI * 2 };
      characterGroup.add(sMesh);
      sparklePuffs.push(sMesh);
    }

    const syncExpression = (nextMood) => {
      const nextTex = textures[nextMood] || textures.neutral;
      uniforms.uPrevTex.value = uniforms.uCurrTex.value;
      uniforms.uCurrTex.value = nextTex;
      uniforms.uExprMix.value = 0.0;
      uniforms.uEyesOpen.value = nextMood === 'giggle' ? 0.0 : 1.0;
      uniforms.uIrisRadius.value = 0.044;

      gsap.to(uniforms.uExprMix, {
        value: 1.0,
        duration: 0.14,
        ease: 'power2.out',
        overwrite: true
      });

      const chubbyTarget = nextMood === 'pout' || nextMood === 'giggle' ? 0.85 : 0.65;
      gsap.to(uniforms.uChubby, {
        value: chubbyTarget,
        duration: 0.28,
        ease: 'power2.out',
        overwrite: true
      });

      // Unique expressive squash/pop per mood
      if (nextMood === 'shocked') {
        gsap.fromTo(
          characterGroup.scale,
          { x: 0.93, y: 1.07, z: 1 },
          { x: 1, y: 1, z: 1, duration: 0.45, ease: 'elastic.out(1.2, 0.4)', overwrite: true }
        );
      } else {
        gsap.fromTo(
          characterGroup.scale,
          { x: 1.05, y: 0.95, z: 1 },
          { x: 1, y: 1, z: 1, duration: 0.42, ease: 'elastic.out(1.1, 0.42)', overwrite: true }
        );
      }
    };

    let prevMood = moodRef.current;
    let entranceStarted = false;
    const entranceState = { yOffset: -3.25 };

    // Raycasting + Full-Window Mouse Tracking + Auto-Solve Cheek Drag
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();
    const lookTarget = new THREE.Vector2(0, 0);
    const dragStart = new THREE.Vector2();
    let activeZone = null;
    let dragDist = 0;
    let autoSolvedThisDrag = false;

    const getInteractiveZone = (uv) => {
      if (Math.hypot((uv.x - 0.30) / 0.145, (uv.y - 0.39) / 0.115) < 1.0) return 'cheekL';
      if (Math.hypot((uv.x - 0.70) / 0.145, (uv.y - 0.39) / 0.115) < 1.0) return 'cheekR';
      if (Math.hypot((uv.x - 0.505) / 0.15, (uv.y - 0.895) / 0.12) < 1.0) return 'curl';
      return null;
    };

    const setHint = (visible, x, y, text) => {
      const el = dragHintRef.current;
      const txtEl = dragHintTextRef.current;
      if (!el || !txtEl) return;
      el.hidden = !visible;
      if (visible) {
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        txtEl.textContent = text;
      }
    };

    const updateGlobalLook = (clientX, clientY) => {
      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      const nx = (clientX / vw) * 2 - 1;
      const ny = -(clientY / vh) * 2 + 1;
      lookTarget.set(THREE.MathUtils.clamp(nx, -1, 1), THREE.MathUtils.clamp(ny, -1, 1));

      const rect = renderer.domElement.getBoundingClientRect();
      pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const springBackZone = (zone) => {
      const targetVec =
        zone === 'cheekL'
          ? uniforms.uCheekPullL.value
          : zone === 'cheekR'
            ? uniforms.uCheekPullR.value
            : uniforms.uCurlPull.value;

      gsap.to(targetVec, {
        x: 0,
        y: 0,
        duration: 0.55,
        ease: 'elastic.out(1.2, 0.38)',
        overwrite: true
      });
    };

    const finishDrag = (e, triggerReaction) => {
      if (!activeZone) return;
      springBackZone(activeZone);
      if (triggerReaction) {
        onPinchRef.current?.(activeZone);
      }
      activeZone = null;
      dragDist = 0;
      renderer.domElement.style.cursor = 'default';
      setHint(false, 0, 0, '');
      if (e && renderer.domElement.hasPointerCapture?.(e.pointerId)) {
        renderer.domElement.releasePointerCapture(e.pointerId);
      }
    };

    const onWindowPointerMove = (e) => {
      updateGlobalLook(e.clientX, e.clientY);

      if (activeZone && !autoSolvedThisDrag) {
        const dx = THREE.MathUtils.clamp((e.clientX - dragStart.x) / 95, -0.75, 0.75);
        const dy = THREE.MathUtils.clamp(-(e.clientY - dragStart.y) / 95, -0.75, 0.75);
        dragDist = Math.hypot(dx, dy);

        if (activeZone === 'cheekL') uniforms.uCheekPullL.value.set(dx, dy);
        if (activeZone === 'cheekR') uniforms.uCheekPullR.value.set(dx, dy);
        if (activeZone === 'curl') uniforms.uCurlPull.value.set(dx, dy);

        if (dragDist >= 0.42) {
          autoSolvedThisDrag = true;
          finishDrag(e, true);
          return;
        }

        setHint(
          true,
          e.clientX,
          e.clientY,
          activeZone === 'curl' ? 'Tugging swirl…' : 'Squishing cheek…'
        );
        return;
      }

      raycaster.setFromCamera(pointerNDC, camera);
      const planeHits = raycaster.intersectObject(babyMesh, false);
      if (planeHits.length > 0 && planeHits[0].uv) {
        const zone = getInteractiveZone(planeHits[0].uv);
        if (zone) {
          renderer.domElement.style.cursor = 'grab';
          setHint(
            true,
            e.clientX,
            e.clientY,
            zone === 'curl' ? 'Tug top swirl' : 'Pinch chubby cheek'
          );
          return;
        }
      }

      renderer.domElement.style.cursor = 'default';
      setHint(false, 0, 0, '');
    };

    const onPointerDown = (e) => {
      updateGlobalLook(e.clientX, e.clientY);
      raycaster.setFromCamera(pointerNDC, camera);

      const planeHits = raycaster.intersectObject(babyMesh, false);
      if (planeHits.length > 0 && planeHits[0].uv) {
        const zone = getInteractiveZone(planeHits[0].uv);
        if (zone) {
          activeZone = zone;
          autoSolvedThisDrag = false;
          dragStart.set(e.clientX, e.clientY);
          dragDist = 0;
          renderer.domElement.style.cursor = 'grabbing';
          renderer.domElement.setPointerCapture(e.pointerId);
        }
      }
    };

    const onPointerUp = (e) => {
      if (autoSolvedThisDrag) {
        autoSolvedThisDrag = false;
        return;
      }
      finishDrag(e, dragDist > 0.08);
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let blinkTimer = 2.6;
    let blinkState = 0;
    let rafId = 0;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      // Trigger smooth rise from bottom when CuteLoader completes
      if (isReadyRef.current && !entranceStarted) {
        entranceStarted = true;
        gsap.to(entranceState, {
          yOffset: 0.05,
          duration: 0.95,
          ease: 'back.out(1.45)'
        });
        gsap.to(characterGroup.scale, {
          x: 1,
          y: 1,
          duration: 0.95,
          ease: 'back.out(1.45)'
        });
      }

      if (moodRef.current !== prevMood) {
        prevMood = moodRef.current;
        syncExpression(prevMood);
      }

      if (prevMood !== 'giggle') {
        blinkTimer -= dt;
        if (blinkTimer <= 0) {
          blinkState = 1;
          blinkTimer = 2.5 + Math.random() * 2.5;
        }
        if (blinkState > 0) {
          blinkState = Math.max(0, blinkState - dt * 9.0);
          uniforms.uBlink.value = Math.sin(blinkState * Math.PI);
        } else {
          uniforms.uBlink.value = 0;
        }
      } else {
        uniforms.uBlink.value = 0;
      }

      const smooth = 1 - Math.exp(-8 * dt);
      uniforms.uLook.value.lerp(lookTarget, smooth);
      uniforms.uBreath.value = elapsed * 2.1;

      const lx = uniforms.uLook.value.x;
      const ly = uniforms.uLook.value.y;

      // Expression-specific live head motion
      let extraPitch = 0;
      let extraTilt = 0;
      let extraBob = 0;

      if (prevMood === 'tantrum') {
        extraTilt = Math.sin(elapsed * 42) * 0.032;
      } else if (prevMood === 'giggle') {
        extraBob = Math.abs(Math.sin(elapsed * 9.5)) * 0.035;
        extraTilt = Math.sin(elapsed * 6.0) * 0.03;
      } else if (prevMood === 'sleepy') {
        extraPitch = 0.08 + Math.sin(elapsed * 1.4) * 0.03;
        extraTilt = Math.sin(elapsed * 1.2) * 0.05;
      } else if (prevMood === 'pout') {
        extraTilt = Math.sin(elapsed * 2.8) * 0.045;
      } else if (prevMood === 'shocked') {
        extraPitch = -0.07;
      }

      uniforms.uHeadRot.value.set(
        -ly * 0.16 + extraPitch,
        lx * 0.25,
        -lx * 0.075 + extraTilt
      );

      characterGroup.position.x = 0;
      characterGroup.position.y = entranceState.yOffset + Math.sin(elapsed * 2.0) * 0.014 + extraBob;

      for (const orb of floaters) {
        const p = elapsed * 1.1 + orb.userData.phase;
        orb.position.y = orb.userData.basePos.y + Math.sin(p) * 0.08;
        orb.position.x = orb.userData.basePos.x + Math.cos(p * 0.7) * 0.04;
      }

      const steamOn = prevMood === 'tantrum' ? 1 : 0;
      for (const puff of steamPuffs) {
        const cycle = ((elapsed * 1.4 + puff.userData.phase) % (Math.PI * 2)) / (Math.PI * 2);
        puff.position.set(puff.userData.side * (0.82 + cycle * 0.36), 0.08 + cycle * 0.56, 0.1);
        puff.scale.setScalar(0.55 + cycle * 1.0);
        puff.material.opacity = steamOn * Math.sin(cycle * Math.PI) * 0.72;
      }

      const giggleOn = prevMood === 'giggle' ? 1 : 0;
      for (const sp of sparklePuffs) {
        const cycle = ((elapsed * 1.6 + sp.userData.phase) % (Math.PI * 2)) / (Math.PI * 2);
        sp.position.set(sp.userData.side * (0.68 + cycle * 0.35), -0.1 + cycle * 0.65, 0.25);
        sp.rotation.y = elapsed * 3.0;
        sp.scale.setScalar(0.6 + Math.sin(cycle * Math.PI) * 0.6);
        sp.material.opacity = giggleOn * Math.sin(cycle * Math.PI) * 0.85;
      }

      renderer.render(scene, camera);
    };

    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onWindowPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      renderer.dispose();
      babyGeom.dispose();
      babyMat.dispose();
      bubbleGeom.dispose();
      puffGeom.dispose();
      sparkleGeom.dispose();
      Object.values(textures).forEach((t) => t.dispose());
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="relative h-full w-full" />

      <div
        ref={dragHintRef}
        hidden
        className="pointer-events-none fixed z-30 inline-flex translate-x-3.5 -translate-y-7 items-center gap-1.5 rounded-full border border-pink-200 bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-800 shadow-lg"
      >
        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-pink-500 to-sky-400" />
        <span ref={dragHintTextRef}>Pinch cheek</span>
      </div>
    </>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Point = { x: number; y: number };

const MIN_POINTS = 10;
const MIN_SIZE_PX = 60;
const CLOSED_RATIO = 0.35; // distancia inicio-fin <= 35% de la diagonal para considerarse "cerrado"
const SIMPLIFY_EPSILON_RATIO = 0.08;
const CORNER_ANGLE_DEG = 35;
const ARM_WINDOW_MS = 5000;

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function perpendicularDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return dist(p, a);
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  const proj = { x: a.x + t * dx, y: a.y + t * dy };
  return dist(p, proj);
}

/** Ramer-Douglas-Peucker: reduce el trazo a sus vértices importantes (quita el temblor de la mano). */
function simplify(points: Point[], epsilon: number): Point[] {
  if (points.length < 3) return points;
  let maxDist = 0;
  let index = 0;
  const start = points[0];
  const end = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], start, end);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist > epsilon) {
    const left = simplify(points.slice(0, index + 1), epsilon);
    const right = simplify(points.slice(index), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  return [start, end];
}

/** Ángulo con signo (grados) que gira de la dirección (a→b) a (b→c). Positivo = izquierda. */
function turnAngle(a: Point, b: Point, c: Point): number {
  const a1 = Math.atan2(b.y - a.y, b.x - a.x);
  const a2 = Math.atan2(c.y - b.y, c.x - b.x);
  let diff = ((a2 - a1) * 180) / Math.PI;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}

function boundingDiagonal(points: Point[]): number {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
}

/** ¿El trazo dibuja un triángulo? Forma cerrada (vuelve cerca de donde empezó) con ~3 esquinas marcadas. */
function looksLikeTriangle(points: Point[]): boolean {
  if (points.length < MIN_POINTS) return false;
  const diagonal = boundingDiagonal(points);
  if (diagonal < MIN_SIZE_PX) return false;
  if (dist(points[0], points[points.length - 1]) > diagonal * CLOSED_RATIO) return false;

  const simplified = simplify(points, diagonal * SIMPLIFY_EPSILON_RATIO);
  // El trazo ya vuelve cerca de donde empezó (se verificó arriba), así que
  // `simplified` ya es un lazo cerrado con el primer y último punto casi
  // iguales — se quita ese duplicado y los ángulos se calculan con índice
  // circular para sí contar bien la esquina que cruza el cierre del lazo.
  const vertices = simplified.slice(0, -1);
  const count = vertices.length;
  if (count < 3) return false;
  let corners = 0;
  let totalTurn = 0;
  for (let i = 0; i < count; i++) {
    const prev = vertices[(i - 1 + count) % count];
    const curr = vertices[i];
    const next = vertices[(i + 1) % count];
    const angle = turnAngle(prev, curr, next);
    totalTurn += angle;
    if (Math.abs(angle) > CORNER_ANGLE_DEG) corners++;
  }

  return corners >= 2 && corners <= 5 && Math.abs(totalTurn) > 200;
}

/** ¿El trazo dibuja una "S"? Abierto (no vuelve a donde empezó), curva y cambia de sentido a la mitad. */
function looksLikeS(points: Point[]): boolean {
  if (points.length < MIN_POINTS) return false;
  const diagonal = boundingDiagonal(points);
  if (diagonal < MIN_SIZE_PX) return false;
  if (dist(points[0], points[points.length - 1]) < diagonal * CLOSED_RATIO) return false;

  const simplified = simplify(points, diagonal * SIMPLIFY_EPSILON_RATIO);
  if (simplified.length < 4) return false;

  const mid = Math.floor(simplified.length / 2);
  let firstHalfTurn = 0;
  for (let i = 1; i < mid; i++) {
    firstHalfTurn += turnAngle(simplified[i - 1], simplified[i], simplified[i + 1]);
  }
  let secondHalfTurn = 0;
  for (let i = mid; i < simplified.length - 1; i++) {
    secondHalfTurn += turnAngle(simplified[i - 1], simplified[i], simplified[i + 1]);
  }

  const bothCurvedEnough = Math.abs(firstHalfTurn) > 40 && Math.abs(secondHalfTurn) > 40;
  const oppositeDirections = Math.sign(firstHalfTurn) !== Math.sign(secondHalfTurn);
  return bothCurvedEnough && oppositeDirections;
}

/**
 * Atajo oculto en la landing (pedido del usuario 2026-10-01): dibujar un
 * triángulo con el dedo y, en menos de 5s, una "S", lleva a
 * `/admin/login` — alternativa a escribir la URL a mano. La seguridad
 * real la sigue dando la contraseña de Supabase Auth en esa página, esto
 * es solo un atajo de navegación.
 *
 * El primer trazo (el triángulo) se analiza de forma pasiva, sin
 * `preventDefault`, así que el scroll normal de la landing nunca se
 * bloquea mientras tanto — cualquier scroll o swipe normal simplemente
 * no se parece a un triángulo cerrado y no activa nada. Sólo una vez que
 * YA se reconoció un triángulo se agrega, por 5s, un segundo listener de
 * `touchmove` que sí bloquea el scroll — para poder dibujar la "S" sin
 * que la página se mueva — y se quita de inmediato al soltar el dedo
 * (haya o no completado la "S") o al vencer los 5s.
 *
 * El reconocimiento es geometría simple (Ramer-Douglas-Peucker +
 * ángulos de giro), no un modelo de verdad — puede fallar según el
 * tamaño o la velocidad del trazo; los umbrales de arriba son el punto
 * de partida, puede hacer falta afinarlos probando en un celular real.
 */
export function AdminGestureListener() {
  const router = useRouter();

  useEffect(() => {
    let armed = false;
    let points: Point[] = [];
    let armTimeout: ReturnType<typeof setTimeout> | null = null;

    function blockScroll(event: TouchEvent) {
      if (event.touches.length === 1) event.preventDefault();
    }

    function arm() {
      armed = true;
      window.addEventListener("touchmove", blockScroll, { passive: false });
      armTimeout = setTimeout(disarm, ARM_WINDOW_MS);
    }

    function disarm() {
      armed = false;
      window.removeEventListener("touchmove", blockScroll);
      if (armTimeout) clearTimeout(armTimeout);
      armTimeout = null;
    }

    function handleTouchStart(event: TouchEvent) {
      if (event.touches.length !== 1) return;
      points = [{ x: event.touches[0].clientX, y: event.touches[0].clientY }];
    }

    function handleTouchMove(event: TouchEvent) {
      if (event.touches.length !== 1) return;
      points.push({ x: event.touches[0].clientX, y: event.touches[0].clientY });
    }

    function handleTouchEnd() {
      const strokePoints = points;
      points = [];

      if (!armed) {
        if (looksLikeTriangle(strokePoints)) arm();
        return;
      }

      disarm();
      if (looksLikeS(strokePoints)) router.push("/admin/login");
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      disarm();
    };
  }, [router]);

  return null;
}

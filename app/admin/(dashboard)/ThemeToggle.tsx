"use client";

import { useState } from "react";
import { MoonIcon, SunIcon } from "./Icons";

const COOKIE_NAME = "admin-theme";
const SHELL_ID = "admin-shell";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type Theme = "light" | "dark";

/**
 * Botón sol/luna en el header de /admin — solo el panel; el sitio público
 * sigue el tema del sistema. `initialTheme` lo lee `layout.tsx` de la
 * cookie `admin-theme` (server-side) para que el primer render ya traiga
 * el tema correcto, sin parpadeo ni warning de hidratación. Se pone
 * siempre explícito (`light` o `dark`) para que gane sobre el modo oscuro
 * del sistema.
 */
export function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.getElementById(SHELL_ID)?.setAttribute("data-theme", next);
    document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-brand-ink/70 transition-colors hover:bg-brand-sand hover:text-brand-ink"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { toggleTheme } from '@/lib/slices/themeSlice';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getUsername } from '@/lib/auth';

export function DashboardHeader() {
  const isDark = useAppSelector(state => state.theme.isDark);
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(getUsername() || 'User');
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-card border-b border-border h-16 flex items-center justify-between px-6 lg:pl-72">
      <div>
        <h2 className="text-lg font-semibold">Sucursal 1 - Yesid</h2>
        <p className="text-xs text-muted-foreground">Sistema de Administración</p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Bienvenido, <span className="font-semibold">{username}</span>
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleTheme())}
          title={isDark ? 'Modo claro' : 'Modo oscuro'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
      </div>
    </header>
  );
}

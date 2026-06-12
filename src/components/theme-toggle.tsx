'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/src/components/ui/button';

export function ThemeToggle() {
	const { setTheme, theme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button variant="ghost" size="icon" className="rounded-full w-9 h-9" disabled>
				<span className="sr-only">Toggle theme</span>
			</Button>
		);
	}

	const currentTheme = theme === 'system' ? resolvedTheme : theme;

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(currentTheme === 'light' ? 'dark' : 'light')}
			className="rounded-full w-9 h-9 border border-border/50 hover:bg-secondary/50 cursor-pointer"
		>
			<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Alternar tema</span>
		</Button>
	);
}

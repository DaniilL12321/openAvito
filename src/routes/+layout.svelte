<script lang="ts">
  import { onMount } from 'svelte';
  import '../lib/styles/theme.css';
  import Toasts from '$lib/components/Toasts.svelte';

  const colorSchemes = [
    { name: 'Голубая', primary: '217.2 91.2% 59.8%', accent: '215 27.9% 16.9%' },
    { name: 'Зелёная', primary: '142.1 76.2% 36.3%', accent: '143 47.9% 16.9%' },
    { name: 'Фиолетовая', primary: '262.1 83.3% 57.8%', accent: '263 47.9% 16.9%' },
    { name: 'Красная', primary: '346.8 77.2% 49.8%', accent: '345 47.9% 16.9%' },
    { name: 'Оранжевая', primary: '24.6 95% 53.1%', accent: '25 47.9% 16.9%' },
  ];

  onMount(() => {
    initializeSettings();
  });

  function initializeSettings() {
    const theme = localStorage.getItem('theme');
    const themeMode = localStorage.getItem('themeMode');
    
    if (themeMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }

    const savedScheme = localStorage.getItem('colorScheme');
    if (savedScheme === 'custom') {
      const customHue = Number(localStorage.getItem('customHue')) || 217;
      const customSaturation = Number(localStorage.getItem('customSaturation')) || 91;
      const customLightness = Number(localStorage.getItem('customLightness')) || 60;
      
      const customColor = `${customHue} ${customSaturation}% ${customLightness}%`;
      const customAccent = `${customHue} 47.9% 16.9%`;
      
      document.documentElement.style.setProperty('--primary', customColor);
      document.documentElement.style.setProperty('--accent', customAccent);
    } else {
      const scheme = colorSchemes.find(s => s.name === savedScheme) || colorSchemes[0];
      document.documentElement.style.setProperty('--primary', scheme.primary);
      document.documentElement.style.setProperty('--accent', scheme.accent);
    }
  }
</script>

<slot></slot>
<Toasts /> 
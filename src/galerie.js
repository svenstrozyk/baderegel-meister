// Entwickler-Galerie: alle Partner-Wassermonster mit Umschaltern (npx vite → /galerie.html)
import { mount } from 'svelte';
import Galerie from './lib/monster/Galerie.svelte';

mount(Galerie, { target: document.getElementById('galerie') });

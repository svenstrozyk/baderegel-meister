import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';
import { skalaBeobachten } from './lib/ui/masse.js';

skalaBeobachten();

export default mount(App, { target: document.getElementById('app') });

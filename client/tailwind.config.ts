// client/tailwind.config.ts
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
 content: ['./src/**/*.{js,jsx,ts,tsx}'],
 theme: {
   extend: {
     backgroundImage: {
       'hero-gradient': 'linear-gradient(135deg, #5d2cfe 0%, #7d36fc 20%, #a53eff 60%, #ff549e 100%)',
     },
     colors: {
       hero: {
         purple: {
           50: '#f5f3ff',
           100: '#ede9fe',
           500: '#5d2cfe',
           600: '#7d36fc',
           700: '#a53eff',
         },
         pink: {
           500: '#ff549e',
         }
       }
     }
   }
 },
 plugins: [
   plugin(function({ addComponents, theme }) {
     addComponents({
       '.hero-container': {
         background: theme('backgroundImage.hero-gradient'),
         backgroundAttachment: 'fixed',
         minHeight: '100vh',
         position: 'relative',
       },
       '.hero-card': {
         backgroundColor: 'rgba(255, 255, 255, 0.95)',
         backdropFilter: 'blur(12px)',
         borderRadius: theme('borderRadius.2xl'),
         boxShadow: theme('boxShadow.2xl'),
         padding: theme('spacing.8'),
         '@media (max-width: 640px)': {
           padding: theme('spacing.6'),
         }
       },
       '.hero-card-glass': {
         backgroundColor: 'rgba(255, 255, 255, 0.1)',
         backdropFilter: 'blur(16px)',
         border: '1px solid rgba(255, 255, 255, 0.2)',
         borderRadius: theme('borderRadius.2xl'),
         boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
       }
     })
   })
 ]
}

export default config;

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { createTheme } from '@mantine/core';
import { Analytics } from "@vercel/analytics/next"

import App from './App.tsx';

import '@mantine/core/styles/baseline.css';
import '@mantine/core/styles/default-css-variables.css';
import '@mantine/core/styles/global.css';

export const theme = createTheme({
  fontFamily: 'RobotoCondensed, Arial Narrow, Arial, sans-serif',
  black: '#454545',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <App />
      <Analytics />
    </MantineProvider>
  </StrictMode>,
);

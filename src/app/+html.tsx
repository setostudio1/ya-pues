import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import WebShell from '@/components/web/WebShell';

// Only the weights needed for the first paint; SemiBold loads on demand.
const FONT_FILES = ['Nunito-Regular', 'Nunito-Bold'];

// Web-only root HTML used for static rendering. Runs in Node, not in the browser.
// headNodes/bodyNodes carry the CSS, JS bundle and favicon that Expo injects (SDK 58+).
export default function Root({ children }: PropsWithChildren) {
  const { htmlAttributes, bodyAttributes, headNodes, bodyNodes } = useServerDocumentContext();

  return (
    <html {...htmlAttributes} lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Ya Pues</title>
        <meta name="description" content="Ya Pues: organiza tus tareas, comprométete con fechas límite y mantén tu racha semanal." />
        {FONT_FILES.map((file) => (
          <link key={file} rel="preload" href={`/fonts/${file}.woff2`} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        <WebShell />
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}

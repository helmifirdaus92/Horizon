/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const port = 5000;

app.use(express.json());

// Proxy SXA extensions
app.use(
  createProxyMiddleware({
    pathFilter: (path) => path.includes('/sxa/'),
    target: 'https://pages-staging.sitecore-staging.cloud',
    changeOrigin: true,
  }),
);

// Canvas script
const canvasUrl =
  process.env.LOCAL_CANVAS === 'true'
    ? 'http://localhost:4000'
    : 'https://pages-staging.sitecore-staging.cloud/horizon/canvas';
app.use(
  createProxyMiddleware({
    pathFilter: (path) => path.includes('/horizon.canvas.js'),
    target: canvasUrl,
    pathRewrite: { '^/horizon/canvas': '' },
    changeOrigin: true,
    ws: true,
    secure: false,
  }),
);

// Proxy main Horizon application to the local build
app.use(
  createProxyMiddleware({
    target: 'http://localhost:4200',
    changeOrigin: true,
    ws: true,
  }),
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cloud Agent

Install with `npm ci`. Start the app with `npm run dev` (port 3000). Open **http://localhost:3000**.

Next.js 16 blocks dev resources, including the hydration websocket, when the page is opened at `127.0.0.1`. Client components then stay on the server HTML and motion-driven sections look empty. Use `localhost`.

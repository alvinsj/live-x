# live-x 

This repo shows:
- Use of [comlink](https://github.com/GoogleChromeLabs/comlink) and web worker to offload Socket connection handling.
- Use of [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) to manage `setState` (or batch update) within max FPS. 

![live-x](https://user-images.githubusercontent.com/243186/188469993-56557e1b-a285-4af5-a6bc-44653e1b4a10.gif)

## Getting Started

First, install the dependencies:

```bash
yarn install
```

Define .env.localhost

```bash
# .env.local
NEXT_PUBLIC_BOOK_WS_URL=wss://www.cryptofacilities.com/ws/v1
```

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## More

Please refer to docs/README.md

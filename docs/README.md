# Development

## File structure

Files are organized:
- `pages/*`: entry pages
- `styles/*`: styles 
- `components/*`: react components
- `hooks/*`: react hooks
- `entities/*`: domain entities
- `services/*`: API services, analytics, error reporting etc
- `utils/*`: misc helpers
- `workers/*`: web worker

## CSS 

CSS is organized with `BEM` methodology.
In future, it can be improved with SASS adoption.

## WebSocket on Web Worker

With the help of Comlink library, WebSocket is handled in Web Worker thread. 
In future, event handling for WebSocket can be also be improved using RxJS or similar. 

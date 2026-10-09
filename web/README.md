# Phone Sale web

Angular 22, Optimus UI, OpenNG Icons and a shared light design system. See [the root README](../README.md) for startup and architecture.

```sh
npm start
npm test -- --watch=false
npm run build
```

Development runs at localhost:4300, proxying `/api/` to localhost:3210. Feature routes are lazy; shared API/authentication code lives in `core/`.

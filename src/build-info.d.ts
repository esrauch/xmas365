/** The commit the page's code came from (vite.config.ts, `buildInfo`). */
declare module 'virtual:build-info' {
  const info: { commit: string; dirty: boolean; builtAt: string };
  export default info;
}

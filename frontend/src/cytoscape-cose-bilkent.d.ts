declare module 'cytoscape-cose-bilkent' {
  import type { use } from 'cytoscape';
  const coseBilkent: Parameters<typeof use>[0];
  export default coseBilkent;
}

import NodeCache from "node-cache";

const globalCache = new NodeCache({
  stdTTL: 60 * 60, // one hour
});

export default globalCache;

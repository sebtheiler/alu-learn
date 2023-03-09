import {
  createTRPCProxyClient,
  createTRPCReact,
  httpBatchLink,
} from "@trpc/react-query";
import { AppRouter } from "../server/router";
import superjson from "superjson";
import { IpcRequest } from "../api";
import type {
  FetchEsque,
  RequestInitEsque,
} from "@trpc/client/dist/internals/types";

/**
 * Custom fetch implementation that sends the request over IPC to Main process
 */
export const trpcFetch: FetchEsque = async (
  input: RequestInfo | URL,
  init: RequestInit | RequestInitEsque | undefined
) => {
  const req: IpcRequest = {
    url:
      input instanceof URL
        ? input.toString()
        : typeof input === "string"
        ? input
        : input.url,
    method: input instanceof Request ? input.method : (init?.method as string),
    headers: input instanceof Request ? input.headers : init?.headers,
    body: input instanceof Request ? input.body : init?.body,
  };

  const resp = await window.appApi.trpc(req);

  return new Response(resp.body, {
    status: resp.status,
    headers: resp.headers,
  });
};

export const trpc = createTRPCReact<AppRouter>();

export const trpcNonReact = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: "/trpc",
      fetch: trpcFetch,
    }),
  ],
});

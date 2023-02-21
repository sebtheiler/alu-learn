import type { NextPageContext } from "next";
import type { ComponentType } from "react";

export type NextPage<P = Record<string, unknown>, IP = P> = ComponentType<P> & {
  getInitialProps?(context: NextPageContext): IP | Promise<IP>;
} & { authRequired?: boolean; proRequired?: boolean };

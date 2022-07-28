import type { NextPage as NextPageDefault } from "next";

export type NextPage = NextPageDefault & { authRequired?: boolean };

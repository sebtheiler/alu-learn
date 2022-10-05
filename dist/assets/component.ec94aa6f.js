import { T as u } from "./component.43b9f6c0.js";
import { a as l } from "./index.c10fd90b.js";
import "./transition.c2e320bc.js";

function n({ attributes: t, children: o, element: r }) {
  return l(u, {
    tooltip: l("a", {
      href: r.url,
      style: { color: "white" },
      target: "_blank",
      rel: "noreferrer",
      children:
        r.url.length > 50
          ? r.url.substring(0, 15) +
            "   ...   " +
            r.url.substring(r.url.length - 10, r.url.length)
          : r.url,
    }),
    className: "underline text-blue-300",
    children: l("a", {
      ...t,
      className: "underline text-blue-600 hover:text-blue-800",
      href: r.url,
      target: "_blank",
      rel: "noreferrer",
      children: o,
    }),
  });
}
export { n as default };

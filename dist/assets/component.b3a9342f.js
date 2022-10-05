import { u as F, T as g } from "./component.43b9f6c0.js";
import {
  r as c,
  j as u,
  a as t,
  c as f,
  l as k,
  F as y,
  o as w,
  m as E,
  R as N,
} from "./index.c10fd90b.js";
import { W as C } from "./transition.c2e320bc.js";

import { u as F, T as g } from "./component.43b9f6c0.js";
import { W as C } from "./transition.c2e320bc.js";
function b(s, i) {
  const r = s && ("current" in s ? s.current : s);
  c.exports.useEffect(() => {
    function e(o) {
      r && !r.contains(o.target) && i(o);
    }
    return (
      document.addEventListener("mousedown", e),
      () => {
        document.removeEventListener("mousedown", e);
      }
    );
  }, [s]);
}
function L({
  children: s,
  popover: i,
  className: r,
  placement: e = "top",
  trigger: o = "hover",
}) {
  const [n, a] = c.exports.useState(!1),
    [d, p] = c.exports.useState(),
    [l, h] = c.exports.useState(),
    { styles: x, attributes: v } = F(d, l, {
      placement: e,
      modifiers: [{ name: "offset", options: { offset: [0, 8] } }],
    }),
    m = c.exports.useMemo(() => {
      switch (o) {
        case "hover":
          return { onMouseEnter: () => a(!0), onMouseLeave: () => a(!1) };
        case "click":
          return { onClick: () => a(!0) };
      }
    }, [o]);
  return (
    b(l, () => {
      o === "click" && a(!1);
    }),
    u("div", {
      className: "inline",
      children: [
        t("span", { ref: p, ...m, children: s }),
        t(C, {
          show: n,
          enter: "ease-out duration-300",
          enterFrom: "opacity-0",
          enterTo: "opacity-100",
          leave: "ease-in duration-200",
          leaveFrom: "opacity-100",
          leaveTo: "opacity-0",
          className: "absolute",
          children: t("div", {
            ref: h,
            className: f(
              "border-4 border-alu-mid-gray bg-alu-light-gray                                 px-4 py-3 w-64 rounded-xl z-50",
              r
            ),
            style: x.popper,
            ...m,
            ...v.popper,
            children: i,
          }),
        }),
      ],
    })
  );
}
function P({ tooltip: s, onClick: i, faIcon: r, className: e, style: o }) {
  const [n, a] = c.exports.useState(!1),
    d = async (l) => {
      a(!0), await i(l), a(!1);
    },
    p = c.exports.useMemo(() => (n ? k : r), [n, r]);
  return t(g, {
    tooltip: s,
    children: t("span", {
      onClick: d,
      className: "cursor-pointer text-center",
      children: t(y, {
        icon: p,
        style: o,
        className: f(e, "mx-auto"),
        spin: n,
      }),
    }),
  });
}
function M({ attributes: s, children: i, element: r }) {
  const e = {},
    o = async (n) => {
      n.preventDefault(),
        window.open(
          `/deck/${e == null ? void 0 : e.parent_deck_id}/flashcards/${
            e == null ? void 0 : e.id
          }/edit/`,
          "_blank"
        );
    };
  return t(L, {
    popover: u("div", {
      children: [
        t("h3", {
          className: "text-md text-center font-bold",
          children: "Flashcard Preview",
        }),
        t("hr", { className: "my-3" }),
        (e == null ? void 0 : e.id) &&
          t(P, {
            tooltip: "Edit this flashcard",
            onClick: o,
            faIcon: w,
            className: "float-right",
          }),
        e != null && e.data
          ? e.data.fields.map((n, a) =>
              u(E, {
                children: [
                  t(N, { text: n }),
                  a !== e.data.fields.length - 1 && t("hr", {}),
                ],
              })
            )
          : t("p", { children: "Flashcard not found" }),
      ],
    }),
    children: t("span", { ...s, className: "flashcard-link", children: i }),
  });
}
export { M as default };

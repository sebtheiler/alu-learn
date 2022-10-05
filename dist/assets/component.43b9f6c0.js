import {
  r as F,
  k as dt,
  j as mt,
  a as Pe,
  c as ht,
} from "./index.c10fd90b.js";
import { W as yt } from "./transition.c2e320bc.js";

var qe = function (e) {
    return e.reduce(function (r, n) {
      var a = n[0],
        o = n[1];
      return (r[a] = o), r;
    }, {});
  },
  Ue =
    typeof window != "undefined" &&
    window.document &&
    window.document.createElement
      ? F.exports.useLayoutEffect
      : F.exports.useEffect,
  R = "top",
  C = "bottom",
  T = "right",
  D = "left",
  je = "auto",
  ue = [R, C, T, D],
  J = "start",
  se = "end",
  gt = "clippingParents",
  et = "viewport",
  ae = "popper",
  wt = "reference",
  ze = ue.reduce(function (t, e) {
    return t.concat([e + "-" + J, e + "-" + se]);
  }, []),
  tt = [].concat(ue, [je]).reduce(function (t, e) {
    return t.concat([e, e + "-" + J, e + "-" + se]);
  }, []),
  bt = "beforeRead",
  xt = "read",
  Ot = "afterRead",
  Et = "beforeMain",
  At = "main",
  Pt = "afterMain",
  St = "beforeWrite",
  jt = "write",
  Rt = "afterWrite",
  Dt = [bt, xt, Ot, Et, At, Pt, St, jt, Rt];
function N(t) {
  return t ? (t.nodeName || "").toLowerCase() : null;
}
function W(t) {
  if (t == null) return window;
  if (t.toString() !== "[object Window]") {
    var e = t.ownerDocument;
    return (e && e.defaultView) || window;
  }
  return t;
}
function K(t) {
  var e = W(t).Element;
  return t instanceof e || t instanceof Element;
}
function M(t) {
  var e = W(t).HTMLElement;
  return t instanceof e || t instanceof HTMLElement;
}
function Re(t) {
  if (typeof ShadowRoot == "undefined") return !1;
  var e = W(t).ShadowRoot;
  return t instanceof e || t instanceof ShadowRoot;
}
function Bt(t) {
  var e = t.state;
  Object.keys(e.elements).forEach(function (r) {
    var n = e.styles[r] || {},
      a = e.attributes[r] || {},
      o = e.elements[r];
    !M(o) ||
      !N(o) ||
      (Object.assign(o.style, n),
      Object.keys(a).forEach(function (i) {
        var s = a[i];
        s === !1 ? o.removeAttribute(i) : o.setAttribute(i, s === !0 ? "" : s);
      }));
  });
}
function $t(t) {
  var e = t.state,
    r = {
      popper: {
        position: e.options.strategy,
        left: "0",
        top: "0",
        margin: "0",
      },
      arrow: { position: "absolute" },
      reference: {},
    };
  return (
    Object.assign(e.elements.popper.style, r.popper),
    (e.styles = r),
    e.elements.arrow && Object.assign(e.elements.arrow.style, r.arrow),
    function () {
      Object.keys(e.elements).forEach(function (n) {
        var a = e.elements[n],
          o = e.attributes[n] || {},
          i = Object.keys(e.styles.hasOwnProperty(n) ? e.styles[n] : r[n]),
          s = i.reduce(function (f, p) {
            return (f[p] = ""), f;
          }, {});
        !M(a) ||
          !N(a) ||
          (Object.assign(a.style, s),
          Object.keys(o).forEach(function (f) {
            a.removeAttribute(f);
          }));
      });
    }
  );
}
var Mt = {
  name: "applyStyles",
  enabled: !0,
  phase: "write",
  fn: Bt,
  effect: $t,
  requires: ["computeStyles"],
};
function H(t) {
  return t.split("-")[0];
}
var Y = Math.max,
  we = Math.min,
  Q = Math.round;
function Z(t, e) {
  e === void 0 && (e = !1);
  var r = t.getBoundingClientRect(),
    n = 1,
    a = 1;
  if (M(t) && e) {
    var o = t.offsetHeight,
      i = t.offsetWidth;
    i > 0 && (n = Q(r.width) / i || 1), o > 0 && (a = Q(r.height) / o || 1);
  }
  return {
    width: r.width / n,
    height: r.height / a,
    top: r.top / a,
    right: r.right / n,
    bottom: r.bottom / a,
    left: r.left / n,
    x: r.left / n,
    y: r.top / a,
  };
}
function De(t) {
  var e = Z(t),
    r = t.offsetWidth,
    n = t.offsetHeight;
  return (
    Math.abs(e.width - r) <= 1 && (r = e.width),
    Math.abs(e.height - n) <= 1 && (n = e.height),
    { x: t.offsetLeft, y: t.offsetTop, width: r, height: n }
  );
}
function rt(t, e) {
  var r = e.getRootNode && e.getRootNode();
  if (t.contains(e)) return !0;
  if (r && Re(r)) {
    var n = e;
    do {
      if (n && t.isSameNode(n)) return !0;
      n = n.parentNode || n.host;
    } while (n);
  }
  return !1;
}
function V(t) {
  return W(t).getComputedStyle(t);
}
function Ct(t) {
  return ["table", "td", "th"].indexOf(N(t)) >= 0;
}
function q(t) {
  return ((K(t) ? t.ownerDocument : t.document) || window.document)
    .documentElement;
}
function be(t) {
  return N(t) === "html"
    ? t
    : t.assignedSlot || t.parentNode || (Re(t) ? t.host : null) || q(t);
}
function Xe(t) {
  return !M(t) || V(t).position === "fixed" ? null : t.offsetParent;
}
function Tt(t) {
  var e = navigator.userAgent.toLowerCase().indexOf("firefox") !== -1,
    r = navigator.userAgent.indexOf("Trident") !== -1;
  if (r && M(t)) {
    var n = V(t);
    if (n.position === "fixed") return null;
  }
  var a = be(t);
  for (Re(a) && (a = a.host); M(a) && ["html", "body"].indexOf(N(a)) < 0; ) {
    var o = V(a);
    if (
      o.transform !== "none" ||
      o.perspective !== "none" ||
      o.contain === "paint" ||
      ["transform", "perspective"].indexOf(o.willChange) !== -1 ||
      (e && o.willChange === "filter") ||
      (e && o.filter && o.filter !== "none")
    )
      return a;
    a = a.parentNode;
  }
  return null;
}
function pe(t) {
  for (var e = W(t), r = Xe(t); r && Ct(r) && V(r).position === "static"; )
    r = Xe(r);
  return r &&
    (N(r) === "html" || (N(r) === "body" && V(r).position === "static"))
    ? e
    : r || Tt(t) || e;
}
function Be(t) {
  return ["top", "bottom"].indexOf(t) >= 0 ? "x" : "y";
}
function oe(t, e, r) {
  return Y(t, we(e, r));
}
function Lt(t, e, r) {
  var n = oe(t, e, r);
  return n > r ? r : n;
}
function nt() {
  return { top: 0, right: 0, bottom: 0, left: 0 };
}
function at(t) {
  return Object.assign({}, nt(), t);
}
function ot(t, e) {
  return e.reduce(function (r, n) {
    return (r[n] = t), r;
  }, {});
}
var kt = function (e, r) {
  return (
    (e =
      typeof e == "function"
        ? e(Object.assign({}, r.rects, { placement: r.placement }))
        : e),
    at(typeof e != "number" ? e : ot(e, ue))
  );
};
function Wt(t) {
  var e,
    r = t.state,
    n = t.name,
    a = t.options,
    o = r.elements.arrow,
    i = r.modifiersData.popperOffsets,
    s = H(r.placement),
    f = Be(s),
    p = [D, T].indexOf(s) >= 0,
    u = p ? "height" : "width";
  if (!(!o || !i)) {
    var l = kt(a.padding, r),
      y = De(o),
      c = f === "y" ? R : D,
      h = f === "y" ? C : T,
      v =
        r.rects.reference[u] + r.rects.reference[f] - i[f] - r.rects.popper[u],
      d = i[f] - r.rects.reference[f],
      x = pe(o),
      O = x ? (f === "y" ? x.clientHeight || 0 : x.clientWidth || 0) : 0,
      E = v / 2 - d / 2,
      m = l[c],
      w = O - y[u] - l[h],
      g = O / 2 - y[u] / 2 + E,
      b = oe(m, g, w),
      A = f;
    r.modifiersData[n] = ((e = {}), (e[A] = b), (e.centerOffset = b - g), e);
  }
}
function Ft(t) {
  var e = t.state,
    r = t.options,
    n = r.element,
    a = n === void 0 ? "[data-popper-arrow]" : n;
  a != null &&
    ((typeof a == "string" && ((a = e.elements.popper.querySelector(a)), !a)) ||
      !rt(e.elements.popper, a) ||
      (e.elements.arrow = a));
}
var Ht = {
  name: "arrow",
  enabled: !0,
  phase: "main",
  fn: Wt,
  effect: Ft,
  requires: ["popperOffsets"],
  requiresIfExists: ["preventOverflow"],
};
function _(t) {
  return t.split("-")[1];
}
var Nt = { top: "auto", right: "auto", bottom: "auto", left: "auto" };
function Vt(t) {
  var e = t.x,
    r = t.y,
    n = window,
    a = n.devicePixelRatio || 1;
  return { x: Q(e * a) / a || 0, y: Q(r * a) / a || 0 };
}
function Ye(t) {
  var e,
    r = t.popper,
    n = t.popperRect,
    a = t.placement,
    o = t.variation,
    i = t.offsets,
    s = t.position,
    f = t.gpuAcceleration,
    p = t.adaptive,
    u = t.roundOffsets,
    l = t.isFixed,
    y = i.x,
    c = y === void 0 ? 0 : y,
    h = i.y,
    v = h === void 0 ? 0 : h,
    d = typeof u == "function" ? u({ x: c, y: v }) : { x: c, y: v };
  (c = d.x), (v = d.y);
  var x = i.hasOwnProperty("x"),
    O = i.hasOwnProperty("y"),
    E = D,
    m = R,
    w = window;
  if (p) {
    var g = pe(r),
      b = "clientHeight",
      A = "clientWidth";
    if (
      (g === W(r) &&
        ((g = q(r)),
        V(g).position !== "static" &&
          s === "absolute" &&
          ((b = "scrollHeight"), (A = "scrollWidth"))),
      (g = g),
      a === R || ((a === D || a === T) && o === se))
    ) {
      m = C;
      var j = l && g === w && w.visualViewport ? w.visualViewport.height : g[b];
      (v -= j - n.height), (v *= f ? 1 : -1);
    }
    if (a === D || ((a === R || a === C) && o === se)) {
      E = T;
      var P = l && g === w && w.visualViewport ? w.visualViewport.width : g[A];
      (c -= P - n.width), (c *= f ? 1 : -1);
    }
  }
  var S = Object.assign({ position: s }, p && Nt),
    L = u === !0 ? Vt({ x: c, y: v }) : { x: c, y: v };
  if (((c = L.x), (v = L.y), f)) {
    var B;
    return Object.assign(
      {},
      S,
      ((B = {}),
      (B[m] = O ? "0" : ""),
      (B[E] = x ? "0" : ""),
      (B.transform =
        (w.devicePixelRatio || 1) <= 1
          ? "translate(" + c + "px, " + v + "px)"
          : "translate3d(" + c + "px, " + v + "px, 0)"),
      B)
    );
  }
  return Object.assign(
    {},
    S,
    ((e = {}),
    (e[m] = O ? v + "px" : ""),
    (e[E] = x ? c + "px" : ""),
    (e.transform = ""),
    e)
  );
}
function It(t) {
  var e = t.state,
    r = t.options,
    n = r.gpuAcceleration,
    a = n === void 0 ? !0 : n,
    o = r.adaptive,
    i = o === void 0 ? !0 : o,
    s = r.roundOffsets,
    f = s === void 0 ? !0 : s,
    p = {
      placement: H(e.placement),
      variation: _(e.placement),
      popper: e.elements.popper,
      popperRect: e.rects.popper,
      gpuAcceleration: a,
      isFixed: e.options.strategy === "fixed",
    };
  e.modifiersData.popperOffsets != null &&
    (e.styles.popper = Object.assign(
      {},
      e.styles.popper,
      Ye(
        Object.assign({}, p, {
          offsets: e.modifiersData.popperOffsets,
          position: e.options.strategy,
          adaptive: i,
          roundOffsets: f,
        })
      )
    )),
    e.modifiersData.arrow != null &&
      (e.styles.arrow = Object.assign(
        {},
        e.styles.arrow,
        Ye(
          Object.assign({}, p, {
            offsets: e.modifiersData.arrow,
            position: "absolute",
            adaptive: !1,
            roundOffsets: f,
          })
        )
      )),
    (e.attributes.popper = Object.assign({}, e.attributes.popper, {
      "data-popper-placement": e.placement,
    }));
}
var qt = {
    name: "computeStyles",
    enabled: !0,
    phase: "beforeWrite",
    fn: It,
    data: {},
  },
  he = { passive: !0 };
function Ut(t) {
  var e = t.state,
    r = t.instance,
    n = t.options,
    a = n.scroll,
    o = a === void 0 ? !0 : a,
    i = n.resize,
    s = i === void 0 ? !0 : i,
    f = W(e.elements.popper),
    p = [].concat(e.scrollParents.reference, e.scrollParents.popper);
  return (
    o &&
      p.forEach(function (u) {
        u.addEventListener("scroll", r.update, he);
      }),
    s && f.addEventListener("resize", r.update, he),
    function () {
      o &&
        p.forEach(function (u) {
          u.removeEventListener("scroll", r.update, he);
        }),
        s && f.removeEventListener("resize", r.update, he);
    }
  );
}
var zt = {
    name: "eventListeners",
    enabled: !0,
    phase: "write",
    fn: function () {},
    effect: Ut,
    data: {},
  },
  Xt = { left: "right", right: "left", bottom: "top", top: "bottom" };
function ye(t) {
  return t.replace(/left|right|bottom|top/g, function (e) {
    return Xt[e];
  });
}
var Yt = { start: "end", end: "start" };
function Ge(t) {
  return t.replace(/start|end/g, function (e) {
    return Yt[e];
  });
}
function $e(t) {
  var e = W(t),
    r = e.pageXOffset,
    n = e.pageYOffset;
  return { scrollLeft: r, scrollTop: n };
}
function Me(t) {
  return Z(q(t)).left + $e(t).scrollLeft;
}
function Gt(t) {
  var e = W(t),
    r = q(t),
    n = e.visualViewport,
    a = r.clientWidth,
    o = r.clientHeight,
    i = 0,
    s = 0;
  return (
    n &&
      ((a = n.width),
      (o = n.height),
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
        ((i = n.offsetLeft), (s = n.offsetTop))),
    { width: a, height: o, x: i + Me(t), y: s }
  );
}
function Jt(t) {
  var e,
    r = q(t),
    n = $e(t),
    a = (e = t.ownerDocument) == null ? void 0 : e.body,
    o = Y(
      r.scrollWidth,
      r.clientWidth,
      a ? a.scrollWidth : 0,
      a ? a.clientWidth : 0
    ),
    i = Y(
      r.scrollHeight,
      r.clientHeight,
      a ? a.scrollHeight : 0,
      a ? a.clientHeight : 0
    ),
    s = -n.scrollLeft + Me(t),
    f = -n.scrollTop;
  return (
    V(a || r).direction === "rtl" &&
      (s += Y(r.clientWidth, a ? a.clientWidth : 0) - o),
    { width: o, height: i, x: s, y: f }
  );
}
function Ce(t) {
  var e = V(t),
    r = e.overflow,
    n = e.overflowX,
    a = e.overflowY;
  return /auto|scroll|overlay|hidden/.test(r + a + n);
}
function it(t) {
  return ["html", "body", "#document"].indexOf(N(t)) >= 0
    ? t.ownerDocument.body
    : M(t) && Ce(t)
    ? t
    : it(be(t));
}
function ie(t, e) {
  var r;
  e === void 0 && (e = []);
  var n = it(t),
    a = n === ((r = t.ownerDocument) == null ? void 0 : r.body),
    o = W(n),
    i = a ? [o].concat(o.visualViewport || [], Ce(n) ? n : []) : n,
    s = e.concat(i);
  return a ? s : s.concat(ie(be(i)));
}
function Se(t) {
  return Object.assign({}, t, {
    left: t.x,
    top: t.y,
    right: t.x + t.width,
    bottom: t.y + t.height,
  });
}
function Kt(t) {
  var e = Z(t);
  return (
    (e.top = e.top + t.clientTop),
    (e.left = e.left + t.clientLeft),
    (e.bottom = e.top + t.clientHeight),
    (e.right = e.left + t.clientWidth),
    (e.width = t.clientWidth),
    (e.height = t.clientHeight),
    (e.x = e.left),
    (e.y = e.top),
    e
  );
}
function Je(t, e) {
  return e === et ? Se(Gt(t)) : K(e) ? Kt(e) : Se(Jt(q(t)));
}
function Qt(t) {
  var e = ie(be(t)),
    r = ["absolute", "fixed"].indexOf(V(t).position) >= 0,
    n = r && M(t) ? pe(t) : t;
  return K(n)
    ? e.filter(function (a) {
        return K(a) && rt(a, n) && N(a) !== "body";
      })
    : [];
}
function Zt(t, e, r) {
  var n = e === "clippingParents" ? Qt(t) : [].concat(e),
    a = [].concat(n, [r]),
    o = a[0],
    i = a.reduce(function (s, f) {
      var p = Je(t, f);
      return (
        (s.top = Y(p.top, s.top)),
        (s.right = we(p.right, s.right)),
        (s.bottom = we(p.bottom, s.bottom)),
        (s.left = Y(p.left, s.left)),
        s
      );
    }, Je(t, o));
  return (
    (i.width = i.right - i.left),
    (i.height = i.bottom - i.top),
    (i.x = i.left),
    (i.y = i.top),
    i
  );
}
function st(t) {
  var e = t.reference,
    r = t.element,
    n = t.placement,
    a = n ? H(n) : null,
    o = n ? _(n) : null,
    i = e.x + e.width / 2 - r.width / 2,
    s = e.y + e.height / 2 - r.height / 2,
    f;
  switch (a) {
    case R:
      f = { x: i, y: e.y - r.height };
      break;
    case C:
      f = { x: i, y: e.y + e.height };
      break;
    case T:
      f = { x: e.x + e.width, y: s };
      break;
    case D:
      f = { x: e.x - r.width, y: s };
      break;
    default:
      f = { x: e.x, y: e.y };
  }
  var p = a ? Be(a) : null;
  if (p != null) {
    var u = p === "y" ? "height" : "width";
    switch (o) {
      case J:
        f[p] = f[p] - (e[u] / 2 - r[u] / 2);
        break;
      case se:
        f[p] = f[p] + (e[u] / 2 - r[u] / 2);
        break;
    }
  }
  return f;
}
function fe(t, e) {
  e === void 0 && (e = {});
  var r = e,
    n = r.placement,
    a = n === void 0 ? t.placement : n,
    o = r.boundary,
    i = o === void 0 ? gt : o,
    s = r.rootBoundary,
    f = s === void 0 ? et : s,
    p = r.elementContext,
    u = p === void 0 ? ae : p,
    l = r.altBoundary,
    y = l === void 0 ? !1 : l,
    c = r.padding,
    h = c === void 0 ? 0 : c,
    v = at(typeof h != "number" ? h : ot(h, ue)),
    d = u === ae ? wt : ae,
    x = t.rects.popper,
    O = t.elements[y ? d : u],
    E = Zt(K(O) ? O : O.contextElement || q(t.elements.popper), i, f),
    m = Z(t.elements.reference),
    w = st({ reference: m, element: x, strategy: "absolute", placement: a }),
    g = Se(Object.assign({}, x, w)),
    b = u === ae ? g : m,
    A = {
      top: E.top - b.top + v.top,
      bottom: b.bottom - E.bottom + v.bottom,
      left: E.left - b.left + v.left,
      right: b.right - E.right + v.right,
    },
    j = t.modifiersData.offset;
  if (u === ae && j) {
    var P = j[a];
    Object.keys(A).forEach(function (S) {
      var L = [T, C].indexOf(S) >= 0 ? 1 : -1,
        B = [R, C].indexOf(S) >= 0 ? "y" : "x";
      A[S] += P[B] * L;
    });
  }
  return A;
}
function _t(t, e) {
  e === void 0 && (e = {});
  var r = e,
    n = r.placement,
    a = r.boundary,
    o = r.rootBoundary,
    i = r.padding,
    s = r.flipVariations,
    f = r.allowedAutoPlacements,
    p = f === void 0 ? tt : f,
    u = _(n),
    l = u
      ? s
        ? ze
        : ze.filter(function (h) {
            return _(h) === u;
          })
      : ue,
    y = l.filter(function (h) {
      return p.indexOf(h) >= 0;
    });
  y.length === 0 && (y = l);
  var c = y.reduce(function (h, v) {
    return (
      (h[v] = fe(t, { placement: v, boundary: a, rootBoundary: o, padding: i })[
        H(v)
      ]),
      h
    );
  }, {});
  return Object.keys(c).sort(function (h, v) {
    return c[h] - c[v];
  });
}
function er(t) {
  if (H(t) === je) return [];
  var e = ye(t);
  return [Ge(t), e, Ge(e)];
}
function tr(t) {
  var e = t.state,
    r = t.options,
    n = t.name;
  if (!e.modifiersData[n]._skip) {
    for (
      var a = r.mainAxis,
        o = a === void 0 ? !0 : a,
        i = r.altAxis,
        s = i === void 0 ? !0 : i,
        f = r.fallbackPlacements,
        p = r.padding,
        u = r.boundary,
        l = r.rootBoundary,
        y = r.altBoundary,
        c = r.flipVariations,
        h = c === void 0 ? !0 : c,
        v = r.allowedAutoPlacements,
        d = e.options.placement,
        x = H(d),
        O = x === d,
        E = f || (O || !h ? [ye(d)] : er(d)),
        m = [d].concat(E).reduce(function (G, I) {
          return G.concat(
            H(I) === je
              ? _t(e, {
                  placement: I,
                  boundary: u,
                  rootBoundary: l,
                  padding: p,
                  flipVariations: h,
                  allowedAutoPlacements: v,
                })
              : I
          );
        }, []),
        w = e.rects.reference,
        g = e.rects.popper,
        b = new Map(),
        A = !0,
        j = m[0],
        P = 0;
      P < m.length;
      P++
    ) {
      var S = m[P],
        L = H(S),
        B = _(S) === J,
        ee = [R, C].indexOf(L) >= 0,
        te = ee ? "width" : "height",
        $ = fe(e, {
          placement: S,
          boundary: u,
          rootBoundary: l,
          altBoundary: y,
          padding: p,
        }),
        k = ee ? (B ? T : D) : B ? C : R;
      w[te] > g[te] && (k = ye(k));
      var ce = ye(k),
        U = [];
      if (
        (o && U.push($[L] <= 0),
        s && U.push($[k] <= 0, $[ce] <= 0),
        U.every(function (G) {
          return G;
        }))
      ) {
        (j = S), (A = !1);
        break;
      }
      b.set(S, U);
    }
    if (A)
      for (
        var le = h ? 3 : 1,
          xe = function (I) {
            var ne = m.find(function (de) {
              var z = b.get(de);
              if (z)
                return z.slice(0, I).every(function (Oe) {
                  return Oe;
                });
            });
            if (ne) return (j = ne), "break";
          },
          re = le;
        re > 0;
        re--
      ) {
        var ve = xe(re);
        if (ve === "break") break;
      }
    e.placement !== j &&
      ((e.modifiersData[n]._skip = !0), (e.placement = j), (e.reset = !0));
  }
}
var rr = {
  name: "flip",
  enabled: !0,
  phase: "main",
  fn: tr,
  requiresIfExists: ["offset"],
  data: { _skip: !1 },
};
function Ke(t, e, r) {
  return (
    r === void 0 && (r = { x: 0, y: 0 }),
    {
      top: t.top - e.height - r.y,
      right: t.right - e.width + r.x,
      bottom: t.bottom - e.height + r.y,
      left: t.left - e.width - r.x,
    }
  );
}
function Qe(t) {
  return [R, T, C, D].some(function (e) {
    return t[e] >= 0;
  });
}
function nr(t) {
  var e = t.state,
    r = t.name,
    n = e.rects.reference,
    a = e.rects.popper,
    o = e.modifiersData.preventOverflow,
    i = fe(e, { elementContext: "reference" }),
    s = fe(e, { altBoundary: !0 }),
    f = Ke(i, n),
    p = Ke(s, a, o),
    u = Qe(f),
    l = Qe(p);
  (e.modifiersData[r] = {
    referenceClippingOffsets: f,
    popperEscapeOffsets: p,
    isReferenceHidden: u,
    hasPopperEscaped: l,
  }),
    (e.attributes.popper = Object.assign({}, e.attributes.popper, {
      "data-popper-reference-hidden": u,
      "data-popper-escaped": l,
    }));
}
var ar = {
  name: "hide",
  enabled: !0,
  phase: "main",
  requiresIfExists: ["preventOverflow"],
  fn: nr,
};
function or(t, e, r) {
  var n = H(t),
    a = [D, R].indexOf(n) >= 0 ? -1 : 1,
    o = typeof r == "function" ? r(Object.assign({}, e, { placement: t })) : r,
    i = o[0],
    s = o[1];
  return (
    (i = i || 0),
    (s = (s || 0) * a),
    [D, T].indexOf(n) >= 0 ? { x: s, y: i } : { x: i, y: s }
  );
}
function ir(t) {
  var e = t.state,
    r = t.options,
    n = t.name,
    a = r.offset,
    o = a === void 0 ? [0, 0] : a,
    i = tt.reduce(function (u, l) {
      return (u[l] = or(l, e.rects, o)), u;
    }, {}),
    s = i[e.placement],
    f = s.x,
    p = s.y;
  e.modifiersData.popperOffsets != null &&
    ((e.modifiersData.popperOffsets.x += f),
    (e.modifiersData.popperOffsets.y += p)),
    (e.modifiersData[n] = i);
}
var sr = {
  name: "offset",
  enabled: !0,
  phase: "main",
  requires: ["popperOffsets"],
  fn: ir,
};
function fr(t) {
  var e = t.state,
    r = t.name;
  e.modifiersData[r] = st({
    reference: e.rects.reference,
    element: e.rects.popper,
    strategy: "absolute",
    placement: e.placement,
  });
}
var ur = {
  name: "popperOffsets",
  enabled: !0,
  phase: "read",
  fn: fr,
  data: {},
};
function pr(t) {
  return t === "x" ? "y" : "x";
}
function cr(t) {
  var e = t.state,
    r = t.options,
    n = t.name,
    a = r.mainAxis,
    o = a === void 0 ? !0 : a,
    i = r.altAxis,
    s = i === void 0 ? !1 : i,
    f = r.boundary,
    p = r.rootBoundary,
    u = r.altBoundary,
    l = r.padding,
    y = r.tether,
    c = y === void 0 ? !0 : y,
    h = r.tetherOffset,
    v = h === void 0 ? 0 : h,
    d = fe(e, { boundary: f, rootBoundary: p, padding: l, altBoundary: u }),
    x = H(e.placement),
    O = _(e.placement),
    E = !O,
    m = Be(x),
    w = pr(m),
    g = e.modifiersData.popperOffsets,
    b = e.rects.reference,
    A = e.rects.popper,
    j =
      typeof v == "function"
        ? v(Object.assign({}, e.rects, { placement: e.placement }))
        : v,
    P =
      typeof j == "number"
        ? { mainAxis: j, altAxis: j }
        : Object.assign({ mainAxis: 0, altAxis: 0 }, j),
    S = e.modifiersData.offset ? e.modifiersData.offset[e.placement] : null,
    L = { x: 0, y: 0 };
  if (!!g) {
    if (o) {
      var B,
        ee = m === "y" ? R : D,
        te = m === "y" ? C : T,
        $ = m === "y" ? "height" : "width",
        k = g[m],
        ce = k + d[ee],
        U = k - d[te],
        le = c ? -A[$] / 2 : 0,
        xe = O === J ? b[$] : A[$],
        re = O === J ? -A[$] : -b[$],
        ve = e.elements.arrow,
        G = c && ve ? De(ve) : { width: 0, height: 0 },
        I = e.modifiersData["arrow#persistent"]
          ? e.modifiersData["arrow#persistent"].padding
          : nt(),
        ne = I[ee],
        de = I[te],
        z = oe(0, b[$], G[$]),
        Oe = E ? b[$] / 2 - le - z - ne - P.mainAxis : xe - z - ne - P.mainAxis,
        ft = E
          ? -b[$] / 2 + le + z + de + P.mainAxis
          : re + z + de + P.mainAxis,
        Ee = e.elements.arrow && pe(e.elements.arrow),
        ut = Ee ? (m === "y" ? Ee.clientTop || 0 : Ee.clientLeft || 0) : 0,
        Te = (B = S == null ? void 0 : S[m]) != null ? B : 0,
        pt = k + Oe - Te - ut,
        ct = k + ft - Te,
        Le = oe(c ? we(ce, pt) : ce, k, c ? Y(U, ct) : U);
      (g[m] = Le), (L[m] = Le - k);
    }
    if (s) {
      var ke,
        lt = m === "x" ? R : D,
        vt = m === "x" ? C : T,
        X = g[w],
        me = w === "y" ? "height" : "width",
        We = X + d[lt],
        Fe = X - d[vt],
        Ae = [R, D].indexOf(x) !== -1,
        He = (ke = S == null ? void 0 : S[w]) != null ? ke : 0,
        Ne = Ae ? We : X - b[me] - A[me] - He + P.altAxis,
        Ve = Ae ? X + b[me] + A[me] - He - P.altAxis : Fe,
        Ie = c && Ae ? Lt(Ne, X, Ve) : oe(c ? Ne : We, X, c ? Ve : Fe);
      (g[w] = Ie), (L[w] = Ie - X);
    }
    e.modifiersData[n] = L;
  }
}
var lr = {
  name: "preventOverflow",
  enabled: !0,
  phase: "main",
  fn: cr,
  requiresIfExists: ["offset"],
};
function vr(t) {
  return { scrollLeft: t.scrollLeft, scrollTop: t.scrollTop };
}
function dr(t) {
  return t === W(t) || !M(t) ? $e(t) : vr(t);
}
function mr(t) {
  var e = t.getBoundingClientRect(),
    r = Q(e.width) / t.offsetWidth || 1,
    n = Q(e.height) / t.offsetHeight || 1;
  return r !== 1 || n !== 1;
}
function hr(t, e, r) {
  r === void 0 && (r = !1);
  var n = M(e),
    a = M(e) && mr(e),
    o = q(e),
    i = Z(t, a),
    s = { scrollLeft: 0, scrollTop: 0 },
    f = { x: 0, y: 0 };
  return (
    (n || (!n && !r)) &&
      ((N(e) !== "body" || Ce(o)) && (s = dr(e)),
      M(e)
        ? ((f = Z(e, !0)), (f.x += e.clientLeft), (f.y += e.clientTop))
        : o && (f.x = Me(o))),
    {
      x: i.left + s.scrollLeft - f.x,
      y: i.top + s.scrollTop - f.y,
      width: i.width,
      height: i.height,
    }
  );
}
function yr(t) {
  var e = new Map(),
    r = new Set(),
    n = [];
  t.forEach(function (o) {
    e.set(o.name, o);
  });
  function a(o) {
    r.add(o.name);
    var i = [].concat(o.requires || [], o.requiresIfExists || []);
    i.forEach(function (s) {
      if (!r.has(s)) {
        var f = e.get(s);
        f && a(f);
      }
    }),
      n.push(o);
  }
  return (
    t.forEach(function (o) {
      r.has(o.name) || a(o);
    }),
    n
  );
}
function gr(t) {
  var e = yr(t);
  return Dt.reduce(function (r, n) {
    return r.concat(
      e.filter(function (a) {
        return a.phase === n;
      })
    );
  }, []);
}
function wr(t) {
  var e;
  return function () {
    return (
      e ||
        (e = new Promise(function (r) {
          Promise.resolve().then(function () {
            (e = void 0), r(t());
          });
        })),
      e
    );
  };
}
function br(t) {
  var e = t.reduce(function (r, n) {
    var a = r[n.name];
    return (
      (r[n.name] = a
        ? Object.assign({}, a, n, {
            options: Object.assign({}, a.options, n.options),
            data: Object.assign({}, a.data, n.data),
          })
        : n),
      r
    );
  }, {});
  return Object.keys(e).map(function (r) {
    return e[r];
  });
}
var Ze = { placement: "bottom", modifiers: [], strategy: "absolute" };
function _e() {
  for (var t = arguments.length, e = new Array(t), r = 0; r < t; r++)
    e[r] = arguments[r];
  return !e.some(function (n) {
    return !(n && typeof n.getBoundingClientRect == "function");
  });
}
function xr(t) {
  t === void 0 && (t = {});
  var e = t,
    r = e.defaultModifiers,
    n = r === void 0 ? [] : r,
    a = e.defaultOptions,
    o = a === void 0 ? Ze : a;
  return function (s, f, p) {
    p === void 0 && (p = o);
    var u = {
        placement: "bottom",
        orderedModifiers: [],
        options: Object.assign({}, Ze, o),
        modifiersData: {},
        elements: { reference: s, popper: f },
        attributes: {},
        styles: {},
      },
      l = [],
      y = !1,
      c = {
        state: u,
        setOptions: function (x) {
          var O = typeof x == "function" ? x(u.options) : x;
          v(),
            (u.options = Object.assign({}, o, u.options, O)),
            (u.scrollParents = {
              reference: K(s)
                ? ie(s)
                : s.contextElement
                ? ie(s.contextElement)
                : [],
              popper: ie(f),
            });
          var E = gr(br([].concat(n, u.options.modifiers)));
          return (
            (u.orderedModifiers = E.filter(function (m) {
              return m.enabled;
            })),
            h(),
            c.update()
          );
        },
        forceUpdate: function () {
          if (!y) {
            var x = u.elements,
              O = x.reference,
              E = x.popper;
            if (!!_e(O, E)) {
              (u.rects = {
                reference: hr(O, pe(E), u.options.strategy === "fixed"),
                popper: De(E),
              }),
                (u.reset = !1),
                (u.placement = u.options.placement),
                u.orderedModifiers.forEach(function (P) {
                  return (u.modifiersData[P.name] = Object.assign({}, P.data));
                });
              for (var m = 0; m < u.orderedModifiers.length; m++) {
                if (u.reset === !0) {
                  (u.reset = !1), (m = -1);
                  continue;
                }
                var w = u.orderedModifiers[m],
                  g = w.fn,
                  b = w.options,
                  A = b === void 0 ? {} : b,
                  j = w.name;
                typeof g == "function" &&
                  (u = g({ state: u, options: A, name: j, instance: c }) || u);
              }
            }
          }
        },
        update: wr(function () {
          return new Promise(function (d) {
            c.forceUpdate(), d(u);
          });
        }),
        destroy: function () {
          v(), (y = !0);
        },
      };
    if (!_e(s, f)) return c;
    c.setOptions(p).then(function (d) {
      !y && p.onFirstUpdate && p.onFirstUpdate(d);
    });
    function h() {
      u.orderedModifiers.forEach(function (d) {
        var x = d.name,
          O = d.options,
          E = O === void 0 ? {} : O,
          m = d.effect;
        if (typeof m == "function") {
          var w = m({ state: u, name: x, instance: c, options: E }),
            g = function () {};
          l.push(w || g);
        }
      });
    }
    function v() {
      l.forEach(function (d) {
        return d();
      }),
        (l = []);
    }
    return c;
  };
}
var Or = [zt, ur, qt, Mt, sr, rr, lr, Ht, ar],
  Er = xr({ defaultModifiers: Or }),
  Ar = typeof Element != "undefined",
  Pr = typeof Map == "function",
  Sr = typeof Set == "function",
  jr = typeof ArrayBuffer == "function" && !!ArrayBuffer.isView;
function ge(t, e) {
  if (t === e) return !0;
  if (t && e && typeof t == "object" && typeof e == "object") {
    if (t.constructor !== e.constructor) return !1;
    var r, n, a;
    if (Array.isArray(t)) {
      if (((r = t.length), r != e.length)) return !1;
      for (n = r; n-- !== 0; ) if (!ge(t[n], e[n])) return !1;
      return !0;
    }
    var o;
    if (Pr && t instanceof Map && e instanceof Map) {
      if (t.size !== e.size) return !1;
      for (o = t.entries(); !(n = o.next()).done; )
        if (!e.has(n.value[0])) return !1;
      for (o = t.entries(); !(n = o.next()).done; )
        if (!ge(n.value[1], e.get(n.value[0]))) return !1;
      return !0;
    }
    if (Sr && t instanceof Set && e instanceof Set) {
      if (t.size !== e.size) return !1;
      for (o = t.entries(); !(n = o.next()).done; )
        if (!e.has(n.value[0])) return !1;
      return !0;
    }
    if (jr && ArrayBuffer.isView(t) && ArrayBuffer.isView(e)) {
      if (((r = t.length), r != e.length)) return !1;
      for (n = r; n-- !== 0; ) if (t[n] !== e[n]) return !1;
      return !0;
    }
    if (t.constructor === RegExp)
      return t.source === e.source && t.flags === e.flags;
    if (t.valueOf !== Object.prototype.valueOf)
      return t.valueOf() === e.valueOf();
    if (t.toString !== Object.prototype.toString)
      return t.toString() === e.toString();
    if (((a = Object.keys(t)), (r = a.length), r !== Object.keys(e).length))
      return !1;
    for (n = r; n-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(e, a[n])) return !1;
    if (Ar && t instanceof Element) return !1;
    for (n = r; n-- !== 0; )
      if (
        !(
          (a[n] === "_owner" || a[n] === "__v" || a[n] === "__o") &&
          t.$$typeof
        ) &&
        !ge(t[a[n]], e[a[n]])
      )
        return !1;
    return !0;
  }
  return t !== t && e !== e;
}
var Rr = function (e, r) {
    try {
      return ge(e, r);
    } catch (n) {
      if ((n.message || "").match(/stack|recursion/i))
        return (
          console.warn("react-fast-compare cannot handle circular refs"), !1
        );
      throw n;
    }
  },
  Dr = [],
  Br = function (e, r, n) {
    n === void 0 && (n = {});
    var a = F.exports.useRef(null),
      o = {
        onFirstUpdate: n.onFirstUpdate,
        placement: n.placement || "bottom",
        strategy: n.strategy || "absolute",
        modifiers: n.modifiers || Dr,
      },
      i = F.exports.useState({
        styles: {
          popper: { position: o.strategy, left: "0", top: "0" },
          arrow: { position: "absolute" },
        },
        attributes: {},
      }),
      s = i[0],
      f = i[1],
      p = F.exports.useMemo(function () {
        return {
          name: "updateState",
          enabled: !0,
          phase: "write",
          fn: function (c) {
            var h = c.state,
              v = Object.keys(h.elements);
            dt.exports.flushSync(function () {
              f({
                styles: qe(
                  v.map(function (d) {
                    return [d, h.styles[d] || {}];
                  })
                ),
                attributes: qe(
                  v.map(function (d) {
                    return [d, h.attributes[d]];
                  })
                ),
              });
            });
          },
          requires: ["computeStyles"],
        };
      }, []),
      u = F.exports.useMemo(
        function () {
          var y = {
            onFirstUpdate: o.onFirstUpdate,
            placement: o.placement,
            strategy: o.strategy,
            modifiers: [].concat(o.modifiers, [
              p,
              { name: "applyStyles", enabled: !1 },
            ]),
          };
          return Rr(a.current, y) ? a.current || y : ((a.current = y), y);
        },
        [o.onFirstUpdate, o.placement, o.strategy, o.modifiers, p]
      ),
      l = F.exports.useRef();
    return (
      Ue(
        function () {
          l.current && l.current.setOptions(u);
        },
        [u]
      ),
      Ue(
        function () {
          if (!(e == null || r == null)) {
            var y = n.createPopper || Er,
              c = y(e, r, u);
            return (
              (l.current = c),
              function () {
                c.destroy(), (l.current = null);
              }
            );
          }
        },
        [e, r, n.createPopper]
      ),
      {
        state: l.current ? l.current.state : null,
        styles: s.styles,
        attributes: s.attributes,
        update: l.current ? l.current.update : null,
        forceUpdate: l.current ? l.current.forceUpdate : null,
      }
    );
  };
function Cr({ children: t, tooltip: e, className: r, placement: n = "top" }) {
  const [a, o] = F.exports.useState(!1),
    [i, s] = F.exports.useState(),
    [f, p] = F.exports.useState(),
    { styles: u, attributes: l } = Br(i, f, {
      placement: n,
      modifiers: [{ name: "offset", options: { offset: [0, 8] } }],
    });
  return mt("div", {
    className: "inline",
    children: [
      Pe("span", {
        ref: s,
        onMouseEnter: () => o(!0),
        onMouseLeave: () => o(!1),
        children: t,
      }),
      Pe(yt, {
        show: a,
        enter: "ease-out duration-300",
        enterFrom: "opacity-0",
        enterTo: "opacity-100",
        leave: "ease-in duration-200",
        leaveFrom: "opacity-100",
        leaveTo: "opacity-0",
        className: "absolute",
        children: Pe("div", {
          ref: p,
          role: "tooltip",
          className: ht(
            "bg-gray-900 bg-opacity-90 text-white px-2 py-1                                  rounded-lg absolute text-sm select-none text-center z-50",
            r
          ),
          onMouseEnter: () => o(!0),
          onMouseLeave: () => o(!1),
          style: u.popper,
          ...l.popper,
          children: e,
        }),
      }),
    ],
  });
}
export { Cr as T, Br as u };

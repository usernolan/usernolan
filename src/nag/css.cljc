(ns nag.css
  (:require
   [garden.stylesheet :as g.stylesheet]
   [nag.lib :as lib]))

(def body
  [[:body
    {:font-family "\"Helvetica Neue\", Helvetica, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", sans-serif"
     :font-size   "1.1rem"
     :margin      "0"}]
   (g.stylesheet/at-media
    {:screen true :max-width "330px"}
    [:body {:font-size "0.95rem"}])])

(def a
  [[:a {:text-decoration "none"}]])

(def mobile-only
  [[(lib/->css-selector ::mobile-only)
    {:display "none"}]
   (g.stylesheet/at-media
    {:screen true :max-width lib/mobile-width}
    [(lib/->css-selector ::mobile-only)
     {:display "initial"}])])

(def desktop-only
  [(g.stylesheet/at-media
    {:screen true :max-width lib/mobile-width}
    [(lib/->css-selector ::desktop-only)
     {:display "none"}])])

(def rotated-45
  [[(lib/->css-selector ::rotated-45)
    {:transform "rotate(45deg)"}]])

(def css
  (concat
   body
   a
   mobile-only
   desktop-only
   rotated-45))

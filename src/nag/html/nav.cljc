(ns nag.html.nav
  (:require
   [garden.core :as g]
   [garden.stylesheet :as g.stylesheet]
   [nag.css :as css]
   [nag.lib :as lib]
   [nag.nav :as nav]))

(defn ->nav-hiccup
  [ident]
  [:a {:class (lib/->html-safe ident)
       :href  (str "/#/" (name ident))}
   (name ident)])

(defn hiccups
  [& _]
  [[:button {:class (lib/->html-safe ::css/mobile-only ::nav/expand)} "+"]
   [:nav {:class (lib/->html-safe ::nav/nav)}
    (map ->nav-hiccup nav/idents)]])

(def css
  [[(lib/->css-selector ::nav/nav) {}
    [:a
     {:color       "black"
      :margin-left "21px"}
     [:&:hover {:text-decoration "underline"}]]]
   [(lib/->css-selector ::nav/expand)
    {:background  "none"
     :border      "none"
     :box-sizing  "border-box"
     :cursor      "pointer"
     :font-size   "1.25rem"
     :font-weight "bold"
     :padding     "0 28px"}]
   (g.stylesheet/at-media
    {:screen true :max-width lib/mobile-width}
    [(lib/->css-selector ::nav/nav)
     {:height     "0"
      :overflow   "hidden"
      :transition "height 100ms"}
     [:a
      {:font-size "1.25rem"
       :display   "block"
       :margin    "7px 0"}]]
    [(lib/->css-selector ::nav/expanded)
     {:height "233px"}]
    [(lib/->css-selector ::nav/expand)
     {:transition "transform 100ms"}])
   [(lib/->css-selector ::nav/active)
    {:text-decoration "underline"}]])

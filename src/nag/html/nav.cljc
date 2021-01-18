(ns nag.html.nav
  (:require
   [clojure.string :as string]
   [garden.stylesheet :as g.stylesheet]
   [nag.css :as css]
   [nag.lib :as lib]
   [nag.nav :as nav]
   [rum.core :as rum]))

(def idents
  [nav/quotes
   nav/contact
   nav/rand
   nav/all])

(defn ->name
  [ident]
  (last (string/split ident #"-")))

(defn ->href
  [ident]
  (str "/#/" (->name ident)))

(rum/defc ->nav-component
  [ident]
  [:a {:class ident :href (->href ident)}
   (->name ident)])

(rum/defc component
  []
  [:<>
   [:button {:class (lib/->html-safe ::css/mobile-only ::nav/expand)} "+"]
   [:nav {:class (lib/->html-safe ::nav/nav)}
    (map ->nav-component idents)]])

(def css
  [[(lib/->css-selector ::nav/nav)
    [:a {:color           "black"
         :margin-left     "21px"
         :text-decoration "none"}
     [:&:hover {:text-decoration "underline"}]]]
   [(lib/->css-selector ::nav/expand)
    {:background  "none"
     :border      "none"
     :box-sizing  "border-box"
     :cursor      "pointer"
     :font-size   "2rem"
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
     {:height "250px"}]
    [(lib/->css-selector ::nav/expand)
     {:transition "transform 100ms"}])
   [(lib/->css-selector ::nav/active)
    {:text-decoration "underline !important"}]])

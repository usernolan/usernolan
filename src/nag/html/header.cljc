(ns nag.html.header
  (:require
   [nag.html.nav :as html.nav]
   [nag.lib :as lib]
   [nag.nav :as nav]))

(defn hiccup
  [& _]
  [:div {:class (lib/->html-safe ::container)}
   [:a {:class (lib/->html-safe ::nav/nolan)
        :href  (str "/#/" (name ::nav/nolan))}
    [:h1 "nolan"]]
   (for [h (html.nav/hiccups)] h)])

(def css
  (concat
   [[(lib/->css-selector ::container)
     {:align-items "baseline"
      :box-sizing  "border-box"
      :display     "flex"
      :flex-wrap   "wrap"
      :padding     "7px 14px"
      :width       "100%"}]
    [(str "a" (lib/->css-selector ::nav/nolan))
     {:color "black"}
     [:>
      [:h1 {:margin "0"}]
      [:&:hover
       {:text-decoration "underline"}]]]]
   html.nav/css))

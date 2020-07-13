(ns nag.html.header
  (:require
   [nag.html.nav :as html.nav]
   [nag.lib :as lib]
   [nag.nav :as nav]))

(defn hiccup
  [& _]
  [:div {:class (lib/->html-safe ::container)}
   [:a {:class nav/nolan :href (str "/#/nolan")}
    [:h1 "nolan"]]
   (for [h (html.nav/hiccups)] h)])

(def css
  (concat
   [[(lib/->css-selector ::container)
     {:align-items     "baseline"
      :box-sizing      "border-box"
      :display         "flex"
      :flex-wrap       "wrap"
      :justify-content "space-between"
      :padding         "7px 14px"
      :width           "100%"}]
    [(str "a." nav/nolan)
     {:color "black"}
     [:&:hover {:text-decoration "underline"}]
     [:>
      [:h1
       {:margin         "0"
        :pointer-events "none"}]]]]
   html.nav/css))

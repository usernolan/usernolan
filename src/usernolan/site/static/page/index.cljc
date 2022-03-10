(ns usernolan.site.static.page.index
  (:require
   [clojure.string :as str]
   [garden.selectors :as g.sel]
   [garden.stylesheet :as g.ss]
   [usernolan.browser.style :as style.lib]
   [usernolan.site.component.head :as head]
   [usernolan.site.router :as router]
   [usernolan.site.static.page :as page]))


   ;;;
   ;;; NOTE: data, values
   ;;;


(defmethod style.lib/styles ::router/index
  [_props _ident]
  {::router/index
   [[:body {:margin "0" :padding "0"}]

    [:.root
     {:font-family "sans-serif"
      :position    "absolute"
      :width       "100vw"
      :min-height  "100vh"
      :overflow-x  "hidden"
      :overflow-y  "scroll"
      :box-sizing  "border-box"}]

    [:.root {:transition "background 80ms ease, color 80ms ease"}]
    [:.root.usernolan {:background "#171717" :color "#e8e8e8"}
     [:.content {:background "#e8e8e8" :color "#171717"}
      [:button.show-controls
       [:svg {:width "120px" :height "83px" :stroke "#171717"}]]]]
    [:.root.nm8 {:background "black" :color "white"}
     [:.content {:background "white" :color "black"}
      [:button.show-controls
       [:svg {:width "120px" :height "83px" :stroke "black"}]]]]
    [:.root.Oe {:background "white" :color "black"}
     [:.content {:background "white" :color "black"}
      [:button.show-controls
       [:svg {:width "120px" :height "83px" :stroke "black"}]]]]
    [:.root.smixzy {:background "purple" :color "lightblue"}
     [:.content {:background "lightblue" :color "purple"}
      [:button.show-controls
       [:svg {:width "120px" :height "83px" :stroke "purple"}]]]]

    [:.about
     [:h1 {:margin [[0 0 0 #_0 "160px"]] :line-height "2.2rem" :font-weight 400}]
     [:.contact {:color "#aaa" :margin [["10px" 0 0 "160px"]] :text-decoration "none"
                 :border-bottom "1px solid #aaa"}]]

    [:.controls
     {:position   "absolute"
      :box-sizing "border-box"}]

    [:.content
     {:position   "absolute"
      :top        "0"
      :left       "0"
      :width      "100%"
      :min-height "100%"
      :overflow   "hidden"
      :box-sizing "border-box"
      :padding    "5px"
      :transition "top 80ms ease, left 80ms ease"}]

    [:.content.show-controls
     {:top  "80px"
      :left "225px"}]

    [:button.show-controls
     {:cursor     "pointer"
      :background "none"
      :border     "none"
      :box-sizing "border-box"
      :padding    "0"}
     [:svg
      {:fill         "none"
       :stroke-width "0.042"}]]

    ]

   #_ [(g.ss/at-media
        {:screen true :orientation :landscape}
        [[]])]

   #_ [(g.ss/at-media
        {:screen true :orientation :portrait}
        [])]
   })


   ;;;
   ;;; NOTE: components
   ;;;


(defn body
  [props]
  [:body
   [:div#app]])


   ;;;
   ;;; NOTE: `page` multifn implementations
   ;;;


(defmethod page/component ::router/index
  [props]
  [:html {:lang "en"}
   [head/component props]
   [body props]])

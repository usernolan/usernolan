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
    [:* {:box-sizing "border-box"}]

    [:.root
     {:font-family "sans-serif"
      :position    "absolute"
      :width       "100vw"
      :min-height  "100vh"
      :overflow-x  "hidden"
      :overflow-y  "scroll"}]

    [:.root {:transition "background 80ms ease, color 80ms ease"}]
    [:.root.usernolan {:background "#171717" :color "#e8e8e8"}
     [:.content {:background "#e8e8e8" :color "#171717"}
      [:button.show-site-controls
       [:svg {:width "120px" :height "83px" :stroke "#171717"}]]]]
    [:.root.nm8 {:background "black" :color "white"}
     [:.content {:background "white" :color "black"}
      [:button.show-site-controls
       [:svg {:width "120px" :height "83px" :stroke "black"}]]]]
    [:.root.Oe {:background "white" :color "black"}
     [:.content {:background "white" :color "black"}
      [:button.show-site-controls
       [:svg {:width "120px" :height "83px" :stroke "black"}]]]]
    [:.root.smixzy {:background "purple" :color "lightblue"}
     [:.content {:background "lightblue" :color "purple"}
      [:button.show-site-controls
       [:svg {:width "120px" :height "83px" :stroke "purple"}]]]]

    [:.site-controls
     {:position "absolute"}]

    [:.content
     {:position        "absolute"
      :top             "0"
      :left            "0"
      :width           "100%"
      :min-height      "100%"
      :overflow        "hidden"
      #_#_#_#_:display "flex"
      :align-items     "flex-start"
      :transition      "top 80ms ease, left 80ms ease"}]

    [:.content.show-site-controls
     {:top  "80px"
      :left "225px"}]

    [:.page-controls
     {:position "fixed"}]

    [:button.show-site-controls
     {:cursor     "pointer"
      :background "none"
      :border     "none"
      :padding    "0"}
     [:svg
      {:fill         "none"
       :stroke-width "0.042"}]]

    [:.about
     #_[:p {:max-width "600px"}]]

    [:.squares
     {:margin-left "120px"
      :width       "42%"
      :max-width   "900px"
      :display     "flex"
      :flex-wrap   "wrap"
      :gap         "5px"}]
    [:.square {:border "1px dashed black"}]
    [:.square
     {:width "100px" :height "100px"}]
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

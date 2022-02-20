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
     {:position   "absolute"
      :width      "100vw"
      :min-height "100vh"
      :overflow-x "hidden"
      :overflow-y "scroll"
      :box-sizing "border-box"}]

    [:.root {:transition "background 80ms ease, color 80ms ease"}]
    [:.root.usernolan {:background "darkgray" :color "lightgray"}]
    [:.root.nm8 {:background "black" :color "white"}]
    [:.root.oe {:background "transparent" :color "black"}]
    [:.root.smxzy {:background "purple" :color "lightblue"}]

    [:.controls
     {:position   "absolute"
      :box-sizing "border-box"}]

    [:.controls {}
     #_{:color "white"}]

    [:.content
     {:position   "absolute"
      :top        "0"
      :left       "0"
      :width      "100%"
      :background "white"
      :overflow   "hidden"
      :box-sizing "border-box"
      :transition "top 80ms ease, left 80ms ease"}]

    [:.content.show-controls
     {:top  "80px"
      :left "225px"}]]

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

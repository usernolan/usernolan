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

    #_[:svg {:shape-rendering "optimizeSpeed"}]

    [:.root
     {:font-family "sans-serif"
      :position    "absolute"
      :width       "100vw"
      :min-height  "100vh"
      :overflow    "hidden"}]

    [:button.show-site-controls
     [:svg
      [:rect
       {:pointer-events   "none"
        :transform-origin "center"
        :transform-box    "fill-box"}]]]

    [:.root {:transition "background 80ms ease, color 80ms ease"}]
    [:.root.usernolan {:background "#171717" :color "#e8e8e8"}
     [:.content {:background "#e8e8e8" :color "#171717"}
      [:button.show-site-controls
       [:svg {:stroke "#171717"}
        [:rect
         [(g.sel/& (g.sel/nth-child "1")) {:stroke-linecap "square"}]
         [(g.sel/& (g.sel/nth-child "2")) {:stroke-linecap "round"}]]]]]]
    [:.root.nm8 {:background "black" :color "white"}
     [:.content {:background "white" :color "black"}
      [:button.show-site-controls
       [:svg {:stroke "black" :stroke-linecap "square"}]]]]
    [:.root.Oe {:background "white" :color "black"}
     [:.content {:background "white" :color "black"}
      [:button.show-site-controls
       [:svg {:stroke "black" :stroke-linecap "round"}]]]]
    [:.root.smixzy {:background #_ "radial-gradient(circle at 0 0, purple 0%, pink 100%)" "purple" :color "lightblue"}
     [:.content {:background #_ "radial-gradient(circle at 100% 100%, lightgreen 0%, lightblue 100%)" "lightblue" :color "purple"}
      [:button.show-site-controls
       [:svg {:stroke "purple" :stroke-linecap "round"}]]]
     [:.content.show-site-controls {:border-top-left-radius "15px"}]]

    [:.site-controls {:position "absolute" :width "100%"}
     [:.top-site-controls
      {:display         "flex"
       :justify-content "space-between"
       :width           "100%"}
      [:.id-radio-control]
      [(g.sel/> g.sel/nav) {:display "flex"}]
      [(g.sel/> g.sel/section) {:display "flex"}]
      ]
     [(g.sel/& (g.sel/nth-child 1))]
     #_[:input {:display "flex" :justify-content "space-between" :vertical-align "middle" :min-width "400px"}]
     ]

    [:.content
     {:position              "absolute"
      :top                   "0"
      :left                  "0"
      :width                 "100%"
      :min-height            "100%"
      :max-height            "100%"
      :display               "grid"
      :grid-template-rows    "1fr"
      :grid-template-columns "repeat(8,1fr) repeat(4, minmax(48px, 1fr))"
      :transition            "top 80ms ease, left 80ms ease"
      :overflow-x            "hidden"
      :overscroll-behavior   "contain"}]
    [:.content.show-site-controls
     {:top  "80px"
      :left "225px"}]

    [:.page-controls-container
     {:grid-row-start "1"
      :grid-column    "1 / span 1"
      :position       "relative"}]
    [:.page-controls
     {:position "sticky"
      :top      "0"}]

    [:button.show-site-controls
     {:cursor     "pointer"
      :background "none"
      :border     "none"
      :padding    "7px"}
     [:svg
      {:fill         "none"
       :stroke-width "0.056"}]]

    [:.about-container
     {:grid-column     "2 / span 6"
      :display         "flex"
      :flex-direction  "column"
      :justify-content "center"
      :align-items     "center"}
     [:p
      {:font-size "1.66rem"
       :margin    "0"}]
     [:p.np
      {:margin-top "1rem"}]]

    [:.squares-container
     {:grid-row-start "1"
      :grid-column    "2 / span 6"}]
    [:.squares
     {:width     "100%"
      :display   "flex"
      :flex-wrap "wrap"
      :gap       "5px"}]
    [:.square
     {:border     "1px dashed black"
      :transition "width 120ms ease, height 120ms ease"}]

    [:.zoom-control-container
     {:grid-row-start "1"
      :grid-column    "8 / span 1"
      :position       "relative"}]
    [:.zoom-control
     {:position "sticky"
      :top      "0"}]]

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

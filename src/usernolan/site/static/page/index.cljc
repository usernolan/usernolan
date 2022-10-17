(ns usernolan.site.static.page.index
  (:require
   [clojure.string :as str]
   [garden.selectors :as g.sel]
   [garden.stylesheet :as g.ss]
   [usernolan.browser.style :as style]
   [usernolan.site.component.head :as head]
   [usernolan.site.router :as router]
   [usernolan.site.static.page :as page]))


   ;;;
   ;;; NOTE: data, values
   ;;;


(defmethod style/styles ::router/index
  [_props _ident]
  {::router/index
   [[:body {:margin "0" :padding "0"}]
    [:* {:box-sizing "border-box"}]
    #_[":root" {:--lightgreen "#00ff80"}] ; TODO: color pass; variables pass

    #_[:svg {:shape-rendering "optimizeSpeed"}]
    #_[{:text-rendering          "optimizeLegibility"
        :-moz-osx-font-smoothing "grayscale"}]

    ;; TODO: rename `:.root`; ambiguous with `:root` selector
    [:.root
     {:font-family ["Inter" "sans-serif"]
      :position    "absolute"
      :width       "100vw"
      :min-height  "100vh"
      :overflow    "hidden"
      :transition  (style/transition
                    {:background "80ms ease"
                     :border     "80ms ease"
                     :box-shadow "80ms ease"})}]

    [:.root.usernolan #_{:font-family "Inter"}
     [:content
      [:button
       [:svg
        [:rect
         [(g.sel/& (g.sel/nth-child "1")) {:stroke-linecap "square"}]
         [(g.sel/& (g.sel/nth-child "2")) {:stroke-linecap "round"}]]]]]]

    [:.root.usernolan.light {:background "#e8e8e8" :color "#181818"}
     [:.content {:background "#e8e8e8" :color "#181818"}
      [:button.show-site-controls
       [:svg {:stroke "#181818"}]]]
     [:.content.show-site-controls {:border "1px dashed #181818"}]
     ["::selection" {:background "blue" :color "#e8e8e8"}]
     ["input[type=\"radio\"]" {:accent-color "#181818"}]]

    [:.root.usernolan.dark {:background "#121217" :color "#afafaf"}
     [:.content {:background "#121217" :color "#afafaf" }
      [:button.show-site-controls
       [:svg {:stroke "#afafaf"}]]]
     [:.content.show-site-controls {:border "1px dashed #afafaf"}]
     ["::selection" {:background "lightblue" :color "#121217"}]
     ["input[type=\"radio\"]" {:accent-color "#e8e8e8"}]]

    [:.root.nm8 #_{:font-family "Inter"}]

    [:.root.nm8.light {:background "black" :color "white"}
     [:.content {:background "white" :color "black"}
      [:button.show-site-controls
       [:svg {:stroke "black"}]]
      ["::selection" {:background "black" :color "white"}]]
     ["::selection" {:background "white" :color "black"}]
     ["input[type=\"radio\"]" {:accent-color "black"}]]

    [:.root.nm8.dark {:background "black" :color "white"}
     [:.content {:background "black" :color "white"}
      [:button.show-site-controls
       [:svg {:stroke "white"}]]]
     [:.content.show-site-controls {:border "2px solid white"}]
     ["::selection" {:background "white" :color "black"}]
     ["input[type=\"radio\"]" {:accent-color "white"}]]

    [:.root.Oe #_{:font-family "Castoro"}
     [:.content
      [:button.show-site-controls
       [:svg {:stroke-linecap "round"}]]]
     ["::selection" {:background "#808080"}]]

    [:.root.Oe.light {:background "white" :color "black"}
     [:.content {:background "white" :color "black"}
      [:button.show-site-controls
       [:svg {:stroke "black"}]]]
     ["input[type=\"radio\"]" {:accent-color "black"}]]

    [:.root.Oe.dark {:background "black" :color "white"}
     [:.content {:background "black" :color "white"}
      [:button.show-site-controls
       [:svg {:stroke "white"}]]]
     ["input[type=\"radio\"]" {:accent-color "black"}]]

    [:.root.smixzy #_{:font-family "Silkscreen"}
     [:.content
      [:button.show-site-controls
       [:svg {:stroke-linecap "round"}]]]
     [:.content.show-site-controls {:border-top-left-radius "30px"}]]

    #_ "#2c18e4"
    #_ "radial-gradient(circle at 0 0, purple 0%, pink 100%)"
    #_ "radial-gradient(circle at 100% 100%, lightgreen 0%, lightblue 100%)"
    #_ "-41px 41px 80px #9ab7c4, 41px -41px 80px #d0f7ff"
    #_ "linear-gradient(225deg, #96ccdf, #c4e3ed)"
    [:.root.smixzy.light {:background "lightblue" :color "rebeccapurple"}
     [:.content {:background "linear-gradient(225deg, #9dd0e1, #b9dde9)"
                 :color      "rebeccapurple"}
      [(g.sel/& :.show-site-controls) {:box-shadow "-41px 41px 80px #96ccdf, 41px -41px 80px #c4e3ed"}]
      [:button.show-site-controls
       [:svg {:stroke "rebeccapurple"}]]]
     [:.content.show-site-controls {:background "linear-gradient(225deg, #9dd0e1, #b9dde9)"}]
     ["::selection" {:background "mistyrose" :color "green"}]
     ["input[type=\"radio\"]" {:accent-color "rebeccapurple"}]]

    #_ "inset 41px -41px 80px #4100a5, inset -41px 41px 80px #5600db"
    [:.root.smixzy.dark {:background "#4b00c0" :color "lightblue"}
     [:.content {:background "linear-gradient(225deg, #4400ad, #5000cd)"
                 :color      "lightblue"}
      [(g.sel/& :.show-site-controls) {:box-shadow "inset -41px 41px 80px #4100a5, inset 41px -41px 80px #5600db"}]
      [:button.show-site-controls
       [:svg {:stroke "lightblue"}]]]
     ["::selection" {:background "#00ff80" :color "darkgreen"}]
     ["input[type=\"radio\"]" {:accent-color "lightblue"}]]

    [:.root.usernolan :.root.nm8 :.root.Oe :.root.smixzy
     [(g.sel/& :.alwaysgray) {:background "#999999" :color "#212121"}
      [:.content {:background "#999999" :color "#212121"}
       [:button.show-site-controls
        [:svg {:stroke "#212121"}]]
       ["::selection" {:background "#ff0055" :color "#ffafaf"}]]
      ["::selection" {:background "#ff0055" :color "#ffafaf"}]]]

    [:.root.usernolan.alwaysgray
     [:.content.show-site-controls {:border "1px dashed #212121"}]]

    [:.root.nm8.alwaysgray
     [:.content.show-site-controls {:border "2px solid #212121"}]]

    [:.root.smixzy.light.alwaysgray
     [:.content.show-site-controls
      {:background "#9e9e9e"
       :box-shadow "-41px 41px 80px #888888, 41px -41px 80px #afafaf"}]]

    [:.root.smixzy.dark.alwaysgray
     [:.content.show-site-controls
      {:background "#909090"
       :box-shadow "inset -41px 41px 80px #858585, inset 41px -41px 80px #aaaaaa"}]]

    ["input[type=\"radio\"]"
     {:width  "20px"
      :height "20px"}]

    [:.id-radio {:flex-grow "4" :padding "0 1rem"}]
    [:.mode-radio {:flex-grow "3" :padding "0 32.5rem 0 30rem"}]
    [:.filter-radio {:flex-grow "2" :padding "0 1rem"}]

    [:.id-radio :.mode-radio :.filter-radio
     {:display         "flex"
      :align-items     "center"
      :justify-content "space-between"}
     [:input {:margin "0 auto" :display "block"}]
     [:label {:display "block"}]]

    [:.site-controls {:position "absolute" :width "100%"}
     [:.top-site-controls
      {:display         "flex"
       :justify-content "space-between"
       :width           "100%"
       :padding         "1rem 0"}
      [(g.sel/> g.sel/nav) {:display "flex"}]
      [(g.sel/> g.sel/section) {:display "flex"}]]
     #_[:input
        {:display         "flex"
         :justify-content "space-between"
         :vertical-align  "middle"
         :min-width       "400px"}]]

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
      :transition            (style/transition
                              {:background "80ms ease"
                               :border     "80ms ease"
                               :box-shadow "80ms ease"
                               :top        "80ms ease"
                               :left       "80ms ease"})
      :overflow-x            "hidden"
      :overscroll-behavior   "contain"}]

    [:.content.show-site-controls
     {:top  "80px"
      :left "225px"}]

    [:.page-controls-container
     #_{:grid-row-start "1"
        :grid-column    "1 / span 1"
        :position       "relative"}]

    [:.page-controls
     {:position "sticky"
      :top      "0"}]

    [:button.show-site-controls
     {:cursor     "pointer"
      :background "none"
      :border     "none"
      :margin     "28px 7px 7px 28px"
      :padding    "0"
      :width      "110px"}
     [:svg
      {:fill         "none"
       :stroke-width "5.6"
       :width        "100%"}
      [:rect
       {:pointer-events   "none"
        :transform-origin "center"
        :transform-box    "fill-box"}]]]

    [:.about-container
     {:grid-column     "2 / span 8"
      :display         "flex"
      :flex-direction  "column"
      :justify-content "center"
      :align-items     "center"
      :line-height     "2.5rem"}
     [:p
      {:font-size "2rem"
       :margin    "0"}]]

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


(defn body [props]
  [:body
   [:div#app]])


   ;;;
   ;;; NOTE: `head` multifn implementations
   ;;;


(defmethod head/link-fragment ::router/index
  [props]
  (into (head/link-fragment (assoc props ::router/ident :default))
        (map (fn [x]
               [:link {:href (str "https://fonts.googleapis.com/css2?family=" x)
                       :rel  "stylesheet"}]))
        ["Inter"]))

#_
["Castoro" #_Oe
 "Silkscreen" #_smixzy
 "Assistant"
 "Alef"
 "Share+Tech+Mono"

 "Rubik"
 "Roboto+Mono"
 "Domine"
 "Space+Grotesk"
 "Frank+Ruhl+Libre"
 "Space+Mono"
 "Staatliches"
 "Changa"
 "Rokkitt"
 "Chivo"
 "Press+Start+2P"
 "Poiret+One"
 "Lexend"
 "Outfit"
 "Gudea"
 "Cousine"
 "Be+Vietnam+Pro"
 "Blinker"
 "Roboto+Flex"]


   ;;;
   ;;; NOTE: `page` multifn implementations
   ;;;


(defmethod page/component ::router/index
  [props]
  [:html {:lang "en"}
   [head/component props]
   [body props]])

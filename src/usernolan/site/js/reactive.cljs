(ns usernolan.site.js.reactive
  (:refer-clojure :exclude [map])
  (:require
   [goog.array :as arr]
   [goog.dom :as dom]
   [goog.dom.classlist :as classlist]
   [goog.functions :as fns]
   [goog.iter :as iter]
   [goog.object :as obj]
   [goog.string :as str]
   ["gsap" :refer [gsap]]
   ["gsap/Flip" :refer [Flip]]
   ["@thi.ng/compose" :as cf]
   ["@thi.ng/defmulti" :as dfm]
   ["@thi.ng/hiccup" :as h]
   ["@thi.ng/hiccup-svg" :as svg]
   ["@thi.ng/rdom" :as rd]
   ["@thi.ng/router" :as router]
   ["@thi.ng/rstream" :as rs]
   ["@thi.ng/transducers" :as xf]))


   ;;;
   ;;; NOTE: routes, routing
   ;;;


(def routes
  #js[#js{:id    "default-about"
          :match #js["about"]}

      #js{:id    "about"
          :match #js["?id" "about"]}

      #js{:id    "quotes"
          :match #js["?id" "quotes"]}

      #js{:id    "refs"
          :match #js["?id" "refs"]}

      #js{:id    "ref"
          :match #js["?id" "refs" "?ref-id"]}

      #js{:id    "gallery"
          :match #js["?id" "gallery"]}

      #js{:id    "gallery-item"
          :match #js["?id" "gallery" "?item-id"]}])

(def router-config
  #js{:useFragment    true
      :defaultRouteID (.-id (aget routes 0))
      :routes         routes})

(def router
  (router/HTMLRouter. router-config))

(defonce start-router!
  (.start router))

(defonce route!
  (rs/reactive (.-current router)
               #js{:closeOut rs/CloseMode.NEVER}))

(defonce router-listener
  (.addListener router router/EVENT_ROUTE_CHANGED
                (fn [e]
                  (js/console.log "EVENT_ROUTE_CHANGED" e)
                  (.next route! (.-value e)))))

(def id-radio-data
  #js[#js{:id    "id-radio-usernolan"
          :value "usernolan"}

      #js{:id    "id-radio-nm8"
          :value "nm8"}

      #js{:id    "id-radio-oe"
          :value "Oe"}

      #js{:id    "id-radio-smixzy"
          :value "smixzy"}])

(def id-radio!
  (let [init (or (.. route! deref -params -id)
                 (.-value (aget id-radio-data 0)))]
    (rs/reactive init)))

(def content-radio-data
  #js[#js{:id    "content-about"
          :value "about"}

      #js{:id    "content-references"
          :value "refs"}

      #js{:id    "content-quotes"
          :value "quotes"}

      #js{:id    "content-gallery"
          :value "gallery"}])

(def content-radio!
  (let [route (.. route! deref -id)
        init  (cond
                (identical? route "default-about") "about"
                (identical? route "ref")           "refs"
                (identical? route "gallery-item")  "gallery"
                :else                              route)]
    (rs/reactive init)))

(defn id-radio-onchange-fn [id e]
  (let [content (.deref content-radio!)
        route   (str "/" id "/" content)]
    (.routeTo router route)))

(defn content-radio-onchange-fn [content e]
  (let [id    (.deref id-radio!)
        route (str "/" id "/" content)]
    (.routeTo router route)))

(def mode-radio-data
  #js[#js{:id    "mode-radio-system"
          :value "system"}

      #js{:id    "mode-radio-light"
          :value "light"}

      #js{:id    "mode-radio-dark"
          :value "dark"}])

(def mode-radio!
  (let [init (.-value (aget mode-radio-data 0))]
    (rs/reactive init)))

(def filter-radio-data
  #js[#js{:id    "filter-not-always-gray"
          :value "notalwaysgray"}

      #js{:id    "filter-always-gray"
          :value "alwaysgray"}])

(def filter-radio!
  (let [init (.-value (aget filter-radio-data 0))]
    (rs/reactive init)))

(def id-radio-spec
  #js{:element  #js["nav.control.id-radio" nil]
      :name     "id-radio"
      :data     id-radio-data
      :reactive id-radio!
      :onchange id-radio-onchange-fn})

(def content-radio-spec
  #js{:element  #js["nav.control.content-radio" nil]
      :name     "content-radio"
      :data     content-radio-data
      :reactive content-radio!
      :onchange content-radio-onchange-fn})

(def mode-radio-spec
  #js{:element  #js["section.control.mode-radio" nil]
      :name     "mode-radio"
      :data     mode-radio-data
      :reactive mode-radio!})

(def filter-radio-spec
  #js{:element  #js["section.control.filter-radio" nil]
      :name     "filter-radio"
      :data     filter-radio-data
      :reactive filter-radio!})

(defn radio-div [spec x]
  (let [n (.-name spec)
        i (.-id x)
        v (.-value x)
        r (.-reactive spec)
        c (.transform r (xf/map (fn [x] (identical? x v))))
        f (if-let [f (.-onchange spec)] (goog/partial f v) #(.next r v))
        l (or (.-label x) v)]
    #js["div" nil
        #js["input" #js{:type     "radio"
                        :name     n
                        :id       i
                        :value    v
                        :checked  c
                        :onchange f}]
        #js["label" #js{:for i} l]]))

(defn radio-component [spec]
  (let [el   (.-element spec)
        data (.-data spec)
        f    (goog/partial radio-div spec)]
    (doto el
      (arr/extend
          (arr/map data f)))))

;; TODO: radio defaults, state, styling
;; TODO: control grid(s)

(defn route-stream-fn [x]
  (let [route-id (.-id x)
        default? (identical? route-id "default-about")
        content  (cond
                   (identical? route-id "gallery-item") "gallery"
                   (identical? route-id "ref")          "refs"
                   default?                             "about"
                   :else                                route-id)
        id       (if default? "usernolan" (.. x -params -id))]
    (when-not (identical? (.deref content-radio!) content)
      (.next content-radio! content))
    (when-not (identical? (.deref id-radio!) id)
      (.next id-radio! id))))

(defonce route-stream!
  (.transform route! (xf/map route-stream-fn)))

(defn controls [_ctx]
  #js["div.controls" nil
      (radio-component id-radio-spec)
      (radio-component mode-radio-spec)
      (radio-component filter-radio-spec)
      (radio-component content-radio-spec)])

(defn show-controls! [e]
  (when-let [el (dom/getAncestorByClass (.-target e) "content")]
    ;; TODO: dynamic top+left/transform dynamic
    ;; NOTE: mobile vs. desktop
    ;; NOTE: clientY of filter//last "bottom" of radios
    ;; NOTE: clientX of links
    (classlist/toggle el "show-controls")))

(defonce radio-stream!
  (rs/sync #js{:src #js{:id      id-radio!
                        :content content-radio!
                        :mode    mode-radio!
                        :filter  filter-radio!}}))

(defonce usernolan-svg-mouseover-stream!
  (rs/reactive false))

(defonce usernolan-svg-toggle-stream!
  (rs/reactive false))

(def usernolan-svg-rect-y-top 0.025)
(def usernolan-svg-rect-y-middle 0.275)
(def usernolan-svg-rect-y-bottom 0.525)

(defonce usernolan-svg-rect-y-stream!
  (rs/reactive usernolan-svg-rect-y-top
               #js{:closeOut rs/CloseMode.NEVER})) ; NOTE: rs/tweenNumber

(def usernolan-svg-rect-dasharray
  "2 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 2 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125")

(defonce fromRAF!
  (rs/fromRAF))

(defonce usernolan-svg-RAF!
  (rs/sync #js{:src #js{:t         fromRAF!
                        :mouseover usernolan-svg-mouseover-stream!
                        :toggle    usernolan-svg-toggle-stream!}}))

(defonce usernolan-svg-rect-dashoffset-stream!
  (.transform usernolan-svg-RAF!
              (xf/map (fn [^js x]
                        (cond
                          (.-mouseover x) (* (mod (.-t x) 611) 0.01309328968903437)
                          (.-toggle x)    -3.4375
                          :else           -1.5)))
              #js{:closeOut rs/CloseMode.NEVER}))

(def usernolan-svg-circle-cy-bottom 1.025)
(def usernolan-svg-circle-cy-middle 0.775)
(def usernolan-svg-circle-cy-top 0.525)

(defonce usernolan-svg-circle-cy-stream!
  (rs/reactive usernolan-svg-circle-cy-bottom
               #js{:closeOut rs/CloseMode.NEVER})) ; NOTE: rs/tweenNumber

(def usernolan-svg-circle-dasharray
  "1.5707963267948966 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305")

(defonce usernolan-svg-circle-dashoffset-stream!
  (.transform usernolan-svg-RAF!
              (xf/map (fn [^js x]
                        (cond
                          (.-mouseover x) (* (mod (.-t x) 240) -0.01308996938995747)
                          (.-toggle x)    0
                          :else           1.5707963267948966)))
              #js{:closeOut rs/CloseMode.NEVER}))

(defn usernolan-svg-onmouseover [_e]
  (.next usernolan-svg-mouseover-stream! true)
  (.next usernolan-svg-rect-y-stream! usernolan-svg-rect-y-middle)
  (.next usernolan-svg-circle-cy-stream! usernolan-svg-circle-cy-middle))

(defn usernolan-svg-onmouseout [_e]
  (.next usernolan-svg-mouseover-stream! false)
  (if (.deref usernolan-svg-toggle-stream!)
    (do (.next usernolan-svg-rect-y-stream! usernolan-svg-rect-y-bottom)
        (.next usernolan-svg-circle-cy-stream! usernolan-svg-circle-cy-top))
    (do (.next usernolan-svg-rect-y-stream! usernolan-svg-rect-y-top)
        (.next usernolan-svg-circle-cy-stream! usernolan-svg-circle-cy-bottom))))

(defn usernolan-svg-onclick [_e]
  (js/setTimeout usernolan-svg-onmouseout 80)
  (.next usernolan-svg-toggle-stream!
         (not (.deref usernolan-svg-toggle-stream!))))

(defn usernolan-svg [attrs]
  #js["svg"
      #js{:xmlns       "http://www.w3.org/2000/svg"
          :viewBox     "0 0 2.275 1.575"
          :onmouseover usernolan-svg-onmouseover
          :onmouseout  usernolan-svg-onmouseout
          :onclick     usernolan-svg-onclick}
      #js["rect"
          #js{:width             1
              :height            1
              :x                 0.025
              :y                 (rs/tweenNumber usernolan-svg-rect-y-stream!
                                                 usernolan-svg-rect-y-top
                                                 0.2)
              :stroke-dasharray  usernolan-svg-rect-dasharray
              :stroke-dashoffset usernolan-svg-rect-dashoffset-stream!}]
      #js["circle"
          #js{:r                 0.5
              :cx                1.75
              :cy                (rs/tweenNumber usernolan-svg-circle-cy-stream!
                                                 usernolan-svg-circle-cy-bottom
                                                 0.2)
              :stroke-dasharray  usernolan-svg-circle-dasharray
              :stroke-dashoffset usernolan-svg-circle-dashoffset-stream!}]])

(defonce debug-stream!
  (let [s (rs/sync #js{:src #js{:radios radio-stream!
                                :route  route!}})]
    (.transform s (xf/map js/JSON.stringify))))

#_(defonce state-interval
  (js/setInterval
   (fn []
     (js/console.log
      (str
       (.getState route!)
       (.getState id-radio!)
       (.getState content-radio!)
       (.getState mode-radio!)
       (.getState filter-radio!)
       (.getState filter-radio!)
       (.getState route-stream!)
       (.getState radio-stream!)
       (.getState usernolan-svg-mouseover-stream!)
       (.getState usernolan-svg-toggle-stream!)
       (.getState usernolan-svg-rect-y-stream!)
       (.getState fromRAF!)
       (.getState usernolan-svg-RAF!)
       (.getState usernolan-svg-rect-dashoffset-stream!)
       (.getState usernolan-svg-circle-cy-stream!)
       (.getState usernolan-svg-circle-dashoffset-stream!)
       (.getState debug-stream!))))
   1000))

(defn debug-component [attrs]
  #js["div.debug" attrs
      #js["p" nil debug-stream!]])

(defn default-view-async [route-match]
  (js/Promise.resolve
   #js["div" #js{:class "about"}
       #js["p" nil "im nolan. ive been called a reflector!"
           #js["br" nil] "usernolan is a multiplexer."
           #js["br" nil] "click square zero"]
       #_#js["a.contact" #js{:href "mailto:inbox@usernolan.net"}
           "Email"]
       #_#js[debug-component nil]]))

(defn error-view-async [err]
  (js/Promise.resolve
   #js["h1" #js{:style #js{:color "red"}} err]))

(defn route-match-key-fn [route-match]
  (.-id route-match))

(defn usernolan-svg-async [id]
  (js/Promise.resolve
   (usernolan-svg nil)))

(defn about-async [route-match])

(def about-component-async
  (dfm/defmulti
    (fn [route-match]
      (.. route-match -params -id))))

(defn usernolan-about-component-async [_route-match]
  (js/Promise.resolve
   #js["div" #js{:class "about"}
       #js["p" nil "im nolan. ive been called a reflector!"
           #js["br" nil] "usernolan is a multiplexer."
           #js["br" nil] "click square zero"]
       #_#js["a.contact" #js{:href "mailto:inbox@usernolan.net"}
             "Email"]
       #_#js[debug-component nil]]))

(defn nm8-about-component-async [_route-match]
  (js/Promise.resolve
   #js["div" #js{:class "about"}
       #js["p" nil "im sorry this site uses javascript."]
       #_#js[debug-component nil]]))

(defn Oe-about-component-async [_route-match]
  (js/Promise.resolve
   #js["div" #js{:class "about"}
       #js["p" nil "observe .• explicate"
           #js["br" nil] ":: metacircular interpretation"]
       #_#js[debug-component nil]]))

(defn smixzy-about-component-async [_route-match]
  (js/Promise.resolve
   #js["div" #js{:class "about"}
       #js["p" nil "nonsense acrylic handmade"
           #js["br" nil] "level 60 arcane mage"]
       #_#js[debug-component nil]]))

(.addAll about-component-async
         #js{"usernolan" usernolan-about-component-async
             "nm8"       nm8-about-component-async
             "Oe"        Oe-about-component-async
             "smixzy"    smixzy-about-component-async})

(def nm8-svg-rect-dasharray
  "0.5")

(defonce nm8-svg-rect-dashoffset-stream!
  (.transform usernolan-svg-RAF!
              (xf/map (fn [^js x]
                        (cond
                          (.-mouseover x) (* (mod (.-t x) 611) 0.01309328968903437)
                          (.-toggle x)    -0.5
                          :else           0)))
              #js{:closeOut rs/CloseMode.NEVER}))

(defonce nm8-svg-rect2-dashoffset-stream!
  (.transform usernolan-svg-RAF!
              (xf/map (fn [^js x]
                        (cond
                          (.-mouseover x) (+ (* (mod (.-t x) 611) -0.01309328968903437) 0.5)
                          (.-toggle x)    0.5
                          :else           -3)))
              #js{:closeOut rs/CloseMode.NEVER}))

#_(.transform nm8-svg-rect-dashoffset-stream!
            (xf/map (fn [x] (* -1 (+ x 3)))))

(defn nm8-svg-async [attrs]
  (js/Promise.resolve
   #js["svg"
       #js{:xmlns       "http://www.w3.org/2000/svg"
           :viewBox     "0 0 2.275 2.05"
           :onmouseover usernolan-svg-onmouseover
           :onmouseout  usernolan-svg-onmouseout
           :onclick     usernolan-svg-onclick}
       #js["rect"
           #js{:width             1
               :height            1
               :x                 0.025
               :y                 0.025
               :rx                0
               :ry                0
               :stroke-dasharray  nm8-svg-rect-dasharray
               :stroke-dashoffset nm8-svg-rect-dashoffset-stream!}]
       #js["rect"
           #js{:width             1
               :height            1
               :x                 1.025
               :y                 1.025
               :rx                0
               :ry                0
               :stroke-dasharray  nm8-svg-rect-dasharray
               :stroke-dashoffset nm8-svg-rect2-dashoffset-stream!}]]))

(comment ; Oe circles

  (def Oe-svg-rect-dasharray
    "2 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 2 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125")

  (def Oe-svg-large-rect-dasharray
    "1.5707963267948966 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305")

  #_2.356194490192345
  #_3.141592653589793

  (def Oe-svg-small-rect-dasharray
    "1.1780972450961724 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749"
    #_"1.1780972450961724 0.1308996938995747 0.1308996938995747 0.1308996938995747 0.1308996938995747 0.1308996938995747 0.1308996938995747 0.1308996938995747 0.1308996938995747 0.1308996938995747")

  (defonce Oe-svg-large-rect-dashoffset-stream!
    (.transform usernolan-svg-RAF!
                (xf/map (fn [^js x]
                          (cond
                            (.-mouseover x) (* (mod (.-t x) 120) 0.02617993877991494)
                            (.-toggle x)    0
                            :else           1.5707963267948966)))
                #js{:closeOut rs/CloseMode.NEVER}))

  (defonce Oe-svg-small-rect-dashoffset-stream!
    (.transform usernolan-svg-RAF!
                (xf/map (fn [^js x]
                          (cond
                            (.-mouseover x) (* (mod (.-t x) 120) -0.019634954084936207)
                            (.-toggle x)    1.1780972450961724
                            :else           0)))
                #js{:closeOut rs/CloseMode.NEVER}))

  ;;;
  )

(def Oe-svg-rect-dasharray
  "2 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 2 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125 0.125")

(def Oe-svg-large-rect-dasharray
  "1.5707963267948966 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305 0.1208304866765305")

#_2.356194490192345
#_3.141592653589793

(def Oe-svg-small-rect-dasharray
  "1.1780972450961724 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749 0.10709974955419749"
  #_"1.1780972450961724 0.1308996938995747 0.1308996938995747 0.1308996938995747 0.1308996938995747 0.1308996938995747 0.1308996938995747 0.1308996938995747 0.1308996938995747 0.1308996938995747")

(defonce Oe-svg-large-rect-dashoffset-stream!
  (.transform usernolan-svg-RAF!
              (xf/map (fn [^js x]
                        (cond
                          (.-mouseover x) (* (mod (.-t x) 120) 0.02617993877991494)
                          (.-toggle x)    0
                          :else           1.5707963267948966)))
              #js{:closeOut rs/CloseMode.NEVER}))

(defonce Oe-svg-small-rect-dashoffset-stream!
  (.transform usernolan-svg-RAF!
              (xf/map (fn [^js x]
                        (cond
                          (.-mouseover x) (* (mod (.-t x) 120) -0.019634954084936207)
                          (.-toggle x)    1.1780972450961724
                          :else           0)))
              #js{:closeOut rs/CloseMode.NEVER}))

(defn Oe-svg-async [attrs]
  (js/Promise.resolve
   #js["svg"
       #js{:xmlns       "http://www.w3.org/2000/svg"
           :viewBox     "0 0 2.275 1.575"
           :onmouseover usernolan-svg-onmouseover
           :onmouseout  usernolan-svg-onmouseout
           :onclick     usernolan-svg-onclick}
      #js["rect"
          #js{:width             1
              :height            1
              :x                 0.025
              :y                 0.25
              :rx                0.5
              :ry                0.5
              :stroke-dasharray  Oe-svg-large-rect-dasharray
              :stroke-dashoffset Oe-svg-large-rect-dashoffset-stream!}]
      #js["rect"
          #js{:width             1
              :height            1
              :x                 0.525
              :y                 0.25
              :rx                0.5
              :ry                0.5
              :stroke-dasharray  Oe-svg-small-rect-dasharray
              :stroke-dashoffset Oe-svg-small-rect-dashoffset-stream!}]]))

(defn smixzy-svg-async [attrs]
  (js/Promise.resolve
   #js["svg"
       #js{:xmlns       "http://www.w3.org/2000/svg"
           :viewBox     "0 0 2.275 1.575"
           :onmouseover usernolan-svg-onmouseover
           :onmouseout  usernolan-svg-onmouseout
           :onclick     usernolan-svg-onclick}
       #js["rect"
           #js{:width             1
               :height            0.25
               :x                 0.25
               :y                 0.875
               :rx                0.5
               :ry                0.5
               :stroke-dasharray  usernolan-svg-rect-dasharray
               :stroke-dashoffset usernolan-svg-rect-dashoffset-stream!}]
       #js["rect"
           #js{:width             0.25
               :height            1
               :x                 0.625
               :y                 0.5
               :rx                0.5
               :ry                0.5
               :stroke-dasharray  usernolan-svg-circle-dasharray
               :stroke-dashoffset usernolan-svg-circle-dashoffset-stream!}]]))


(defn content [_ctx]
  #js["div.content" nil
      #js["button.show-controls" #js{:onclick show-controls!}
          (rd/$switch
           id-radio!
           identity
           #js{"usernolan" usernolan-svg-async
               "nm8"       nm8-svg-async
               "Oe"        Oe-svg-async
               "smixzy"    smixzy-svg-async}
           error-view-async)]
      (rd/$switch
       route!
       route-match-key-fn
       #js{"default-about" default-view-async
           "about"         about-component-async
           "quotes"        default-view-async
           "refs"          default-view-async
           "ref"           default-view-async
           "gallery"       default-view-async
           "gallery-item"  default-view-async}
       error-view-async)])

(defonce root-class-stream!
  (let [xf (xf/map (fn [x] (let [s (iter/join (obj/getValues x) " ")]
                             (str/buildString "root " s))))]
    (.transform radio-stream! xf
                #js{:closeOut rs/CloseMode.NEVER})))

(def root
  #js["div" #js{:class root-class-stream!}
      (controls nil)
      (content nil)])

(defn mount []
  (-> (rd/$compile root)
      (.mount (dom/getElement "app"))))

(defonce mount!
  (mount))

(defn ^:dev/after-load render []
  (dom/removeChildren (dom/getElement "app"))
  (mount))


(comment

  [:#default-polyline
   {:stroke-dasharray  "1.311 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311"
    :stroke-dashoffset "0"}]

  (defn lemniscate-point [t]
    (let [a      0.5
          sin_t  (Math/sin t)
          cos_t  (Math/cos t)
          sin_t2 (* sin_t sin_t)
          x      (/ (* a cos_t) (+ sin_t2 1))
          y      (/ (* a sin_t cos_t) (+ sin_t2 1))]
      #js[x y]))

  (def pts
    (let [pts (xf/transduce
               (xf/map lemniscate-point)
               (xf/push)
               (xf/range 0 (* 2 Math/PI) 0.1))]
      (.push pts (aget pts 0))
      pts))

  (def reactive-class
    (rs/reactive "default-polyline"))

  (defn usernolan-svg [_]
    #js["svg" #js{:width 250 :height 250 :viewBox "0 0 2.5 2.5"
                  :xmlns "http://www.w3.org/2000/svg"}
        #js["g" #js{:fill           "transparent"
                    :stroke         "black"
                    :stroke-width   "0.025px"
                    :stroke-linecap "round"}
            #js["polyline" #js{:id        (.deref reactive-class)
                               :points    pts
                               :transform "translate(1 1)"}]]])

  ;;;
  )

(comment

  (require
   '[goog.array :as arr]
   '[goog.dom :as dom]
   '[goog.functions :as fns]
   '[goog.object :as obj]
   '[goog.string :as str])

  (require
   '["@thi.ng/rstream" :as rs]
   '["@thi.ng/rdom" :as rd]
   '["@thi.ng/transducers" :as xf]
   '["@thi.ng/compose" :as cf]
   '["@thi.ng/hiccup" :as h]
   '["@thi.ng/router" :as router]
   '["@thi.ng/hiccup-svg" :as svg])


  ;;;
  ;;; NOTE: events, routing
  ;;;


  (.route router "/numis/about")

  (require
   '["gsap" :refer [gsap]]
   '["gsap/Flip" :refer [Flip]])

  (.registerPlugin gsap Flip)

  (defn animate-route [new-route]
    (let [state (.getState Flip ".flip")]
      (.route router new-route)
      (.from Flip #js{:duration 1
                      :ease     "power1.inOut"
                      :absolute true})))

  (animate-route "/nm8/gallery")

  (require '[goog.events :as events])

  (def t1 (events/EventTarget.))
  (.listen t1 "e1" (fn [e] (js/console.log "e1" e)))

  (def s1 (rs/fromEvent t1 "e1"))
  (def s2 (.transform s1 (xf/map (fn [e] (prn e)))))

  (.dispatchEvent t1 "e1")

  (def t2 (js/EventTarget.))
  (.addEventListener t2 "foo" (fn [e] (prn 2)))
  (.dispatchEvent t2 (js/Event. "foo"))
  (.dispatchEvent t2 (js/Event. "foo"))


  ;;;
  ;;; NOTE: svg
  ;;;


  (def dasharray-stream
    (-> (rs/fromRAF)
        (.transform
         (xf/map (fn [t] (* (mod t 250) 3.142))))))

  (def dasharray-stream2
    (-> dasharray-stream
        (.transform
         (xf/map (fn [x] (+ x 125))))))

  (defn lemniscate-point [t]
    (let [a      0.5
          sin_t  (Math/sin t)
          cos_t  (Math/cos t)
          sin_t2 (* sin_t sin_t)
          x      (/ (* a cos_t) (+ sin_t2 1))
          y      (/ (* a sin_t cos_t) (+ sin_t2 1))]
      #js [x y]))

  (* 4 1.85407)
  7.41629870920548767373540138878104018487039529408706762234371218

  (def pts
    (xf/transduce
     (xf/map lemniscate-point)
     (xf/push)
     (xf/range 0 (* 2 Math/PI) 0.1)))

  (.push pts (aget pts 0))

  (def pts
    (arr/forEach
     (arr/range 0 (* 2 Math/PI) 0.1)
     lemniscate-point))

  (def dasharray-stream3
    (-> (rs/fromRAF)
        (.transform
         (xf/map (fn [t] #js[(Math/random) (Math/random)])))))

  (def dasharray-stream4
    (-> (rs/fromRAF)
        (.transform
         (xf/map (fn [t] (mod (* t 0.05)
                              (/ (* 0.5 13.145)
                                 (Math/sqrt (* 2 Math/PI)))))))))

  (def r1
    (rs/reactive 0))

  (def dasharray-stream5
    (rs/tweenNumber r1 0 0.05))

  (defn svg []
    #js["svg" #js{:width            550 :height 500 :viewBox "0 0 5 5"
                  :xmlns            "http://www.w3.org/2000/svg"
                  #_#_:onmouseenter (fn [_] (if (identical? (.deref r1) 0)
                                              (.next r1 1.311)
                                              (.next r1 0)))
                  #_#_:onmouseout   (fn [_] (if (identical? (.deref r1) 0)
                                              (.next r1 1.311)
                                              (.next r1 0)))}
        #js["g" #js{:fill   "transparent"
                    :stroke "black" :stroke-width "0.01px" :stroke-linecap "round"}
            #js["polyline" #js{:points            pts
                               :transform         "translate(2.5 2.5)"
                               :stroke-dasharray  "1.311 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311"
                               :stroke-dashoffset (rs/tweenNumber r1 0 0.2)}]
              #_#js["circle"
                    #js{:cx               125
                        :cy               250
                        :r                125
                        :stroke-dasharray dasharray-stream}]
              #_#js["circle"
                    #js{:cx                375
                        :cy                250
                        :r                 125
                        :stroke-dasharray  dasharray-stream2
                        :stroke-dashoffset dasharray-stream2}]
              #_#js["path"
                    #js{:stroke-dasharray "0 200"
                        :transform        "translate(100 100)"
                        :d                "M82.08,47.71c8.07,47.11,77.77,42.78,79.15-5,0-.67,0-1.34,0-2s0-1.35,0-2c-1.38-47.78-71.08-52.11-79.15-5l-2.4,14C71.62,94.82,1.91,90.49.53,42.71c0-.67,0-1.34,0-2s0-1.35,0-2c1.38-47.78,71.09-52.11,79.15-5Z"}]
            ]])

  (defn svg []
    #js["svg" #js{:width 550 :height 500 :viewBox "0 0 5 5"
                  :xmlns "http://www.w3.org/2000/svg"}
        #js["g" #js{:fill           "transparent"
                    :stroke         "black"
                    :stroke-width   "0.01px"
                    :stroke-linecap "round"}
            #js["polyline" #js{:points            pts
                               :transform         "translate(2.5 2.5)"
                               :stroke-dasharray  "1.311 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311 0.0655 0.1311"
                               :stroke-dashoffset "0"}]]])


  (-> (rd/$compile (svg))
      (.mount
       (dom/getElement "app")))

  (.next r1 0)


  ;;;
  ;;; NOTE: $klist, filtering, sorting
  ;;;


  (def all-items
    #js[#js{:id "a" :tags #js["t1"]}
        #js{:id "b" :tags #js["t2"]}
        #js{:id "c" :tags #js["t1" "t3"]}])

  (def tag-stream
    (rs/reactive "t1"))

  (defn tag-filter [tag item]
    (-> item
        (obj/get "tags")
        (arr/contains tag)))

  (defn filter-items [tag]
    (let [f (goog/partial tag-filter tag)]
      (arr/filter all-items f)))

  (def gallery-preview-items-stream
    (.. tag-stream
        (transform (xf/map filter-items))))

  (defn tag-span [t]
    #js["span" #js{:style #js{:margin-right "5px"}} t])

  (defn tags [tags]
    (let [spans (arr/map tags tag-span)]
      (doto #js["p" nil]
        (arr/extend spans))))

  (defn preview-div [item]
    #js["div" nil
        #js["h1" nil (.-id item)]
        (tags (.-tags item))])

  (defn get-id [x]
    (obj/get x "id"))

  (defn component []
    (rd/$klist gallery-preview-items-stream
               "div"
               #js{:style #js{:margin "5px"}}
               preview-div
               get-id))

  (.. (rd/$compile (component))
      (mount
       (dom/getElement "app")))

  (.next tag-stream "t1")

  ;;;
  )

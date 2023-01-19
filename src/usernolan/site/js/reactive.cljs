(ns usernolan.site.js.reactive
  (:require
   [goog.array :as arr]
   [goog.dom :as dom]
   [goog.dom.classlist :as classlist]
   [goog.events :as events]
   [goog.events.EventType :as EventType]
   [goog.functions :as fn]
   [goog.iter :as iter]
   [goog.object :as obj]
   [goog.string :as str]
   [usernolan.site.js.reactive-vector-graphic :as rvg]
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

(defonce id-radio!
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

(defonce content-radio!
  (let [route (.. route! deref -id)
        init  (cond
                (identical? route "default-about") "about"
                (identical? route "ref")           "refs"
                (identical? route "gallery-item")  "gallery"
                true                               route)]
    (rs/reactive init)))

(defn id-radio-onchange-fn [id e]
  (let [content (.deref content-radio!)
        route   (str "#/" id "/" content)]
    (.routeTo router route)))

(defn content-radio-onchange-fn [content e]
  (let [id    (.deref id-radio!)
        route (str "#/" id "/" content)]
    (.routeTo router route)))

(def mode-radio-data
  #js[#js{:id    "mode-radio-system"
          :value "system"}

      #js{:id    "mode-radio-light"
          :value "light"}

      #js{:id    "mode-radio-dark"
          :value "dark"}])

(defonce mode-radio!
  ;; TODO: query params
  (let [init (.-value (aget mode-radio-data 0))]
    (rs/reactive init)))

(def filter-radio-data
  #js[#js{:id    "filter-not-always-gray"
          :value "notalwaysgray"}

      #js{:id    "filter-always-gray"
          :value "alwaysgray"}])

(defonce filter-radio!
  ;; TODO: query params
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
        i (.-id x) ; TODO: fallback id
        v (.-value x)
        r (.-reactive spec)
        c (.transform r (xf/map (fn [x] (identical? x v))) #js{:closeOut rs/CloseMode.NEVER})
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
                   true                                 route-id)
        id       (if default? "usernolan" (.. x -params -id))]
    (when-not (identical? (.deref content-radio!) content)
      (.next content-radio! content))
    (when-not (identical? (.deref id-radio!) id)
      (.next id-radio! id))))

(defonce route-stream!
  (.transform route! (xf/map route-stream-fn)
              #js{:closeOut rs/CloseMode.NEVER}))

(defn controls [_ctx]
  #js["div.site-controls" nil
      #js["div.top-site-controls" nil
          (radio-component id-radio-spec)
          (radio-component mode-radio-spec)
          (radio-component filter-radio-spec)]
      #js["div.bottom-site-controls" nil
          (radio-component content-radio-spec)]])

(defn show-controls! [e]
  (when-let [el (dom/getAncestorByClass (.-target e) "content")]
    ;; TODO: dynamic top+left/transform dynamic
    ;; NOTE: mobile vs. desktop
    ;; NOTE: clientY of filter//last "bottom" of radios
    ;; NOTE: clientX of links
    (classlist/toggle el "show-site-controls")))

(defonce fromRAF!
  (rs/fromRAF))

(defonce system-mode!
  (let [match? (.. js/window (matchMedia "(prefers-color-scheme: dark)") -matches)
        init   (if match? "dark" "light")]
    (rs/reactive init)))

(defonce register-system-mode-listener!
  (let [match (js/window.matchMedia "(prefers-color-scheme: dark)")]
    (.addEventListener match "change"
                       (fn [^js e]
                         (let [mode (if (.-matches e) "dark" "light")]
                           (.next system-mode! mode))))))

(defonce mode!
  (let [r  (rs/sync #js{:src #js{:system system-mode! :radio mode-radio!}})
        xf (xf/map (fn [^js x]
                     (if (identical? (.-radio x) "system")
                       (.-system x)
                       (.-radio x))))]
    (.transform r xf #js{:closeOut rs/CloseMode.NEVER})))

(def svg-primary
  (rvg/make-svg
   #js{:t      fromRAF!
       :id     id-radio!
       :mode   mode!
       :filter filter-radio!}))

(defn page-controls [_attrs]
  #js["div.page-controls-container" nil
      #js["div.page-controls" nil
          #js["button.show-site-controls" #js{:onclick show-controls!}
              (.-component svg-primary)]]])

(def about-component-async
  (dfm/defmulti
    (fn [route-match]
      (.. route-match -params -id))))

(defn usernolan-about-component-async [_route-match]
  (js/Promise.resolve
   #js["div" #js{:class "about-container"}
       #js["main" nil
           #js["p" nil "I'm nolan. I've been called a reflector."]
           #js["p" nil "This is where I wildly overshare on the internet,"]
           #js["p" nil "so feel free to click around and learn more."]]]))

(defn nm8-about-component-async [_route-match]
  (js/Promise.resolve
   #js["div" #js{:class "about-container"}
       #js["main" nil
           #js["p" nil "Bummer that this site uses javascript"]
           #_#js["p" nil "Perpetual healthy dissatisfaction"]
           #_#js["p" nil "Post-it™ notes"]
           ]]))

(defn Oe-about-component-async [_route-match]
  (js/Promise.resolve
   #js["div" #js{:class "about-container"}
       #js["main" nil
           #js["p" nil "Observe ∘ Explicate"]
           #js["p" nil "Language, logic, proof, etc."]
           #js["p" nil "Abstract machines"]
           #js["p" nil "Process"]]]))

(defn smixzy-about-component-async [_route-match]
  (js/Promise.resolve
   #js["div" #js{:class "about-container"}
       #js["main" nil
           #js["p" nil "Nonsense"]
           #js["p" nil "acrylic"]
           #js["p" nil "handmade"]
           #js["p" nil "Lv. 60 arcane mage"]]]))

(.addAll about-component-async
         #js{"usernolan" usernolan-about-component-async
             "nm8"       nm8-about-component-async
             "Oe"        Oe-about-component-async
             "smixzy"    smixzy-about-component-async})

(defn route-match-key-fn [route-match]
  (.-id route-match))

(defn error-view-async [err]
  (js/Promise.resolve
   #js["h1" #js{:style #js{:color "red"}} err]))

(defn content [_ctx]
  #js["div.content" nil
      (page-controls nil)
      (rd/$switch
       route!
       route-match-key-fn
       #js{"default-about" usernolan-about-component-async ; ALT: add default impl to dfm
           "about"         about-component-async
           #_#_"quotes"       nil
           #_#_"refs"         nil
           #_#_"ref"          nil
           #_#_"gallery"      nil
           #_#_"gallery-item" nil}
       error-view-async)])

(defonce root-class-stream!
  (let [r  (rs/sync #js{:src #js{:id      id-radio!
                                 :content content-radio!
                                 :mode    mode!
                                 :filter  filter-radio!}})
        xf (xf/map (fn [x] (let [s (iter/join (obj/getValues x) " ")]
                             (str/buildString "root " s))))]
    (.transform r xf #js{:closeOut rs/CloseMode.NEVER})))

;; TODO: refactor
(def root
  #js["div" #js{:class root-class-stream!}
      (controls nil)
      (content nil)])

(defn mount []
  (let [c  (rd/$compile root)
        el (dom/getElement "app")]
    (.mount c el)))

;; TODO: init, defaults
;; NOTE: read env; query params, system mode
;; NOTE: zoom level

(defonce mount!
  (mount))

(defn ^:dev/after-load render []
  (dom/removeChildren (dom/getElement "app"))
  (mount))


;; NOTE: zoomable grid


#_(defonce zoom-level!
  (rs/reactive 7))

#_(defonce sqd!
  (rs/reactive 0))

#_(defonce sqd-str!
  (.transform sqd! (xf/map (fn [x] (str x "px")))))

#_(defn make-squares []
  (doto #js["div.squares" nil]
    (arr/extend
        (arr/map
         (arr/range 70)
         (fn [i]
           #js["div" #js{:class (str "square sq" i)
                         :style #js{:width sqd-str! :height sqd-str!}}
               #js["div" nil (str i)]])))))

;; TODO: values.cljc?
#_(def gap 5)

#_(defn set-zoom [n e]
  (when-let [^js el (dom/getElementByClass "squares")]
    (let [container-width (.-clientWidth el)
          d               (/ (- container-width (* n gap)) n)
          #_#_squares     (dom/getElementsByClass "square")]
      (.next sqd! d)
      #_(arr/forEach
       squares
       (fn [^js square]
         (set! (.. square -style -width) (str d "px"))
         (set! (.. square -style -height) (str d "px")))))))

#_(defonce resize-listener!
  (events/listen js/window EventType/RESIZE
                 (fn/debounce
                  (fn [_e]
                    (set-zoom (.deref zoom-level!) nil))
                  500)))

#_(def zoomable-grid-spec1
  #js{:component #js["div.squares" nil]
      :data      #js[,,,]
      }
  )

#_(defn make-zoomable-grid [^js spec]
  #js{:grid (doto (.-component spec)
              (arr/extend
                  (arr/map
                   (.-data spec)
                   (.-f spec))))
      :zoom nil})

#_(defn squares-component []
  #js["div.squares-container" nil
      (make-squares)]
  #js["div.zoom-control-container" nil
      #js["div.zoom-control" nil
          #js["button" #js{:onclick (goog/partial set-zoom 7)} "7x"]
          #js["button" #js{:onclick (goog/partial set-zoom 5)} "5x"]
          #js["button" #js{:onclick (goog/partial set-zoom 3)} "3x"]
          #js["button" #js{:onclick (goog/partial set-zoom 1)} "1x"]]])

#_(defonce radio-stream!
  (rs/sync #js{:src #js{:id      id-radio!
                        :content content-radio!
                        :mode    mode-radio!
                        :filter  filter-radio!}}))


;; NOTE: debug


#_(defonce debug-stream!
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

#_(defn debug-component [attrs]
  #js["div.debug" attrs
      #js["p" nil debug-stream!]])


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
   '[goog.functions :as fn]
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

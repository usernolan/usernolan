(ns usernolan.site.js.reactive
  (:refer-clojure :exclude [map])
  (:require
   [goog.array :as arr]
   [goog.dom :as dom]
   [goog.dom.classlist :as classlist]
   [goog.functions :as fns]
   [goog.object :as obj]
   [goog.string :as str]
   ["gsap" :refer [gsap]]
   ["gsap/Flip" :refer [Flip]]
   ["@thi.ng/compose" :as cf]
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

      #js{:id    "default-refs"
          :match #js["refs"]}

      #js{:id    "default-ref"
          :match #js["ref" "?ref-id"]}

      #js{:id    "default-gallery"
          :match #js["gallery"]}

      #js{:id    "default-gallery-item"
          :match #js["gallery" "?item-id"]}

      #js{:id    "about"
          :match #js["?id" "about"]}

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

(def route!
  (rs/reactive (.-current router)))

(defonce router-stream
  (.addListener router router/EVENT_ROUTE_CHANGED
                (fn [e]
                  (js/console.log e)
                  (.next route! (.-value e)))))

(defonce register-gsap-plugins!
  (.registerPlugin gsap Flip))

(defn route-match-key-fn [route-match]
  (.-id route-match))

(defn default-view-async [route-match]
  (js/Promise.resolve
   #js["div" nil
       #js["button" nil "controls"]
       #js["h1" nil (js/JSON.stringify route-match)]]))

(defn error-view-async [err]
  (js/Promise.resolve
   #js["h1" #js{:style #js{:color "red"}} err]))

(def id-radio-data
  #js[#js{:id    "id-radio-usernolan"
          :value "usernolan"
          :label "usernolan"}

      #js{:id    "id-radio-nm8"
          :value "nm8"
          :label "nm8"}

      #js{:id    "id-radio-oe"
          :value "observer.explicator"
          :label "Oe"}

      #js{:id    "id-radio-numis"
          :value "numis"
          :label "numis"}])

(defn id-radio-div [x]
  #js["div" nil
      #js["input" #js{:type "radio" :name "id-radio" :id (.-id x) :value (.-value x)}]
      #js["label" #js{:for (.-id x)} (or (.-label x) (.-value x))]])

(defn id-radio-nav [attrs xs]
  (doto #js["nav.control.id-radio" attrs]
    (arr/extend
        (arr/map xs id-radio-div))))

(def mode-radio-data
  #js[#js{:id    "mode-system"
          :value "system"}
      #js{:id    "mode-light"
          :value "light"}
      #js{:id    "mode-dark"
          :value "dark"}])

(defn mode-radio-div [x]
  #js["div" nil
      #js["input" #js{:type "radio" :name "mode-radio" :id (.-id x) :value (.-value x)}]
      #js["label" #js{:for (.-id x)} (or (.-label x) (.-value x))]])

(defn mode-radio-section [attrs xs]
  (doto #js["section.control.mode-radio" attrs]
    (arr/extend
        (arr/map xs mode-radio-div))))

(def filter-radio-data
  #js[#js{:id    "filter-not-always-gray"
          :value "notalwaysgray"}
      #js{:id    "filter-always-gray"
          :value "alwaysgray"}
      #js{:id    "filter-roy"
          :value "roy"}])

(defn filter-radio-div [x]
  #js["div" nil
      #js["input" #js{:type "radio" :name "filter-radio" :id (.-id x) :value (.-value x)}]
      #js["label" #js{:for (.-id x)} (or (.-label x) (.-value x))]])

(defn filter-radio-section [attrs xs]
  (doto #js["section.control.filter-radio" attrs]
    (arr/extend
        (arr/map xs filter-radio-div))))

(def content-radio-data
  #js[#js{:id    "content-about"
          :value "about"}
      #js{:id    "content-references"
          :value "refs"}
      #js{:id    "content-gallery"
          :value "gallery"}
      #_#js{:id    "content-contact"
            :value "contact"}])

(defn content-radio-div [x]
  #js["div" nil
      #js["input" #js{:type "radio" :name "content-radio" :id (.-id x) :value (.-value x)}]
      #js["label" #js{:for (.-id x)} (or (.-label x) (.-value x))]])

(defn content-radio-nav [attrs xs]
  (doto #js["nav.control.content-radio" attrs]
    (arr/extend
        (arr/map xs content-radio-div))))

;; TODO: default route
;; TODO: control grid(s)
;; TODO: radio onclick, choices<>route
;; TODO: radio defaults, state

(defn controls [_ctx]
  #js["div.controls" nil
      #js[id-radio-nav nil id-radio-data]
      #js[mode-radio-section nil mode-radio-data]
      #js[filter-radio-section nil filter-radio-data]
      #js[content-radio-nav nil content-radio-data]])

(defn show-controls! [e]
  (js/console.log e)
  (when-let [el (dom/getAncestorByClass (.-target e) "content")]
    ;; TODO: dynamic top+left/transform dynamic
    ;; NOTE: mobile vs. desktop
    ;; NOTE: clientY of filter//last "bottom" of radios
    ;; NOTE: clientX of links
    (classlist/toggle el "show-controls")))

(defn default-about-async [route-match]
  (js/Promise.resolve
   #js["div" #js{:class "about"}
       #js["button" #js{:onclick show-controls!} "show controls"]
       #js["h1" nil (js/JSON.stringify route-match)]]))

(defn content [_ctx]
  #js["div.content" nil
      (rd/$switch
       route!
       route-match-key-fn
       #js{"default-about"        default-about-async
           "default-refs"         default-view-async
           "default-ref"          default-view-async
           "default-gallery"      default-view-async
           "default-gallery-item" default-view-async
           "about"                default-view-async
           "refs"                 default-view-async
           "ref"                  default-view-async
           "gallery"              default-view-async
           "gallery-item"         default-view-async}
       error-view-async)])

(def root
  #js["div.root" nil
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

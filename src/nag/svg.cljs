(ns nag.svg
  (:require-macros [hiccups.core :as hiccups])
  (:require
   [goog.dom :as dom]
   [hiccups.runtime]
   [reagent.core :as r]
   [thi.ng.geom.svg.renderer :as geom.svg.renderer]
   [thi.ng.geom.svg.adapter :as geom.svg.adapter]
   [thi.ng.geom.svg.shaders :as geom.svg.shaders]
   [thi.ng.geom.svg.core :as geom.svg]
   [thi.ng.geom.polyhedra :as geom.polyhedra]
   [thi.ng.geom.matrix :as geom.matrix]
   [thi.ng.geom.sphere :as geom.sphere]
   [thi.ng.geom.core :as geom]
   [thi.ng.math.core :as geom.math]))

(def num-frames  420)
(def frame-clock (range 0 geom.math/TWO_PI (/ geom.math/TWO_PI num-frames)))
(def frame-ratom (r/atom 0))

(defn start!
  []
  (js/setInterval
   (fn []
     (swap! frame-ratom
            (fn [frame]
              (mod (inc frame)
                   (count frame-clock)))))
   42))

(defonce animation-interval-atom
  (atom nil))

(defn stop!
  []
  (js/console.log "stop!")
  (swap! animation-interval-atom (fn [a] (js/clearInterval a) nil)))

(defn restart!
  []
  (js/console.log "restart!")
  (swap! animation-interval-atom (fn [a] (or a (start!)))))

(defn generate-frames
  [{:keys [mesh model view proj viewport-matrix shader]}]
  (map (fn [rotation]
         (geom.svg.renderer/mesh
          mesh
          (->>
           (geom/rotate-y model rotation)
           (geom.math/* view)
           (geom.math/* proj))
          viewport-matrix
          shader))
       frame-clock))

(defn render
  [{:keys [width height]}
   & scene]
  (apply geom.svg/svg
         {:width width :height height}
         scene))

(def shader
  (geom.svg.shaders/shader
   {:fill     [0 0 0 0]
    :flags    {:solid true}
    :uniforms {:stroke       "#0000ff"
               :stroke-width 2}}))

(def mesh
  (geom.polyhedra/polyhedron-mesh
   geom.polyhedra/icosahedron))

(defn default-opts
  [& [{:keys [width height]
       :or   {width 640 height 480}}]]
  {:width           width
   :height          height
   :model           (geom.matrix/matrix44)
   :view            (->>
                     (geom.matrix/look-at-vectors 2.5 1.5 2.5 0 0 0)
                     (apply geom.matrix/look-at))
   :proj            (geom.matrix/perspective 60 (/ width height) 0.1 10)
   :viewport-matrix (geom.matrix/viewport-matrix width height)
   :shader          shader})

(defn frames
  [opts]
  (mapv (fn [a b] (hiccups/html a b))
        (generate-frames
         (merge (default-opts)
                opts
                {:mesh   mesh
                 :shader shader}))))

(defonce lazy-frames
  (delay (frames
          (if (> (.-width (dom/getViewportSize)) 1000)
            (default-opts)
            (default-opts
             {:height (.-width (dom/getViewportSize))
              :width  (.-width (dom/getViewportSize))})))))

(defn component
  []
  (r/create-class
   {:component-did-mount    restart!
    :component-will-unmount stop!
    :reagent-render
    (fn []
      [:svg
       {"xmlns"                  "http://www.w3.org/2000/svg"
        "xmlnsXlink"             "http://www.w3.org/1999/xlink"
        "version"                "1.1"
        :dangerouslySetInnerHTML {:__html (@lazy-frames @frame-ratom)}
        :height                  480
        :width                   640}])}))

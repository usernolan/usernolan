(ns nag.webgl
  (:require
   [thi.ng.geom.gl.shaders.phong :as gl.shaders.phong]
   [thi.ng.geom.gl.webgl.constants :as gl.constants]
   [thi.ng.geom.gl.webgl.animator :as gl.animator]
   [thi.ng.geom.polyhedra :as geom.polyhedra]
   [thi.ng.geom.gl.shaders :as gl.shaders]
   [thi.ng.geom.gl.camera :as gl.camera]
   [thi.ng.geom.sphere :as geom.sphere]
   [thi.ng.geom.matrix :as geom.matrix]
   [thi.ng.geom.vector :as geom.vector]
   [thi.ng.geom.gl.glmesh :as gl.mesh]
   [thi.ng.color.core :as geom.color]
   [thi.ng.geom.aabb :as geom.aabb]
   [thi.ng.geom.gl.core :as gl]
   [thi.ng.geom.core :as geom]
   [reagent.core :as r]
   [goog.object :as obj]))

(defn rand-id
  []
  (str "id" (rand-int js/Number.MAX_SAFE_INTEGER)))

(def icosahedron-mesh
  (geom.polyhedra/polyhedron-mesh
   geom.polyhedra/icosahedron
   {:mesh (gl.mesh/gl-mesh 20 #{:fnorm})}))

(defn model
  [{:keys [gl-context
           perspective
           shader
           mesh
           uniforms
           state]
    :or   {state #js {}}}]
  (->
   (gl/as-gl-buffer-spec mesh {})
   (gl.camera/apply perspective)
   (assoc :shader shader)
   (update :uniforms merge uniforms)
   (gl/make-buffers-in-spec
    gl-context
    gl.constants/static-draw)
   (merge {:state state})))

(defn draw-model
  [{:keys [time state]}]
  (->
   geom.matrix/M44
   (geom/translate
    (geom.vector/vec3
     (obj/get state "x")
     (obj/get state "y")
     (obj/get state "z")))
   (geom/scale
    (max
     (obj/get state "scale")
     0.000001))
   (geom/rotate-y time)))

(defn animate!
  [{:keys [gl-context models]}]
  (let [viewport-rect
        (gl/get-viewport-rect gl-context)

        perspective
        (gl.camera/perspective-camera
         {:aspect viewport-rect})

        shader
        (gl.shaders/make-shader-from-spec
         gl-context
         gl.shaders.phong/shader-spec)

        opts
        {:gl-context    gl-context
         :viewport-rect viewport-rect
         :perspective   perspective
         :shader        shader}

        models
        (map (comp model (partial merge opts)) models)]

    (gl.animator/animate
     (fn [t _]
       (doto gl-context
         (gl/set-viewport viewport-rect)
         (gl/clear-color-and-depth-buffer
          (geom.color/->RGBA 0 0 0 0) 1)
         (gl/enable gl.constants/depth-test))

       (doseq [model models]
         (gl/draw-with-shader
          gl-context
          (assoc-in model
                    [:uniforms :model]
                    (draw-model (merge model {:time t})))))

       true))))

(defn canvas-component
  [{:keys [id height width]
    :or   {id (rand-id)}}]
  (r/create-class
   {:component-did-mount
    (fn []
      (animate!
       {:gl-context (gl/gl-context id)
        :models     [{:mesh     icosahedron-mesh
                      :uniforms {:ambientCol    0x000000
                                 :diffuseCol    0x303030
                                 :specularCol   0xffffff
                                 :lightPos      (geom.vector/vec3 2 0.66 2)
                                 :shininess     100
                                 :wrap          0
                                 :useBlinnPhong true}
                      :state    #js {:scale 0.42
                                     :x     0
                                     :y     0
                                     :z     0}}]}))

    :reagent-render
    (fn []
      (let [dpr (or js/window.devicePixelRatio 1)]
        [:canvas
         {:id     id
          :style  {:height (str height "px")
                   :width  (str width "px")}
          :height (* height dpr)
          :width  (* width dpr)}]))}))

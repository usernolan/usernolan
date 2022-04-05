(ns usernolan.site.js.reactive-vector-graphic
  (:require
   [goog.array :as arr]
   [goog.dom :as dom]
   [goog.dom.classlist :as classlist]
   [goog.events :as events]
   [goog.events.EventType :as EventType]
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

(def frames 240)

(defn usernolan-dasharray [perimeter ndash]
  (let [half     (/ perimeter 2.0)
        dash     (/ half ndash)
        line-str (str half " ")
        dash-str (str/repeat (str dash " ") ndash)]
    (str/buildString line-str dash-str)))

(def usernolan-rect1-dasharray-15
  (usernolan-dasharray (* 1.25 4) 15))

(def usernolan-rect2-dasharray-13
  (usernolan-dasharray (* Math/PI 1.25) 13))

(def usernolan-frame (/ (* 4 1.25) frames))

(defn width1-f [^js x]
  (case (.-id x)
    "usernolan" 1.25
    "nm8"       1
    "Oe"        (if (.-mouseover x) 1.5 1.25)
    "smixzy"    (if (.-mouseover x) 2 0.5)))

(defn width2-f [^js x]
  (case (.-id x)
    "usernolan" 1.25
    "nm8"       1
    "Oe"        (if (.-mouseover x) 0.75 1)
    "smixzy"    1.5))

(defn height1-f [^js x]
  (case (.-id x)
    "usernolan" 1.25
    "nm8"       1
    "Oe"        (if (.-mouseover x) 1.5 1.25)
    "smixzy"    (if (.-mouseover x) 0.5 1.5)))

(defn height2-f [^js x]
  (case (.-id x)
    "usernolan" 1.25
    "nm8"       1
    "Oe"        (if (.-mouseover x) 0.75 1)
    "smixzy"    (if (.-mouseover x) 1.5 0.5)))

(defn x1-f [^js x]
  (case (.-id x)
    "usernolan" 0.12915
    "nm8"       0.265
    "Oe"        (cond
                  (.-mouseover x) 0.75
                  (.-toggle x)    1.55415
                  true            0.12915)
    "smixzy"    (cond
                  (.-mouseover x) 0.5
                  (.-toggle x)    1.25
                  true            1.25)))

(defn x2-f [^js x]
  (case (.-id x)
    "usernolan" 1.55415
    "nm8"       1.679213562373095
    "Oe"        (cond
                  (.-mouseover x) 1.125
                  (.-toggle x)    0.37915
                  true            1.55415)
    "smixzy"    0.75))

(defn y1-f [^js x]
  (case (.-id x)
    "usernolan" (cond
                  (.-mouseover x) 0.375
                  (.-toggle x)    0.675
                  true            0.025)
    "nm8"       0.525
    "Oe"        (if (.-mouseover x) 0.25 0.375)
    "smixzy"    (if (.-mouseover x) 0.75 0.25)))

(defn y2-f [^js x]
  (case (.-id x)
    "usernolan" (cond
                  (.-mouseover x) 0.375
                  (.-toggle x)    0.025
                  true            0.675)
    "nm8"       0.525
    "Oe"        (if (.-mouseover x) 0.625 0.5)
    "smixzy"    (if (.-mouseover x) 0.25 0.75)))

(defn rx1-f [^js x]
  (case (.-id x)
    "usernolan" 0
    "nm8"       0
    "Oe"        1
    "smixzy"    1))

(defn rx2-f [^js x]
  (case (.-id x)
    "usernolan" 1
    "nm8"       0
    "Oe"        1
    "smixzy"    1))

(defn ry1-f [^js x]
  (case (.-id x)
    "usernolan" 0
    "nm8"       0
    "Oe"        1
    "smixzy"    1))

(defn ry2-f [^js x]
  (case (.-id x)
    "usernolan" 1
    "nm8"       0
    "Oe"        1
    "smixzy"    1))

(defn dasharray1-f [^js x]
  (case (.-id x)
    "usernolan" usernolan-rect1-dasharray-15
    "nm8"       "4"
    "Oe"        (if (.-mouseover x)
                  "2.356194490192345"
                  "1.9634954084936207")
    "smixzy"    "0.125"))

(defn dasharray2-f [^js x]
  (case (.-id x)
    "usernolan" usernolan-rect2-dasharray-13
    "nm8"       "4"
    "Oe"        (if (.-mouseover x)
                  "1.1780972450961724"
                  "1.5707963267948966")
    "smixzy"    "0"))

(defn dashoffset1-f [^js x]
  (case (.-id x)
    "usernolan" (cond
                  (.-mouseover x) (* (mod (.-t x) frames) usernolan-frame)
                  (.-toggle x)    0.625 ; (* 1.25 0.5)
                  true            -1.875) ; (* 1.25 -1.5)
    "nm8"       (cond
                  (.-mouseover x) (* (mod (.-t x) 240) 0.03333333333333333)
                  (.-toggle x)    -0.5
                  true            0.5)
    "Oe"        (cond
                  (.-mouseover x) (+ (* (mod (.-t x) 240) 0.039269908169872414) 1.1780972450961724)
                  (.-toggle x)    1.9634954084936207
                  true            0)
    "smixzy"    (if (.-mouseover x)
                  (* (mod (.-t x) 240) 0.0357434421)
                  (* (mod (.-t x) 240) 0.027843527583333336))))

(defn dashoffset2-f [^js x]
  (case (.-id x)
    "usernolan" (cond
                  (.-mouseover x) (* (mod (.-t x) 240) -0.016362461737446838) ; (/ (* Math/PI 1.25) 240)
                  (.-toggle x)    -0.9817477042468103 ; (/ (* Math/PI 1.25) 4)
                  true            0.9817477042468103)
    "nm8"       (cond
                  (.-mouseover x) (+ (* (mod (.-t x) 240) -0.03333333333333333) 4)
                  (.-toggle x)    -0.5
                  true            0.5)
    "Oe"        (cond
                  (.-mouseover x) (+ (* (mod (.-t x) 240) -0.019634954084936207) 0.5890486225480862)
                  (.-toggle x)    0
                  true            1.5707963267948966)
    "smixzy"    0))

(defn rot1-f [^js x]
  (case (.-id x)
    "usernolan" 0
    "nm8"       135
    "Oe"        0
    "smixzy"    (cond
                  (.-mouseover x) 0
                  (.-toggle x)    135
                  true            0)))

(defn rot2-f [^js x]
  (case (.-id x)
    "usernolan" 0
    "nm8"       -45
    "Oe"        0
    "smixzy"    (if (.-toggle x) 135 0)))

(def css-rotation-xf
  (let [f (fn [x] (str "rotate(" x "deg)"))]
    (xf/map f)))

(defn make-svg [signals]
  (let [mouseover!   (rs/reactive false)
        toggle!      (rs/reactive false)
        signals      (js/Object.assign signals #js{:mouseover mouseover!
                                                   :toggle    toggle!})
        state!       (rs/sync #js{:src signals})
        onmouseover  (fn [_e] (.next mouseover! true))
        onmouseout   (fn [_e] (.next mouseover! false))
        onclick      (fn [_e]
                       (js/setTimeout onmouseout 80)
                       (.next toggle!
                              (not (.deref toggle!))))
        width1!      (.transform state! (xf/map width1-f) #js{:closeOut rs/CloseMode.NEVER})
        width2!      (.transform state! (xf/map width2-f) #js{:closeOut rs/CloseMode.NEVER})
        height1!     (.transform state! (xf/map height1-f) #js{:closeOut rs/CloseMode.NEVER})
        height2!     (.transform state! (xf/map height2-f) #js{:closeOut rs/CloseMode.NEVER})
        x1!          (.transform state! (xf/map x1-f) #js{:closeOut rs/CloseMode.NEVER})
        x2!          (.transform state! (xf/map x2-f) #js{:closeOut rs/CloseMode.NEVER})
        y1!          (.transform state! (xf/map y1-f) #js{:closeOut rs/CloseMode.NEVER})
        y2!          (.transform state! (xf/map y2-f) #js{:closeOut rs/CloseMode.NEVER})
        rx1!         (.transform state! (xf/map rx1-f) #js{:closeOut rs/CloseMode.NEVER})
        rx2!         (.transform state! (xf/map rx2-f) #js{:closeOut rs/CloseMode.NEVER})
        ry1!         (.transform state! (xf/map ry1-f) #js{:closeOut rs/CloseMode.NEVER})
        ry2!         (.transform state! (xf/map ry2-f) #js{:closeOut rs/CloseMode.NEVER})
        dasharray1!  (.transform state! (xf/map dasharray1-f) #js{:closeOut rs/CloseMode.NEVER})
        dasharray2!  (.transform state! (xf/map dasharray2-f) #js{:closeOut rs/CloseMode.NEVER})
        dashoffset1! (.transform state! (xf/map dashoffset1-f) #js{:closeOut rs/CloseMode.NEVER})
        dashoffset2! (.transform state! (xf/map dashoffset2-f) #js{:closeOut rs/CloseMode.NEVER})
        rot1!        (.transform state! (xf/map rot1-f) #js{:closeOut rs/CloseMode.NEVER})
        rot2!        (.transform state! (xf/map rot2-f) #js{:closeOut rs/CloseMode.NEVER})
        component    #js["svg"
                         #js{:xmlns       "http://www.w3.org/2000/svg"
                             :viewBox     "0 0 3 2"
                             :onmouseover onmouseover
                             :onmouseout  onmouseout
                             :onclick     onclick}
                         #js["rect"
                             #js{:width             (rs/tweenNumber width1! (.deref width1!) 0.25)
                                 :height            (rs/tweenNumber height1! (.deref height1!) 0.25)
                                 :x                 (rs/tweenNumber x1! (.deref x1!) 0.25)
                                 :y                 (rs/tweenNumber y1! (.deref y1!) 0.25)
                                 :rx                (rs/tweenNumber rx1! (.deref rx1!) 0.25)
                                 :ry                (rs/tweenNumber ry1! (.deref ry1!) 0.25)
                                 :stroke-dasharray  dasharray1!
                                 :stroke-dashoffset dashoffset1!
                                 :style             #js{:transform
                                                        (-> (rs/tweenNumber rot1! (.deref rot1!) 0.25)
                                                            (.transform css-rotation-xf))}}]
                         #js["rect"
                             #js{:width             (rs/tweenNumber width2! (.deref width2!) 0.25)
                                 :height            (rs/tweenNumber height2! (.deref height2!) 0.25)
                                 :x                 (rs/tweenNumber x2! (.deref x2!) 0.25)
                                 :y                 (rs/tweenNumber y2! (.deref y2!) 0.25)
                                 :rx                (rs/tweenNumber rx2! (.deref rx2!) 0.25)
                                 :ry                (rs/tweenNumber ry2! (.deref ry2!) 0.25)
                                 :stroke-dasharray  dasharray2!
                                 :stroke-dashoffset dashoffset2!
                                 :style             #js{:transform
                                                        (-> (rs/tweenNumber rot2! (.deref rot2!) 0.25)
                                                            (.transform css-rotation-xf))}}]]]

    #js{:mouseover   mouseover!
        :toggle      toggle!
        :state       state!
        :width1      width1!
        :width2      width2!
        :height1     height1!
        :height2     height2!
        :x1          x1!
        :x2          x2!
        :y1          y1!
        :y2          y2!
        :rx1         rx1!
        :rx2         rx2!
        :ry1         ry1!
        :ry2         ry2!
        :dasharray1  dasharray1!
        :dasharray2  dasharray2!
        :dashoffset1 dashoffset1!
        :dashoffset2 dashoffset2!
        :rot1        rot1!
        :rot2        rot2!
        :component   component}))

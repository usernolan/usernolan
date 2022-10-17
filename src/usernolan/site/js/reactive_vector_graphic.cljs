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

(def usernolan-rect-size 100)

(def usernolan-rect1-dasharray-15
  (usernolan-dasharray (* usernolan-rect-size 4) 15))

(def usernolan-rect2-dasharray-13
  (usernolan-dasharray (* Math/PI usernolan-rect-size) 13))

(def usernolan-frame (/ (* 4 usernolan-rect-size) frames))

;; ALT: values.cljc?
(def stroke-width 5.6)

(defn width1-f [^js x]
  (case (.-id x)
    "usernolan" 100
    "nm8"       66
    "Oe"        (if (.-mouseover x) 66 100)
    "smixzy"    (if (.-mouseover x) 200 50)))

(defn width2-f [^js x]
  (case (.-id x)
    "usernolan" 100
    "nm8"       66
    "Oe"        (if (.-mouseover x) 66 100)
    "smixzy"    150))

(defn height1-f [^js x]
  (case (.-id x)
    "usernolan" 100
    "nm8"       66
    "Oe"        (if (.-mouseover x) 66 100)
    "smixzy"    (if (.-mouseover x) 50 150)))

(defn height2-f [^js x]
  (case (.-id x)
    "usernolan" 100
    "nm8"       66
    "Oe"        (if (.-mouseover x) 66 100)
    "smixzy"    (if (.-mouseover x) 150 50)))

(defn x1-f [^js x]
  (case (.-id x)
    "usernolan" 2.8 ; (/ stroke-width 2)
    "nm8"       101.8
    "Oe"        (cond
                  (.-mouseover x) 19.46
                  (.-toggle x)    2.8
                  true            2.8)
    "smixzy"    (cond
                  (.-mouseover x) 2.8
                  true            52.8)))

(defn x2-f [^js x]
  (case (.-id x)
    "usernolan" 121.4 ; (+ usernolan-rect-size 0.2 (/ stroke-width 4))
    "nm8"       2.8
    "Oe"        (cond
                  (.-mouseover x) 19.46 ; (+ 0.028 0.1666)
                  true            2.8)
    "smixzy"    (cond
                  (.-mouseover x) 27.8 ; (+ 0.25 0.028)
                  true            2.8)))

(defn y1-f [^js x]
  (case (.-id x)
    "usernolan" 2.8 ; (/ stroke-width 2)
    "nm8"       2.8
    "Oe"        (if (.-mouseover x) 19.46 2.8)
    "smixzy"    (if (.-mouseover x) 52.8 2.8)))

(defn y2-f [^js x]
  (case (.-id x)
    "usernolan" 2.8 ; (/ stroke-width 2)
    "nm8"       2.8
    "Oe"        (if (.-mouseover x) 19.46 2.8)
    "smixzy"    (if (.-mouseover x) 2.8 52.8)))

(defn rx1-f [^js x]
  (case (.-id x)
    "usernolan" 0
    "nm8"       100
    "Oe"        100
    "smixzy"    100))

(defn rx2-f [^js x]
  (case (.-id x)
    "usernolan" 100
    "nm8"       100
    "Oe"        100
    "smixzy"    100))

(defn ry1-f [^js x]
  (case (.-id x)
    "usernolan" 0
    "nm8"       100
    "Oe"        100
    "smixzy"    100))

(defn ry2-f [^js x]
  (case (.-id x)
    "usernolan" 100
    "nm8"       100
    "Oe"        100
    "smixzy"    100))

;; TODO: refactor "state"?
(defn fill1-f [^js x]
  (case (.-id x)
    "usernolan" nil
    "nm8"       (let [fill (cond
                             (identical? (.-filter x) "alwaysgray") "#212121"
                             (identical? (.-mode x) "dark")         "white"
                             true                                   "black")]
                  (cond
                    (and (.-toggle x) (.-mouseover x)) fill
                    (.-toggle x)                       fill
                    (.-mouseover x)                    nil
                    true                               nil))
    "Oe"        nil
    "smixzy"    nil))

(defn fill2-f [^js x]
  (case (.-id x)
    "usernolan" nil
    "nm8"       (let [fill (cond
                             (identical? (.-filter x) "alwaysgray") "#212121"
                             (identical? (.-mode x) "dark")         "white"
                             true                                   "black")]
                  (cond
                    (and (.-toggle x) (.-mouseover x)) nil
                    (.-toggle x)                       nil
                    (.-mouseover x)                    fill
                    true                               fill))
    "Oe"        nil
    "smixzy"    nil))

(defn dasharray1-f [^js x]
  (case (.-id x)
    "usernolan" usernolan-rect1-dasharray-15
    "nm8"       (cond
                  (.-toggle x)    "0"
                  (.-mouseover x) "0"
                  true            "10.367255756846319")
    "Oe"        (cond
                  (.-mouseover x) "0"
                  true            "147.07963267948965 0.1")
    "smixzy"    "12.5"))

(defn dasharray2-f [^js x]
  (case (.-id x)
    "usernolan" usernolan-rect2-dasharray-13
    "nm8"       (cond
                  (and (.-toggle x) (.-mouseover x)) "0"
                  (.-toggle x)                       "10.367255756846319"
                  true                               "0")
    "Oe"        (cond
                  (.-mouseover x) "0"
                  true            "147.07963267948965 10")
    "smixzy"    "0"))

(defn dashoffset1-f [^js x]
  (case (.-id x)
    "usernolan" (cond
                  (.-mouseover x) (* (mod (.-t x) frames) usernolan-frame)
                  (.-toggle x)    50 ; (* 1.0 0.5)
                  true            -150) ; (* 1.0 -1.5)
    "nm8"       0
    "Oe"        (cond
                  (.-mouseover x) 0
                  (.-toggle x)    -83.53981633974483
                  true            -5)
    "smixzy"    (if (.-mouseover x)
                  (* (mod (.-t x) 240) 3.57434421)
                  (* (mod (.-t x) 240) 2.7843527583333336))))

(defn dashoffset2-f [^js x]
  (case (.-id x)
    "usernolan" (cond
                  (.-mouseover x) (* (mod (.-t x) 240) -1.308996938995747) ; (/ (* Math/PI 1.0) 240)
                  (.-toggle x)    -78.53981633974483 ; (/ (* Math/PI 1.0) 4)
                  true            78.53981633974483)
    "nm8"       0
    "Oe"        (cond
                  (.-mouseover x) 0
                  (.-toggle x)    -83.53981633974483
                  true            -5)
    "smixzy"    0))

(defn rot1-f [^js x]
  (case (.-id x)
    "usernolan" 0
    "nm8"       0
    "Oe"        0
    "smixzy"    (cond
                  (.-mouseover x) 0
                  (.-toggle x)    135
                  true            0)))

(defn rot2-f [^js x]
  (case (.-id x)
    "usernolan" 0
    "nm8"       0
    "Oe"        0
    "smixzy"    (cond
                  (.-mouseover x) 0
                  (.-toggle x)    135
                  true            0)))

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
        fill1!       (.transform state! (xf/map fill1-f) #js{:closeOut rs/CloseMode.NEVER})
        fill2!       (.transform state! (xf/map fill2-f) #js{:closeOut rs/CloseMode.NEVER})
        dasharray1!  (.transform state! (xf/map dasharray1-f) #js{:closeOut rs/CloseMode.NEVER})
        dasharray2!  (.transform state! (xf/map dasharray2-f) #js{:closeOut rs/CloseMode.NEVER})
        dashoffset1! (.transform state! (xf/map dashoffset1-f) #js{:closeOut rs/CloseMode.NEVER})
        dashoffset2! (.transform state! (xf/map dashoffset2-f) #js{:closeOut rs/CloseMode.NEVER})
        rot1!        (.transform state! (xf/map rot1-f) #js{:closeOut rs/CloseMode.NEVER})
        rot2!        (.transform state! (xf/map rot2-f) #js{:closeOut rs/CloseMode.NEVER})
        component    #js["svg"
                         #js{:xmlns       "http://www.w3.org/2000/svg"
                             :viewBox     "0 0 224.2 155.6"
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
                                 :fill              fill1!
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
                                 :fill              fill2!
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

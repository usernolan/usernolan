(ns nag.browser.isotope
  (:require
   [goog.array :as arr]
   [goog.dom :as dom]
   [goog.dom.classlist :as dom.class]
   [goog.events :as events]
   [goog.events.EventType :as EventType]
   [goog.functions :as fn]
   [goog.string :as string]
   [nag.nav :as nav]))

(def container-class
  "-nag-isotope-container")

(def isotope-class
  "-nag-isotope-isotope")

(def sizer-class
  "-nag-isotope-sizer")

(def expanded-class
  "-nag-isotope-expanded")

(defonce isotope
  (js/Isotope.
   (str "." container-class)
   #js {:itemSelector    (str "." isotope-class)
        :percentPosition true
        :layoutMode      "masonry"
        :masonry         #js {:columnWidth (str "." sizer-class)}}))

(defonce isotope-element-arr
  (dom/getElementsByClass isotope-class))

(def default-filter
  (str "." isotope-class))

(defn add-classes? [ident el]
  (or (identical? ident nav/all)
      (and (identical? ident nav/rand)
           (< (rand) 0.2))
      (dom.class/contains el ident)))

(defn update-classlist! [ident el]
  (if (add-classes? ident el)
    (do (when (identical? ident nav/rand) (dom.class/add el nav/rand))
        (dom.class/add el expanded-class))
    (do (dom.class/remove el expanded-class)
        (dom.class/remove el nav/rand))))

(defn arrange! [ident]
  (arr/map isotope-element-arr (fn [el] (update-classlist! ident el)))
  (js/window.scrollTo 0 0)
  (.arrange isotope))

(def isotope-listener
  (fn/throttle
   (fn [e]
     (dom.class/toggle (.-target e) expanded-class)
     (.layout isotope))
   401))

(defn add-listener! [el]
  (events/listen el EventType/CLICK isotope-listener))

(defonce isotope-listeners
  (arr/map isotope-element-arr add-listener!))

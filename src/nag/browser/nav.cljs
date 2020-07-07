(ns nag.browser.nav
  (:require
   [goog.array :as arr]
   [goog.dom :as dom]
   [goog.dom.classlist :as dom.class]
   [goog.events :as events]
   [goog.events.EventType :as EventType]
   [goog.functions :as fn]
   [goog.history.EventType :as history.EventType]
   [goog.object :as obj]
   [nag.browser.lib :as browser.lib]
   [nag.lib :as lib]
   [nag.nav :as nav])
  (:import
   [goog History]))

(defonce expand-el
  (browser.lib/->el ::nav/expand))

(defonce nav-el
  (browser.lib/->el ::nav/nav))

(def expanded?-atom
  (atom false))

(defn -expanded?-watch-fn
  [_ _ old-val new-val]
  (when (and (not= old-val new-val) nav-el expand-el)
    (let [expanded (lib/->html-safe ::nav/expanded)
          rotated  (lib/->html-safe :nag.css/rotated-45)]
      (if new-val
        (do
          (dom.class/add nav-el expanded)
          (dom.class/add expand-el rotated))
        (do
          (dom.class/remove nav-el expanded)
          (dom.class/remove expand-el rotated))))))

(add-watch expanded?-atom ::expanded?-watch -expanded?-watch-fn)

(defonce expand-listener
  (events/listen
   expand-el
   EventType/CLICK
   (fn/throttle
    (fn [_] (swap! expanded?-atom not))
    101)))

(def idents
  (into nav/idents [::nav/nolan]))

(def token=>ident
  (into
   (hash-map)
   (map
    (juxt
     (comp (partial str "/") name)
     identity))
   idents))

(def ident=>el
  (into
   (hash-map)
   (map
    (juxt
     identity
     browser.lib/->el))
   idents))

(defonce filter-ident-atom
  (atom nil))

(defonce -el-click-listeners
  (doseq [el (vals ident=>el)]
    (doto el
      (events/listen
       EventType/CLICK
       (fn/throttle
        (fn [e]
          (reset! expanded?-atom false)
          (when (= el (ident=>el @filter-ident-atom))
            (js/window.location.assign "/#/")
            (.preventDefault e)))
        101)))))

(defn -filter-ident-watch-fn
  [_ _ old-val new-val]
  (let [old-el (ident=>el old-val) new-el (ident=>el new-val)
        active (lib/->html-safe ::nav/active)]
    (when (dom/isElement old-el) (dom.class/remove old-el active))
    (when (dom/isElement new-el) (dom.class/add new-el active))))

(add-watch filter-ident-atom ::filter-ident-watch -filter-ident-watch-fn)

(defonce location-listener
  (doto (History.)
    (events/listen
     history.EventType/NAVIGATE
     (fn [e]
       (let [ident (token=>ident (.-token e))]
         (js/setTimeout
          (fn [] (reset! filter-ident-atom ident))
          0))))
    (.setEnabled true)))

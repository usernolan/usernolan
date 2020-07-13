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
   [goog.string :as string]
   [nag.browser.isotope :as browser.isotope]
   [nag.nav :as nav])
  (:import
   [goog History]))

(defonce nav-el
  (dom/getElementByClass nav/nav))

  ;; TODO: conditional defs on viewport size w/ listener
(defonce expand-el
  (dom/getElementByClass nav/expand))

(def rotated-class
  "-nag-css-rotated-45")

(def -toggle-expanded!
  (fn/throttle
   (fn []
     (dom.class/toggle nav-el nav/expanded)
     (dom.class/toggle expand-el rotated-class))
   101))

(defonce expand-listener
  (events/listen
   expand-el
   EventType/CLICK
   -toggle-expanded!))

(def ident-arr
  #js [nav/nolan
       nav/people
       nav/things
       nav/prefs
       nav/quotes
       nav/contact
       nav/rand
       nav/all])

(defonce ident=>el-obj
  (arr/reduce
   ident-arr
   (fn [acc ident _ _]
     (let [el (dom/getElementByClass ident)]
       (doto acc (obj/set ident el))))
   (obj/create)))

(defonce state-obj
  #js {:filter-ident nil})

(defn -current-filter-el?
  [el]
  (let [current-ident (obj/get state-obj "filter-ident")
        current-el    (obj/get ident=>el-obj current-ident)]
    (identical? el current-el)))

(defn -set-expanded!
  [expanded?]
  (dom.class/enable nav-el nav/expanded expanded?)
  (dom.class/enable expand-el rotated-class expanded?))

(def -click-listener
  (fn/throttle
   (fn [e]
     (-set-expanded! false)
     (when-let [el (.-target e)]
       (when (-current-filter-el? el) ; TODO: data-*
         (js/window.location.assign "/#/")
         (.preventDefault e))))
   101))

(defn -add-click-listener!
  [el]
  (events/listen el EventType/CLICK -click-listener))

(defonce -el-click-listeners
  (arr/map
   (obj/getValues ident=>el-obj)
   -add-click-listener!))

(defn ->name
  [ident]
  (->>
   (string/splitLimit ident "-" 10)
   (arr/last)))

(defonce token=>ident-obj
  (arr/reduce
   ident-arr
   (fn [acc ident _ _]
     (let [token (string/buildString "/" (->name ident))]
       (doto acc (obj/set token ident))))
   (obj/create)))

(def active-class
  "-nag-nav-active")

(defn -handle-event!
  [e]
  (let [target-ident  (obj/get token=>ident-obj (.-token e))
        current-ident (obj/get state-obj "filter-ident")]
    (when-not (identical? target-ident current-ident)
      (obj/set state-obj "filter-ident" target-ident)
      (let [target-el  (obj/get ident=>el-obj target-ident)
            current-el (obj/get ident=>el-obj current-ident)]
        (when target-el (dom.class/add target-el active-class))
        (when current-el (dom.class/remove current-el active-class))
        (browser.isotope/filter! target-ident)))))

(defonce history
  (doto (History.)
    (events/listen history.EventType/NAVIGATE -handle-event!)
    (.setEnabled true)))

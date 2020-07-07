(ns nag.browser.isotope
  (:require
   [goog.array :as arr]
   [goog.dom :as dom]
   [goog.dom.classlist :as dom.class]
   [goog.events :as events]
   [goog.events.EventType :as EventType]
   [goog.functions :as fn]
   [nag.browser.nav :as browser.nav]
   [nag.isotope :as isotope]
   [nag.lib :as lib]
   [nag.nav :as nav]))

(def default-opts
  #js {:itemSelector    (lib/->css-selector ::isotope/isotope)
       :percentPosition "true"
       :layoutMode      "masonry"
       :masonry         #js {:columnWidth (lib/->css-selector ::isotope/sizer)}})

(defonce isotope-atom
  (atom
   (js/Isotope.
    (lib/->css-selector ::isotope/container)
    default-opts)))

(defonce isotope-elements
  (dom/getElementsByClass
   (lib/->html-safe ::isotope/isotope)))

(def default-filter
  (lib/->css-selector ::isotope/isotope))

(defn filter!
  [{::nav/keys [filter-ident]}]
  (let [expanded (lib/->html-safe ::isotope/expanded)
        filter   (lib/->html-safe filter-ident)]
    (doseq [el isotope-elements]
      (when (dom/isElement el)
        (if (and filter-ident
                 (or (= ::nav/all filter-ident)
                     (and (= ::nav/rand filter-ident) (< (rand) 0.15))
                     (dom.class/contains el filter)))
          (do
            (when (= ::nav/rand filter-ident)
              (dom.class/add el (lib/->html-safe ::nav/rand)))
            (dom.class/add el expanded))
          (dom.class/remove el expanded)))))
  (when (and @isotope-atom (fn? (.-arrange ^js @isotope-atom)))
    (let [filter (or (and (= ::nav/all filter-ident) default-filter)
                     (and (= ::nav/rand filter-ident) (lib/->css-selector ::nav/rand))
                     (lib/->css-selector filter-ident)
                     default-filter)]
      (.arrange @isotope-atom #js {:filter filter})))
  (js/window.scrollTo 0 0))

(defn -filter-ident-watch-fn
  [_ _ old-val new-val]
  (when-not (= old-val new-val)
    (filter! {::nav/filter-ident new-val})))

(add-watch
 browser.nav/filter-ident-atom
 ::filter-ident-watch
 -filter-ident-watch-fn)

(defonce isotope-listeners
  (doseq [el isotope-elements]
    (doto el
      (events/listen
       EventType/CLICK
       (fn/throttle
        (fn [_]
          (when (dom/isElement el)
            (->>
             (lib/->html-safe ::isotope/expanded)
             (dom.class/toggle el)))
          (when (and @isotope-atom (fn? (.-layout ^js @isotope-atom)))
            (.layout ^js @isotope-atom)))
        401)))))

(ns usernolan.browser.style
  (:require
   [clojure.spec.alpha :as s]
   [clojure.string :as string]
   [fm.core :as fm]
   [garden.selectors :as g.sel]
   [garden.stylesheet :as g.stylesheet])
  #?(:clj
     (:import clojure.lang.Keyword)))


   ;;;
   ;;; NOTE: multimethods
   ;;;


(defmulti styles
  "Produces a map of qualified keywords to garden data"
  (fn [_props tag] tag))


   ;;;
   ;;; NOTE: style helpers
   ;;;


(defn html-safe [x]
  (string/replace (str x) #"\W" "-")) ; ALT: retain more information in name conversion

(defn normalize-classname [classname]
  (if (map? classname)
    (reduce (fn [acc [k v]] (when v (conj acc k))) (vector) classname)
    (fm/ensure-sequential classname)))

(defn normalize-class-keyword [k]
  (if (namespace k)
    (html-safe k)
    (let [n (name k)]
      (if (#{\.} (first n))
        (subs n 1)
        n))))


   ;;;
   ;;; NOTE: style api
   ;;;


(defn classes [& classnames]
  (into
   (vector)
   (comp
    (remove nil?)
    (mapcat normalize-classname)
    (map normalize-class-keyword))
   classnames))


   ;;;
   ;;; NOTE: protocol extensions
   ;;;


(extend-protocol g.sel/ICSSSelector
  Keyword
  (css-selector [this]
    (if (namespace this)
      (str "." (html-safe this)) ; NOTE: always a class selector
      (name this)))) ; NOTE: implementation for unqualified keywords is unchanged


   ;;;
   ;;; NOTE: common partial styles
   ;;;


(defn opacity
  [o]
  (let [ie8 (str "progid:DXImageTransform.Microsoft.Alpha(Opacity=" o ")")
        ie5 (str "alpha(opacity=" o ")")]
    [[:& {:opacity o}]
     [(g.stylesheet/at-supports {:-ms-filter ie8} {:-ms-filter ie8})]
     [(g.stylesheet/at-supports {:filter ie5} {:filter ie5})]]))

(defn normalize-transition
  [[k v]]
  (str (name k) " " v))

(defn transition
  [transitions]
  [[:& {:transition
        (->> transitions
             (map normalize-transition)
             (string/join ", "))}]])


   ;;;
   ;;; NOTE: internal concepts, shapes
   ;;;


(comment

  (s/def ::classname
    (s/or
     :ident ident?
     :map (s/map-of ident? 'pred)))

  (s/def ::classnames
    (s/* ::classname))

  (s/def ::transition
    (s/map-of
     'css-attribute-as-keyword
     'css-animation-definition)) ; e.g. {:background "100ms easeInOut"}

  ;;;
  )

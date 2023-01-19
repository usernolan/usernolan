(ns usernolan.site.static.css
  (:require
   [clojure.string :as string]
   [garden.core :as g]
   [usernolan.io :as io]
   [usernolan.site.env :as env]))


   ;;;
   ;;; NOTE: env data
   ;;;


(def css-path "/css") ; TODO: refactor into env
(def usernolan-css-path (str css-path "/usernolan"))


   ;;;
   ;;; NOTE: multimethods
   ;;;


(defmulti path-for  identity)
(defmulti generate! (fn [_props ident] ident))


   ;;;
   ;;; NOTE: default implementations
   ;;;


(defmethod path-for :default
  [ident]
  (let [subdir    (last (string/split (namespace ident) #"\."))
        file-name (name ident)]
    (str usernolan-css-path "/" subdir "/" file-name ".css")))

(defmethod generate! :default ; TODO: memoization, hash inclusion
  [props ident]
  (if-let [garden (get props ident)]
    (let [dir  (get props ::env/root-dir)
          path (str dir (path-for ident))
          css  (g/css {:pretty-print? false} garden)]
      (io/warn! (str "generating " ident " css"))
      (io/safe-spit path css))
    (io/warn! (str ident " has no css!"))))

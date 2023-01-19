(ns usernolan.site.static.page
  (:require
   [usernolan.io :as io]
   [usernolan.site.env :as env]
   [usernolan.site.router :as router]
   [usernolan.site.static.html :as html]))


   ;;;
   ;;; NOTE: top-level multimethods
   ;;;


(defmulti path-for  identity)
(defmulti component ::router/ident)
(defmulti generate! ::router/ident)


   ;;;
   ;;; NOTE: default implementations for static context
   ;;;


(defmethod path-for :default
  [ident]
  (router/path-for ident))

(defmethod generate! :default
  [props]
  (let [ident (get props ::router/ident)]
    (if (get (methods component) ident)
      (let [dir  (get props ::env/root-dir)
            path (str dir (path-for ident))
            page (html/document (component props))]
        (io/warn! (str "generating " ident " html"))
        (io/safe-spit path page))
      (io/warn! (str ident " has no content!")))))

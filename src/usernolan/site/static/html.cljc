(ns usernolan.site.static.html
  #?(:cljs
     (:require
      [reagent.dom.server :as r.server])))


  ;; TODO: replace `reagent.dom.server` with something cross-platform


   ;;;
   ;;; NOTE: html generation helpers
   ;;;


#?(:cljs
   (do
     (defn render-to-static-markup [component]
       (->>
        (if (vector? component) component (component))
        (r.server/render-to-static-markup)))

     (defn document [component]
       (->>
        (render-to-static-markup component)
        (str "<!DOCTYPE html>")))))

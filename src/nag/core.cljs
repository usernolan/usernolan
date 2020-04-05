(ns nag.core
  (:require
   [nag.isotope :as isotope]
   [nag.views :as views]
   [reagent.dom :as r.dom]))

(defn render
  []
  (r.dom/render
   [views/main-panel]
   (js/document.getElementById "app")))

(defn ^:export init
  []
  (render)
  (isotope/init))

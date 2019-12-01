(ns nag.core
  (:require
   [nag.isotope :as isotope]
   [nag.views :as views]
   [reagent.core :as r]))

(defn render
  []
  (r/render
   [views/main-panel]
   (js/document.getElementById "app")))

(defn ^:export init
  []
  (render)
  (isotope/init))

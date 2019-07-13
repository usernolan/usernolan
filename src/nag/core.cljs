(ns nag.core
  (:require
   [nag.isotope :as isotope]
   [nag.views :as views]
   [reagent.core :as r]))

(defn dev-setup []
  (when ^boolean goog.DEBUG
    (enable-console-print!)
    (println "dev mode")))

(defn render []
  (r/render
   [views/main-panel]
   (js/document.getElementById "app")))

(defn ^:export init []
  (dev-setup)
  (render)
  (isotope/init))

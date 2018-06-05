(ns nag.core
  (:require
    [nag.isotope :as isotope]
    [nag.config :as config]
    [nag.state :as state]
    [nag.views :as views]
    [re-frame.core :as re]
    [reagent.core :as r]
    [cljsjs.create-react-class]
    [cljsjs.react.dom]
    [cljsjs.react]))

(defn dev-setup []
  (when config/debug?
    (enable-console-print!)
    (println "dev mode")))

(defn mount-root []
  (re/clear-subscription-cache!)
  (r/render [views/main-panel]
            (js/document.getElementById "app")))

(defn ^:export init []
  (dev-setup)
  (mount-root)
  (isotope/init))

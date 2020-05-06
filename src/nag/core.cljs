(ns nag.core
  (:require
   [goog.array :as arr]
   [goog.dom :as dom]
   [goog.userAgent :as userAgent]
   [nag.isotope :as isotope]
   [nag.views :as views]
   [reagent.dom :as r.dom]))

(defn render
  []
  (r.dom/render
   [views/main-panel]
   (js/document.getElementById "app")))

(defn error!
  [message]
  (doto (arr/peek (dom/getElementsByTagName dom/TagName.BODY))
    (dom/setProperties #js {"style" "font-family:\"Helvetica Neue\", sans-serif;padding:5vh 5vw;"})
    (dom/append
     (doto (dom/createElement "h1")
       (dom/setTextContent message)))))

(defn ie!
  []
  (error! "don't use internet explorer."))

(defn ^:export init
  []
  (if userAgent/IE
    (ie!)
    (try
      (render)
      (isotope/init)
      (catch :default _
        (error! "something went heinously wrong.")))))

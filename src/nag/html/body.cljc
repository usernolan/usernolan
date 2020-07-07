(ns nag.html.body
  (:require
   [nag.html.header :as header]
   [nag.html.isotope :as isotope]))

(defn hiccup
  [& _]
  [:body
   (header/hiccup)
   (isotope/hiccup)])

(def css
  (concat
   header/css
   isotope/css))

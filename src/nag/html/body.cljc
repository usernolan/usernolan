(ns nag.html.body
  (:require
   [nag.html.header :as header]
   [nag.html.isotope :as isotope]
   [rum.core :as rum]))

(rum/defc component
  []
  [:body
   (header/component)
   (isotope/component)])

(def css
  (concat
   header/css
   isotope/css))

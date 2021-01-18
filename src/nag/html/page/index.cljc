(ns nag.html.page.index
  (:require
   [garden.core :as g]
   [nag.css :as css]
   [nag.html.body :as body]
   [nag.html.head :as head]
   [nag.io :as io]
   [rum.core :as rum]))

(rum/defc component []
  [:html {:lang "en"}
   (head/component)
   (body/component)
   [:script {:src "https://cdnjs.cloudflare.com/ajax/libs/jquery.isotope/3.0.6/isotope.pkgd.min.js" :type "text/javascript"}]
   [:script {:src "/js/nag/browser.js" :type "text/javascript"}]])

(defn css []
  (concat
   body/css
   css/css))

(defn spit-static-markup!
  []
  (->>
   (str "<!DOCTYPE html>" (rum/render-static-markup (component)))
   (io/spit "resources/public/index.html"))
  (->>
   (g/css {:pretty-print? false} (css))
   (io/spit "resources/public/css/nag.css")))

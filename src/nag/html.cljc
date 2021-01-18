(ns nag.html
  (:require
   [nag.html.page.index :as index]))

(defn ^:dev/after-load spit-static-markup! []
  (index/spit-static-markup!))

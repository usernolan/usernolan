(ns nag.html
  (:require
   [nag.html.page.index :as index]
   [nag.io :as io]))

(defn watch!
  [& _args]
  (index/spit-static-markup!)
  (io/wait!))

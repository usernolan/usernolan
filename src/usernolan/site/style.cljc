(ns usernolan.site.style
  (:require
   [usernolan.browser.style :as style.lib]))

  ;; NOTE: order would matter in the presence of dependent styles
(def default-idents
  (keys (methods style.lib/styles)))

(defn merge-styles
  ([props] (merge-styles props default-idents))
  ([props idents]
   (reduce
    (fn [acc ident]
      (merge acc (style.lib/styles acc ident)))
    props
    idents)))

(ns usernolan.site.static
  (:require
   [usernolan.site.env :as env]
   [usernolan.site.router :as router]
   [usernolan.site.static.page :as page]
   [usernolan.site.static.pages]
   [usernolan.site.style :as style]))

  ;; TODO: read `root-dir` from shadow, closure defines, etc.

(defn generate-pages! []
  (doseq [ident (map ::router/ident router/targets)] ; ALT: `(keys (methods page/component))`, descendants
    (let [props (assoc env/env ::router/ident ident)
          props (style/merge-styles props)]
      (page/generate! props))))

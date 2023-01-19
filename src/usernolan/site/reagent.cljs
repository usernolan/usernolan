(ns usernolan.site.reagent
  (:require
   [goog.dom :as dom]
   [usernolan.site.router :as router]
   [usernolan.site.static.page :as page]
   [usernolan.site.static.pages]
   [usernolan.site.style :as style]
   [reagent.dom :as r.dom]))

  ;; TODO: nav

(defn render
  [props]
  (let [props (assoc props ::router/ident ::router/index)
        props (style/merge-styles props)]
    (r.dom/render
     [page/component props]
     (dom/getElement js/document))))

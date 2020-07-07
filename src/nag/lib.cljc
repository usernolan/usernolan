(ns nag.lib
  (:require
   [clojure.string :as string]))

(defn ->html-safe
  ([x] (when x (string/replace (str x) #"\W" "-")))
  ([x1 x2 & xs]
   (->>
    (into (vector x1 x2) xs)
    (into (vector) (comp (remove nil?) (map ->html-safe)))
    (string/join " "))))

(defn ->css-selector
  ([x] (when x (str "." (->html-safe x))))
  ([x1 x2 & xs]
   (->>
    (into (vector x1 x2) xs)
    (into (vector) (comp (remove nil?) (map ->css-selector)))
    (string/join " "))))

(def mobile-width "700px")

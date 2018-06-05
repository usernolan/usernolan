(ns nag.state
  (:require [re-frame.core :as re]))

(def nilable-map? (some-fn map? nil?))

(defn deep-merge-with [f & ms]
  (apply merge-with
         (fn [a b]
           (if (and (nilable-map? a) (nilable-map? b))
             (deep-merge-with f a b)
             (f a b)))
         ms))

(re/reg-event-db
  :m
  (fn [db [_ kvs f]]
    (js/console.log (clj->js kvs))
    (deep-merge-with (or f (fn [a b] b)) db kvs)))

(re/reg-sub
  :isotope-filter
  (fn [db _] (:isotope-filter db)))

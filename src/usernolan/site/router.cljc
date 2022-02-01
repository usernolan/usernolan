(ns usernolan.site.router)

(def targets
  #{{::ident ::index :href "/index.html"}})

(def ident-index
  (into
   (hash-map)
   (map (juxt ::ident identity))
   targets))

(def path-for
  (comp :href ident-index))

(defn derive-targets-rf [h {::keys [ident isa]}]
  (let [rf (fn [h a] (derive h ident a))]
    (if isa (reduce rf h isa) h)))

(defn derive-target-hierarchy
  ([hierarchy] (derive-target-hierarchy hierarchy targets))
  ([hierarchy targets]
   (let [derive-targets (partial reduce derive-targets-rf)]
     (->
      hierarchy
      (derive ::new-tab :usernolan.browser.nav/target)
      (derive ::external-link :usernolan.browser.nav/target)
      (derive-targets targets)))))

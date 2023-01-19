(ns nag.io
  #?@(:clj  [(:refer-clojure :excludes [spit])])
  #?@(:cljs [(:require ["fs" :as fs])]))

#?(:clj  (def spit clojure.core/spit)
   :cljs (defn spit
           [filename data & {:keys [encoding mode flag]
                             :or   {encoding "utf8" mode "0o666" flag "w"}}]
           (let [data (if (string? data) data (str data))]
             (fs/writeFileSync filename data encoding mode flag))))


#?(:cljs
   (defn wait!
     []
     (js/process.stdin.on
      "readable"
      (constantly nil))))

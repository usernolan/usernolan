(ns usernolan.io
  #?@(:clj
      [(:refer-clojure :exclude [spit])
       (:require
        [clojure.java.io :as io])])
  #?@(:cljs ; NOTE: `:node`? likely disallowed
      [(:require
        ["fs" :as fs]
        ["path" :as path])]))


   ;;;
   ;;; NOTE: recreated clj interfaces for common io utils in node
   ;;;


#?(:clj  (def spit clojure.core/spit)
   :cljs (defn spit [f content & {:keys [encoding mode flag]
                                  :or   {encoding "utf8" mode "0o666" flag "w"}}]
           (let [content (if (string? content) content (str content))]
             (fs/writeFileSync f content encoding mode flag))))

#?(:clj  (def copy io/copy)
   :cljs (defn copy [input output & {:keys [mode] :or {mode 0}}]
           (fs/copyFileSync input output mode)))

#?(:clj  (def make-parents io/make-parents)
   :cljs (defn make-parents [f]
           (when-not (fs/existsSync f)
             (let [dirname (path/dirname f) opts #js {:recursive true}]
               (fs/mkdirSync dirname opts)))))


   ;;;
   ;;; NOTE: operations that ensure destination availability
   ;;;


(defn safe-spit [f content & opts]
  (make-parents f)
  (apply spit f content opts))

(defn safe-copy [input output & opts]
  (make-parents output)
  (apply copy input output opts))


   ;;;
   ;;; NOTE: io helpers
   ;;; TODO: `tools.logging`
   ;;;


(def warn!
  (comp prn symbol)) ; NOTE: `symbol` reduces quotation noise in certain output contexts

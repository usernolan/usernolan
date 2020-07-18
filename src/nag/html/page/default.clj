(ns nag.html.page.default
  (:require
   [hiccup.page :as h.page]
   [nag.html.body :as body]
   [nag.html.head :as head]
   :reload-all))

(defn generate
  [& _]
  (h.page/html5
   {:lang "en"}
   (head/hiccup)
   (body/hiccup)
   (h.page/include-js
    "https://cdnjs.cloudflare.com/ajax/libs/jquery.isotope/3.0.6/isotope.pkgd.min.js"
    "/js/nag/browser.js")))

(comment

  (spit "resources/public/index.html" (generate))

  (ns shadow.user)
  (shadow/release :browser)

  )

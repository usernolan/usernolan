(ns nag.html.head
  (:require
   [garden.core :as g]
   [nag.css :as css]
   [nag.html.body :as body]))

(defn hiccup
  [& _]
  [:head
   [:title "notalwaysgray •."]
   [:meta {:charset "utf-8"}]
   [:meta {:content "IE=edge" :http-equiv "X-UA-Compatible"}]
   [:meta {:name "viewport" :content "width=device-width, initial-scale=1"}]
   [:meta {:name "format-detection" :content "telephone=no"}]
   [:meta {:prefix "og: http://ogp.me/ns#" :property "og:site_name" :content "notalwaysgray.net"}]
   [:meta {:prefix "og: http://ogp.me/ns#" :property "og:title" :content ".•"}]
   [:meta {:prefix "og: http://ogp.me/ns#" :property "og:url" :content "https://notalwaysgray.net"}]
   [:meta {:prefix "og: http://ogp.me/ns#" :property "og:description" :content "notalwaysgray.net"}]
   [:meta {:prefix "og: http://ogp.me/ns#" :property "og:image" :content "/imgs/pyramids.jpg"}]
   [:meta {:prefix "og: http://ogp.me/ns#" :property "og:image:width" :content "1500"}]
   [:meta {:prefix "og: http://ogp.me/ns#" :property "og:image:height" :content "1500"}]
   [:meta {:name "twitter:card" :content "summary_large_image"}]
   [:meta {:name "twitter:site" :content "@notalwaysgray"}]
   [:meta {:name "twitter:title" :content ".•"}]
   [:meta {:name "twitter:description" :content "notalwaysgray.net"}]
   [:meta {:name "twitter:url" :content "https://notalwaysgray.net"}]
   [:meta {:name "twitter:image" :content "/imgs/pyramids.jpg"}]
   [:link {:rel "canonical" :href "https://notalwaysgray.net"}]
   [:link {:rel "shortcut icon" :href "favicon.ico"}]
   [:link {:rel "stylesheet" :href "/css/icons/icons.css"}]
   [:style
    (g/css
     {:pretty-print? false}
     (concat
      css/css
      body/css))]])

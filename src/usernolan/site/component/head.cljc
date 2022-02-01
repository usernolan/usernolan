(ns usernolan.site.component.head
  (:require
   [garden.core :as g]
   [usernolan.browser.style :as style.lib]
   [usernolan.site.router :as router]
   [usernolan.site.static.css :as css]))


   ;;;
   ;;; NOTE: individual `<head>` components
   ;;;


(defn style-tag
  "Workaround for React string escaping breaking garden output."
  [props ident]
  (when-let [garden (get props ident)]
    ^{:key ident}
    [:style
     {:dangerouslySetInnerHTML
      {:__html (g/css {:pretty-print? false} garden)}}]))

(defn style-link
  [props ident]
  #?(:node (css/generate! props ident))
  ^{:key ident}
  [:link {:rel "stylesheet" :href (css/path-for ident)}])

(defmulti  title-tag ::router/ident)
(defmethod title-tag :default
  [_]
  [:title ".• usernolan"])

(defmulti  description-tag ::router/ident)
(defmethod description-tag :default
  [_]
  [:meta
   {:name    "description"
    :content "Composite identity profile of Nolan Smith"}])


   ;;;
   ;;; NOTE: `<head>` helpers
   ;;;


  ;; NOTE: sorting here is probably unnecessary, but making the order in which
  ;; style links and tags appear deterministic ensures `turbolinks` does as
  ;; little work as possible in deduplicating nodes in `<head>`
(defn style-tags [props idents]
  (map
   (partial style-tag props)
   (sort idents)))

(defn style-links [props idents]
  (map
   (partial style-link props)
   (sort idents)))


   ;;;
   ;;; NOTE: partial `<head>` fragments
   ;;;


(defmulti  meta-fragment ::router/ident)
(defmethod meta-fragment :default
  [_]
  [:<>
   [:meta {:charset "utf-8"}]
   [:meta {:name "viewport" :content "width=device-width, initial-scale=1"}]
   [:meta {:content "IE=edge" :http-equiv "X-UA-Compatible"}]
   [:meta {:name "keywords" :content "nolan, usernolan, identity"}]
   [:meta {:name "author" :content "usernolan"}]])

(defmulti  link-fragment ::router/ident)
(defmethod link-fragment :default
  [_]
  [:<>
   [:link {:rel "canonical" :href "https://usernolan.net"}]
   [:link {:rel "shortcut icon" :href "/favicon.ico" :type "image/x-icon"}]])

(defmulti  script-fragment ::router/ident)
(defmethod script-fragment :default
  [_]
  [:<> ;; TODO: props/env/shadow/manifest
   [:script {:src "/js/usernolan/site/common.js" :defer true :type "text/javascript"}]
   [:script {:src "/js/usernolan/site/reactive.js" :defer true :type "text/javascript"}]])

(defmulti  gtm-fragment ::router/ident)
(defmethod gtm-fragment :default
  [_]
  [:<>
   [:script {:dangerouslySetInnerHTML {:__html "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WCWH7XK');"}}]])

(defmulti  opengraph-fragment ::router/ident)
(defmethod opengraph-fragment :default
  [_]
  (let [prefix "og: http://ogp.me/ns#"]
    [:<>
     [:meta {:prefix prefix :property "og:site_name" :content "usernolan.net"}]
     [:meta {:prefix prefix :property "og:title" :content "usernolan"}]
     [:meta {:prefix prefix :property "og:url" :content "https://usernolan.net"}]
     [:meta {:prefix prefix :property "og:description" :content "Composite identity of Nolan Smith"}]
     [:meta {:prefix prefix :property "og:image" :content "/png/logo.png"}]
     [:meta {:prefix prefix :property "og:image:width" :content "1500"}]
     [:meta {:prefix prefix :property "og:image:height" :content "1500"}]]))

(defmulti  twitter-fragment ::router/ident)
(defmethod twitter-fragment :default
  [_]
  [:<>
   [:meta {:name "twitter:card" :content "summary"}]
   [:meta {:name "twitter:site" :content "@usernolan"}]
   [:meta {:name "twitter:title" :content "usernolan"}]
   [:meta {:name "twitter:description", :content "Composite identity of Nolan Smith"}]
   [:meta {:name "twitter:url" :content "https://usernolan.net"}]
   [:meta {:name "twitter:image" :content "https://nuid.io/png/logo.png"}]
   [:meta {:name "twitter:image:alt" :content "usernolan"}]])

(def common-style-idents
  #{})

(defmulti  style-fragment ::router/ident)
(defmethod style-fragment :default
  [props]
  (let [ident  (get props ::router/ident)
        idents (if (contains? (methods style.lib/styles) ident)
                 (into common-style-idents (keys (style.lib/styles props ident)))
                 common-style-idents)]
    [:<> (if goog.DEBUG
           (style-links props idents)
           (style-tags props idents))]))

(def prefetch-idents
  #{::router/index})

(defmulti  prefetch-fragment ::router/ident)
(defmethod prefetch-fragment :default
  [{::router/keys [ident]}]
  (let [idents (disj prefetch-idents ident)]
    [:<>
     (for [ident idents]
       ^{:key ident}
       [:link {:rel "prefetch" :href (router/path-for ident) :as "document" :type "text/html"}])]))


   ;;;
   ;;; NOTE: top-level `<head>` component
   ;;;


(defmulti  component ::router/ident)
(defmethod component :default
  [props]
  [:head
   [meta-fragment props]
   [script-fragment props]
   [prefetch-fragment props]
   [title-tag props]
   [description-tag props]
   [link-fragment props]
   [style-fragment props]
   [opengraph-fragment props]
   [twitter-fragment props]])

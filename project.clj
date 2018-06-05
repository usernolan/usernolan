(defproject nolan330.nag "0.1.0-SNAPSHOT"
  :description "notalwaysgray.net •."
  :url "https://github.com/Nolan330/nag"
  :dependencies [[javax.xml.bind/jaxb-api "2.3.0"]
                 [org.clojure/clojurescript "1.10.126"]
                 [org.clojure/clojure "1.9.0"]
                 [re-frame "0.10.5"]
                 [reagent "0.7.0"]]
  :min-lein-version "2.5.3"
  :figwheel {:css-dirs ["resources/public/css"]}
  :clean-targets ^{:protect false} ["resources/public/js/nag" "target"]
  :plugins [[lein-cljsbuild "1.1.7"]]
  :profiles
  {:dev {:plugins      [[lein-figwheel "0.5.13"]]}}
  :cljsbuild
  {:builds
   [{:id           "dev"
     :source-paths ["src/cljs"]
     :figwheel     {:on-jsload "nag.core/init"}
     :compiler     {:main                 nag.core
                    :output-to            "resources/public/js/nag/nag.js"
                    :output-dir           "resources/public/js/nag/out"
                    :asset-path           "js/nag/out"
                    :optimizations        :none
                    :pretty-print         true
                    :source-map-timestamp true}}
    {:id           "min"
     :source-paths ["src/cljs"]
     :compiler     {:main            nag.core
                    :output-to       "resources/public/js/nag/nag.js"
                    :externs         ["externs/isotope.ext.js"
                                      "externs/particles.ext.js"]
                    :optimizations   :advanced
                    :closure-defines {goog.DEBUG false}
                    :pretty-print    false}}]})

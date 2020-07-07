(ns nag.browser.lib
  (:require
   [goog.dom :as dom]
   [nag.lib :as lib]))

(def ->el
  (comp
   dom/getElementByClass
   lib/->html-safe))

(ns nag.views
  (:require
   [nag.isotope :as isotope]
   [reagent.core :as r]
   [goog.events.EventType :as EventType]
   [goog.events :as events]
   [goog.dom :as dom]))

(defn default-header-container
  [{:keys [title-component nav-component]}]
  (let [dropdown? (r/atom false)
        scroll    (r/atom 0)
        listener  (r/atom nil)]
    (r/create-class
     {:component-did-mount
      (fn []
        (->>
         (events/listen
          js/window
          EventType/SCROLL
          (fn [] (reset! scroll (max 0 (.-y (dom/getDocumentScroll))))))
         (reset! listener)))

      :component-will-unmount
      (fn []
        (events/unlistenByKey @listener)
        (reset! dropdown? false)
        (reset! scroll 0)
        (reset! listener nil))

      :reagent-render
      (fn []
        [:div#header-container
         {:class (when (> @scroll 0) "pinned")
          :style {:background @isotope/gray1-rgb-css-str-ratom
                  :position   (when (> @scroll 3000) "fixed")}}

         [:div#header
          {:style {:color @isotope/gray2-rgb-css-str-ratom}}

          [title-component]

          (when nav-component
            [:div
             [:button.mobile-only
              {:class    (when @dropdown? "active")
               :style    {:color @isotope/gray2-rgb-css-str-ratom}
               :on-click (fn [] (reset! dropdown? (not @dropdown?)))}
              "•."]

             [nav-component {:class "desktop-only"}]])]

         (when nav-component
           [:div#header-dropdown
            {:class    (when @dropdown? "active")
             :style    {:background @isotope/gray1-rgb-css-str-ratom
                        :color      @isotope/gray2-rgb-css-str-ratom}
             :on-click (fn [] (reset! dropdown? (not @dropdown?)))}
            [nav-component]])])})))

(defn nav
  [props]
  [:ul props
   (doall
    (for [{:keys [display on-click]} isotope/nav-list]
      ^{:key display}
      [:li
       {:on-click on-click
        :style    {:color @isotope/gray2-rgb-css-str-ratom}}
       display]))])

(defn header
  []
  (default-header-container
    {:title-component isotope/title
     :nav-component   nav}))

(defn content
  []
  [:div.isotope-container
   {:style {:background @isotope/gray1-rgb-css-str-ratom}}
   [:div.isotope-sizer]
   (for [i isotope/isotopes]
     ^{:key (:id i)}
     [isotope/isotope i])])

(defn main-panel
  []
  [:div
   {:style {:background @isotope/gray1-rgb-css-str-ratom}}
   [header]
   [content]])

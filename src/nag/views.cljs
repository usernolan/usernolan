(ns nag.views
  (:require
   [goog.events.EventType :as EventType]
   [goog.events :as events]
   [goog.dom :as dom]
   [reagent.core :as r]
   [nag.isotope :as isotope]))

(defn default-header-container
  [{:keys [title-component nav-component]}]
  (let [dropdown? (r/atom false)
        scroll    (r/atom 0)]

    (events/listen
     js/window
     EventType/SCROLL
     (fn []
       (reset! scroll (max 0 (.-y (dom/getDocumentScroll))))))

    (fn []
      [:div#header-container
       {:class (when (> @scroll 0) "pinned")
        :style {:background isotope/gray1-rgb
                :position   (when (> @scroll 3000) "fixed")}}

       [:div#header
        {:style {:color isotope/gray2-rgb}}

        [title-component]

        (when nav-component
          [:div
           [:button.mobile-only
            {:class    (when @dropdown? "active")
             :style    {:color isotope/gray2-rgb}
             :on-click (fn [] (reset! dropdown? (not @dropdown?)))}
            "•."]

           [nav-component {:class "desktop-only"}]])]

       (when nav-component
         [:div#header-dropdown
          {:class    (when @dropdown? "active")
           :style    {:background isotope/gray1-rgb :color isotope/gray2-rgb}
           :on-click (fn [] (reset! dropdown? (not @dropdown?)))}
          [nav-component]])])))

(defn nav
  [props]
  [:ul props
   (for [{:keys [display on-click]} isotope/nav-list]
     ^{:key display}
     [:li
      {:on-click on-click
       :style    {:color isotope/gray2-rgb}}
      display])])

(defn header
  []
  (default-header-container
    {:title-component isotope/title
     :nav-component   nav}))

(defn content
  []
  [:div.isotope-container
   [:div.isotope-sizer]
   (for [i isotope/isotopes]
     ^{:key (:id i)}
     [isotope/isotope i])])

(defn main-panel
  []
  [:div
   [header]
   [content]])

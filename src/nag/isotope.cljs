(ns nag.isotope
  (:require
   [nag.webgl :as webgl]
   [reagent.core :as r]
   [goog.array :as arr]
   [goog.dom :as dom]))

(def opts #js {"itemSelector"    ".isotope"
               "percentPosition" "true"
               "layoutMode"      "masonry"
               "masonry"         #js {"columnWidth" ".isotope-sizer"}})

(defn init
  []
  (def iso (js/Isotope. ".isotope-container" opts)))

(def old-filter (atom nil))

(defn scope
  [el]
  (some-> el .-classList (.add "scoped")))

(defn arrange
  [{:keys [class filter f]
    :or   {filter (str "." class)
           f      scope}}]
  (arr/map (dom/getElementsByClass class) f)
  (.arrange iso #js {"filter" filter}))

(defn show
  [new-filter]
  (let [is (some-> "isotope-container" dom/getElementByClass dom/getChildren)]
    (condp = new-filter
      @old-filter (arrange {:class "isotope"
                            :f     (fn [el] (some-> el .-classList (.remove "scoped")))})
      :nolan      (arrange {:class "nolan"})
      :people     (arrange {:class "people"})
      :things     (arrange {:class "things"})
      :prefs      (arrange {:class "prefs"})
      :quotes     (arrange {:class "quotes"})
      :contact    (arrange {:class "contact"})
      :rand       (do
                    (arr/map
                     (dom/getElementsByClass "isotope")
                     (fn [el]
                       (when (< (rand) 0.15)
                         (some-> el .-classList (.add "scoped" "rand")))))
                    (.arrange iso #js {"filter" ".rand"}))
      :all        (arrange {:class "isotope"})
      (js/console.log "?"))
    (reset! old-filter (if (= @old-filter new-filter) nil new-filter))
    (js/window.scrollTo 0 0)))

(defn title
  []
  [:h1
   {:on-click (partial show :nolan)
    :style    {:cursor "pointer"}}
   "nolan"])

(defn int->rgb-css-str
  [n]
  (str "rgb(" n "," n "," n ")"))

(def gray1-ratom (r/atom 255))
(def gray2-ratom (r/atom (- 255 @gray1-ratom)))
(def gray1-rgb-css-str-ratom (r/atom (int->rgb-css-str @gray1-ratom)))
(def gray2-rgb-css-str-ratom (r/atom (int->rgb-css-str @gray2-ratom)))

(defn set-body-background-color!
  [color-css-str]
  (->
   (dom/getElementsByTagName dom/TagName.BODY)
   (arr/peek)
   (.-style)
   (.-background)
   (set! color-css-str)))

(set-body-background-color! @gray1-rgb-css-str-ratom)

(defn update-gray!-watch-fn
  [_ _ old-val gray1]
  (if (= old-val gray1)
    gray1
    (let [gray2             (reset! gray2-ratom (- 255 gray1))
          gray1-rgb-css-str (reset! gray1-rgb-css-str-ratom (int->rgb-css-str gray1))
          gray2-rgb-css-str (reset! gray2-rgb-css-str-ratom (int->rgb-css-str gray2))
          body              (set-body-background-color! gray1-rgb-css-str)])))

(add-watch gray1-ratom ::state-watch update-gray!-watch-fn)

(def nav-list
  [{:display "people" :on-click (partial show :people)}
   {:display "things" :on-click (partial show :things)}
   {:display "prefs" :on-click (partial show :prefs)}
   {:display "quotes" :on-click (partial show :quotes)}
   {:display "contact" :on-click (partial show :contact)}
   {:display "rand" :on-click (partial show :rand)}
   {:display "inv" :on-click (fn [] (reset! gray1-ratom @gray2-ratom))}
   {:display "all" :on-click (partial show :all)}])

(defn isotope-click-handler
  [e]
  (some-> e .-target .-classList (.toggle "scoped"))
  (.layout iso))

(defn isotope
  [{:keys [id props content]}]
  [:div.isotope
   (merge-with
    merge
    {:style    {:border     (str "4px solid " @gray1-rgb-css-str-ratom)
                :box-shadow (str "inset 0 0 0 4px " @gray2-rgb-css-str-ratom)
                :color      @gray2-rgb-css-str-ratom}
     :on-click isotope-click-handler}
    props)

   [:p.id id]

   [:div.content
    {:style {:pointer-events "none"
             :auto-focus     false}}
    (if (fn? content) (content) content)]])

(defn hover-li
  [{:keys [href icon]}]
  [:li {:style {:pointer-events "all"}}
   [:a {:href   href
        :target "_blank"
        :style  {:margin-right (if (> (.-width (dom/getViewportSize)) 500) "25px" "15px")
                 :font-size    (if (> (.-width (dom/getViewportSize)) 500) "75px" "50px")
                 :color        @gray2-rgb-css-str-ratom}}
    icon]])

(defn hover-ul
  [lis]
  [:ul {:style {:margin 0 :padding 0}}
   (for [li lis]
     ^{:key (:href li)}
     [hover-li li])])

(def isotopes
  [{:id      "1"
    :props   {:class "nolan"}
    :content [:p {:style {:width "80%"}} "im nolan. im originally from indiana and have an unbelievable family. pretty much everything else about me can be found out by clicking around furiously on this page."]}

   {:id      "2"
    :props   {:class "people"}
    :content [:img {:src "imgs/fam.jpg" :alt "fam"}]}

   {:id      "3"
    :props   {:class "things"}
    :content [:img {:src   "imgs/rock.png"
                    :alt   "rock"
                    :style {:object-fit "contain"}}]}

   {:id      "4"
    :props   {:class "nolan quotes"}
    :content [:div {:style {:width "80%"}}
              [:p {:style {:display     "block"
                           :font-weight "bold"}}
               "one main factor in the upward trend of animal life has been the power of wandering"]
              [:p ".• alfred north whitehead"]]}

   {:id    "5"
    :props {:class "contact"}
    :content
    [hover-ul
     [{:href "https://github.com/notalwaysgray"
       :icon [:i.icon-github-circled]}
      {:href "https://twitter.com/notalwaysgray"
       :icon [:i.icon-twitter]}
      {:href "https://www.linkedin.com/in/nolan330"
       :icon [:i.icon-linkedin-squared]}
      {:href "mailto:nolan330@gmail.com"
       :icon [:i.icon-mail-alt]}]]}

   {:id      "6"
    :content [:img {:src "imgs/ducks.jpg" :alt "ducks"}]}

   {:id      "7"
    :props   {:class "quotes"}
    :content [:div {:style {:width "80%"}}
              [:p {:style {:display     "block"
                           :font-weight "bold"}}
               "my greatest concern was what to call it"]
              [:p ".• claude shannon"]]}

   {:id      "8"
    :content [:img {:src   "imgs/beach.jpg"
                    :alt   "gray beach"
                    :style {:object-fit "unset"}}]}

   {:id      "9"
    :props   {:class "quotes"}
    :content [:div {:style {:width "80%"}}
              [:p {:style {:display     "block"
                           :font-weight "bold"}}
               "design is to take things apart in such a way that they can be put back together"]
              [:p ".• rich hickey"]]}

   {:id      "10"
    :content [:img {:src "imgs/grandcan.jpg" :alt "grand canyon"}]}

   {:id      "11"
    :props   {:class "quotes"}
    :content [:div {:style {:width "80%"}}
              [:p {:style {:display     "block"
                           :font-weight "bold"}}
               "remember, one of the most important principles in programming is the same as one of the most important principles in sorcery, all right? that's if you have the name of the spirit, you get control over it"]
              [:p ".• hal abelson"]]}

   {:id    "12"
    :props {:class "quotes"}
    :content
    [:div {:style {:width "80%"}}
     [:h3 {:style {:display "block"}} ".• overview effect"]
     [:p "a cognitive shift in awareness reported by some astronauts and cosmonauts during spaceflight"]]}

   {:id      "13"
    :props   {:class "people"}
    :content [:img {:src "imgs/shlin.jpg" :alt "💙"}]}

   {:id      "14"
    :props   {:class (if (>= (max @gray1-ratom @gray2-ratom) 192) "nolan things" "things")}
    :content [:img {:src "imgs/space.jpg" :alt "space"}]}

   {:id    "15"
    :props {:class "things"}
    :content
    (fn []
      (let [gray-pct       (* (/ @gray2-ratom 255) 100)
            filter-css-str (str "saturate(0%) brightness(" gray-pct "%) contrast(100%)")]
        [:img {:src    "imgs/keys.png"
               :alt    "cross-sections of keyholes"
               :style  {:filter         filter-css-str
                        :-webkit-filter filter-css-str
                        :height         "84%"
                        :width          "unset"}
               :height "84%"}]))}

   {:id      "16"
    :props   {:class "people"}
    :content [:img {:src "imgs/louis.jpg" :alt "louis"}]}

   {:id      "17"
    :props   {:class "people"}
    :content [:img {:src "imgs/squids.jpg" :alt "🦑"}]}

   {:id      "18"
    :props   {:class "things"}
    :content [:img {:src "imgs/midway.jpg" :alt "airport"}]}

   {:id    "19"
    :props {:class "prefs"}
    :content
    [hover-ul
     [{:href "https://open.spotify.com/user/nolan330"
       :icon [:i.icon-spotify]}
      {:href "https://www.discogs.com/user/notalwaysgray/collection?header=1"
       :icon [:i.icon-cd]}
      {:href "https://soundcloud.com/notalwaysgray/sets"
       :icon [:i.icon-soundcloud]}]]}

   {:id    "20"
    :props {:class "prefs"}
    :content
    [hover-ul
     [{:href "https://behance.net/notalwaysgray/appreciated"
       :icon [:i.icon-behance]}]]}

   {:id    "21"
    :props {:class "prefs"}
    :content
    (fn []
      (let [gray-pct       (* (/ @gray2-ratom 255) 100)
            filter-css-str (str "saturate(0%) brightness(" gray-pct "%) contrast(100%)")
            style          {:filter filter-css-str :-webkit-filter filter-css-str}]
        [:ul
         [:li [:img {:src "imgs/borderlands.png" :alt "borderlands" :style style}]]
         [:li [:img {:src "imgs/fez.png" :alt "fez" :style style}]]
         [:li [:img {:src "imgs/ssb.png" :alt "ssb" :style style}]]
         [:li [:img {:src "imgs/wow.png" :alt "wow" :style style}]]]))}

   {:id      "22"
    :props   {:class "people"}
    :content [:img {:src "imgs/bois.jpg" :alt "bois"}]}

   {:id      "23"
    :props   {:class "people"}
    :content [:img {:src "imgs/phish.jpg" :alt "phaesh"}]}

   {:id    "24"
    :props {:class "prefs"}
    :content
    (fn []
      [:div {:style {:width "100%" :height "100%"}}
       [:img {:src "imgs/profhos.jpg" :alt "profhos"}]
       [:a {:href   "http://sugarboypress.com"
            :target "_blank"
            :style  {:pointer-events "all"
                     :font-size      "40px"
                     :position       "absolute"
                     :bottom         ".5em"
                     :right          "1em"
                     :color          "white"}}
        "Mark"]])}

   {:id    "25"
    :props {:class "prefs"}
    :content
    (fn []
      [:div {:style {:width "100%" :height "100%"}}
       [:img {:src "imgs/pyramids.jpg" :alt "beeple"}]
       [:a {:href   "https://beeple-crap.com"
            :target "_blank"
            :style  {:pointer-events "all"
                     :font-size      "40px"
                     :position       "absolute"
                     :bottom         ".5em"
                     :right          "1em"
                     :color          "white"}}
        "beeple"]])}

   {:id    "26"
    :props {:class "prefs"}
    :content
    (fn []
      [:div {:style {:width "100%" :height "100%"}}
       [:img {:src   "imgs/era.png"
              :alt   "era"
              :style {:object-position (str "center " (rand-int 101) "%")}}]
       [:a {:href   "https://ericasmith.co"
            :target "_blank"
            :style  {:pointer-events "all"
                     :font-size      "40px"
                     :position       "absolute"
                     :bottom         ".5em"
                     :right          "1em"
                     :color          "white"
                     :text-shadow    "0px 0px 5px black"}}
        "Erica"]])}

   {:id    "27"
    :props {:class "things"}
    :content
    (fn []
      [:div
       [:a {:href   "https://nuid.io"
            :target "_blank"
            :style  {:display        "block"
                     :pointer-events "all"}}
        [:h1 {:style {:margin "0"}}
         [:span {:style {:color   @gray2-rgb-css-str-ratom
                         :display "inline-block"}} "Nu"]
         [:span {:style {:color   (cond (> @gray1-ratom 192) "#0000ff"
                                        (< @gray1-ratom 64)  "#00ffaf"
                                        :else                "white")
                         :display "inline-block"}} "ID"]]]
       [:a {:href   "https://nuid.io"
            :target "_blank"
            :style  {:color          @gray2-rgb-css-str-ratom
                     :pointer-events "all"}}
        [:p {:style {:margin "0"}} "Decentralized Authentication"]]])}

   {:id    "28"
    :props {:class "things"}
    :content
    (let [xf-css-str (str "translateY(-4px)")]
      [:img {:src   "imgs/lolli.png"
             :alt   "lolli"
             :style {:-webkit-transform xf-css-str
                     :-moz-transform    xf-css-str
                     :-ms-transform     xf-css-str
                     :transform         xf-css-str}}])}

   {:id    "29"
    :props {:class "people"}
    :content
    (fn []
      (if (> (.-width (dom/getViewportSize)) 1000)
        [:video
         {:src       "imgs/escape-room.mp4"
          :poster    "imgs/escape-room.mp4"
          :type      "video/mp4"
          :muted     true
          :auto-play true
          :loop      true}]
        [:img {:src "imgs/escape-room.jpg" :alt "nuidians"}]))}

   {:id      "30"
    :props   {:class (if (< (max @gray1-ratom @gray2-ratom) 192) "nolan things" "things")}
    :content [:img {:src "imgs/colorcrete.jpg" :alt "colorcrete"}]}

   {:id    "31"
    :props {:class "prefs"}
    :content
    (fn []
      [:div {:style {:width "100%" :height "100%"}}
       (if (> (.-width (dom/getViewportSize)) 1000)
         [:video
          {:src       "https://scontent-iad3-1.cdninstagram.com/v/t50.2886-16/30524586_164635920916978_7079781141053440_n.mp4?_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=E36DGHhjNncAX_jYx7s&oe=5E8C68EA&oh=9c2b74415043ece393fe7eb669b6b4a5"
           :poster    "https://scontent-iad3-1.cdninstagram.com/v/t51.2885-15/e15/30603270_164853797669555_2580934565010866176_n.jpg?_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_cat=111&_nc_ohc=9afSaG3-vHoAX_sCdC8&oh=dcee1d4e309f5d01393d1e04eaf8ccc5&oe=5E8CCCA4"
           :type      "video/mp4"
           :muted     true
           :auto-play true
           :loop      true}]
         [:img {:src "https://scontent-iad3-1.cdninstagram.com/v/t51.2885-15/e15/30603270_164853797669555_2580934565010866176_n.jpg?_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_cat=111&_nc_ohc=9afSaG3-vHoAX_sCdC8&oh=dcee1d4e309f5d01393d1e04eaf8ccc5&oe=5E8CCCA4" :alt "dvdp"}])
       [:a {:href   "https://davidope.com/"
            :target "_blank"
            :style  {:pointer-events "all"
                     :font-size      "40px"
                     :position       "absolute"
                     :bottom         ".5em"
                     :right          "1em"
                     :color          "white"}}
        "dvdp"]])}

   {:id    "32"
    :props {:class "quotes"}
    :content
    (fn []
      [:div {:style {:width "80%"}}
       [:p {:style {:display     "block"
                    :font-weight "bold"}}
        "one big thing for me has always been: always think what you do sucks. because the second you stop believing that, you suck. and that's a fact"]
       [:p ".• julian casablancas"]])}

   {:id      "33"
    :content [:img {:src "imgs/truck.jpg" :alt "truck"}]}

   {:id    "2000000000000"
    :props {:class "nolan"}}])

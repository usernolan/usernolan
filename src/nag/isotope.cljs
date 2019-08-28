(ns nag.isotope
  (:require
    [goog.dom :as dom]))

(def opts #js {"itemSelector" ".isotope"
               "percentPosition" "true"
               "layoutMode" "masonry"
               "masonry" #js {"columnWidth" ".isotope-sizer"}})

(defn init
  []
  (def iso (js/Isotope. ".isotope-container" opts)))

(def old-filter (atom nil))

(defn contains-particles?
  [el]
  (dom/findNode el #(some-> % .-classList (.contains "particles"))))

(defn reload-particles!
  [& [{:keys [id config-path]
       :or {id "particles"
            config-path "js/particles-nuid-config.json"}}]]
  (js/particlesJS.load id config-path))

(defn scope
  [el]
  (some-> el .-classList (.add "scoped"))
  (when (contains-particles? el)
    (reload-particles!)))

(defn arrange
  [{:keys [class filter f]
    :or {filter (str "." class)
         f scope}}]
  (goog.array/map (dom/getElementsByClass class) f)
  (.arrange iso #js {"filter" filter}))

(defn show
  [new-filter]
  (let [is (some-> "isotope-container"
                   dom/getElementByClass
                   dom/getChildren)]
    (condp = new-filter
      @old-filter (arrange {:class "isotope"
                            :f #(some-> % .-classList (.remove "scoped"))})
      :nolan (arrange {:class "nolan"})
      :people (arrange {:class "people"})
      :things (arrange {:class "things"})
      :prefs (arrange {:class "prefs"})
      :quotes (arrange {:class "quotes"})
      :contact (arrange {:class "contact"})
      :rand (do (goog.array/map
                  (dom/getElementsByClass "isotope")
                  #(let [r (rand)]
                     (when (< r 0.15) (some-> % .-classList (.add "scoped" "rand")))))
                (.arrange iso #js {"filter" ".rand"}))
      :all (arrange {:class "isotope"})
      (js/console.log "?"))
    (reset! old-filter (if (= @old-filter new-filter) nil new-filter))
    (js/window.scrollTo 0 0)))

(defn title
  []
  [:h1
   {:style {:cursor "pointer"}
    :on-click #(show :nolan)}
   "nolan"])

(def nav-list
  [{:display "people" :on-click #(show :people)}
   {:display "things" :on-click #(show :things)}
   {:display "prefs" :on-click #(show :prefs)}
   {:display "quotes" :on-click #(show :quotes)}
   {:display "contact" :on-click #(show :contact)}
   {:display "rand" :on-click #(show :rand)}
   {:display "all" :on-click #(show :all)}])

(def gray1 (rand-int 256))
(def gray1-rgb (str "rgb(" gray1 "," gray1 "," gray1 ")"))
(def gray2 (- 255 gray1))
(def gray2-rgb (str "rgb(" gray2 "," gray2 "," gray2 ")"))
(def lighter (if (< gray1 gray2) gray2 gray1))
(def lighter-rgb (if (= lighter gray1) gray1-rgb gray2-rgb))
(def darker (if (< gray1 gray2) gray1 gray2))
(def darker-rgb (if (= darker gray1) gray1-rgb gray2-rgb))
(defn set-lighter [el] (-> el .-target .-style .-color (set! lighter-rgb)))
(defn set-darker [el] (-> el .-target .-style .-color (set! darker-rgb)))

(defn isotope
  [{:keys [id props content]}]
  (let [on-click (fn [e]
                   (some-> e .-target .-classList (.toggle "scoped"))
                   (.layout iso))]
    [:div.isotope
     (merge
       props
       {:style {:box-shadow (str "inset 0 0 0 4px " darker-rgb)
                :color darker-rgb}
        :on-click on-click})
     [:p.id id]
     [:div.content
      {:style {:pointer-events "none"
               :auto-focus false}}
      content]]))

(defn hover-li
  [{:keys [href icon]}]
  [:li {:style {:pointer-events "all"}}
   [:a {:href href
        :on-mouse-over set-lighter
        :on-mouse-out set-darker
        :style {:margin-right (if (> (.-width (dom/getViewportSize)) 500) "25px" "15px")
                :font-size (if (> (.-width (dom/getViewportSize)) 500) "75px" "50px")
                :color darker-rgb}}
    icon]])

(defn hover-ul
  [lis]
  [:ul {:style {:margin 0 :padding 0}}
   (for [li lis]
     ^{:key (:href li)}
     [hover-li li])])

(def isotopes
  [{:id "1"
    :props {:class "nolan"}
    :content [:p {:style {:width "90%"}} "im nolan. im originally from indiana and have an unbelievable family. pretty much everything else about me can be found out by clicking around furiously on this page."]}

   {:id "2"
    :props {:class "people"}
    :content [:img {:src "imgs/fam.jpg" :alt "fam"}]}

   {:id "3"
    :props {:class "things"}
    :content [:img {:src "imgs/rock.png" :alt "rock"
                    :style {:object-fit "contain"}}]}

   {:id "4"
    :props {:class "quotes"}
    :content
    [:div {:style {:width "80%"}}
     [:p {:style {:display "block"}}
      (str
       "\""
       (rand-nth
        ["information is the resolution of uncertainty."
         "my greatest concern was what to call [entropy]."])
       "\"")]
     [:p ".• claude shannon"]]}

   {:id "5"
    :props {:class "contact"}
    :content
    [hover-ul
     [{:href "https://github.com/Nolan330"
       :icon [:i.fab.fa-github]}
      {:href "https://twitter.com/_nolan330"
       :icon [:i.fab.fa-twitter]}
      {:href "https://www.linkedin.com/in/nolan330"
       :icon [:i.fab.fa-linkedin]}
      {:href "mailto:nolan330@gmail.com"
       :icon [:i.fas.fa-envelope]}]]}

   {:id "6"
    :content [:img {:src "imgs/ducks.jpg" :alt "ducks"}]}

   {:id "7"
    :props {:class "quotes"}
    :content
    [:div {:style {:width "80%"}}
     [:h3 {:style {:display "block"}}".• overview effect"]
     [:p "a cognitive shift in awareness reported by some astronauts and cosmonauts during spaceflight."]]}

   {:id "8"
    :content [:img {:src "imgs/beach.jpg" :alt "gray beach"
                    :style {:object-fit "unset"}}]}

   {:id "9"
    :props {:class "quotes"}
    :content
    [:div {:style {:width "80%"}}
     [:p {:style {:display "block"}}
      (str
       "\""
       (rand-nth
        ["we don't get to stop the world, especially not to observe it."
         "when you combine two pieces of data you get data. when you combine two machines you get trouble."
         "design is to take things apart in such a way that they can be put back together."])
       "\"")]
     [:p ".• rich hickey"]]}

   {:id "10"
    :props {:class "things"}
    :content [:img {:src "imgs/ballpoint.jpg" :alt "ballpoint"}]}

   {:id "11"
    :props {:class "quotes"}
    :content
    [:div {:style {:width "80%"}}
     [:p {:style {:display "block"}} "\"remember, one of the most important principles in programming is the same as one of the most important principles in sorcery, all right? that's if you have the name of the spirit, you get control over it.\""]
     [:p ".• hal abelson"]]}

   {:id "12"
    :content [:img {:src "imgs/grandcan.jpg" :alt "grand canyon"}]}

   {:id "13"
    :props {:class "people"}
    :content [:img {:src "imgs/shlin.jpg" :alt "💙"}]}

   {:id "14"
    :props {:class "nolan quotes"}
    :content [:p "worry is a misuse of the imagination .•"]}

   {:id "15"
    :props {:class "things"}
    :content [:img {:src "imgs/pipe.jpg" :alt "pipe"}]}

   {:id "16"
    :props {:class "people"}
    :content [:img {:src "imgs/louis.jpg" :alt "louis"}]}

   {:id "17"
    :props {:class "people"}
    :content [:img {:src "imgs/squids.jpg" :alt "🦑"}]}

   {:id "18"
    :props {:class (if (>= lighter 192) "nolan things" "things")}
    :content [:img {:src "imgs/space.jpg" :alt "space"}]}

   {:id "19"
    :props {:class "things"}
    :content [:img {:src "imgs/midway.jpg" :alt "airport"}]}

   {:id "20"
    :props {:class "prefs"}
    :content
    ; discogs, songexploder, sonicpi
    [hover-ul
     [{:href "https://open.spotify.com/user/nolan330"
       :icon [:i.fab.fa-spotify]}
      {:href "https://soundcloud.com/nolan330/sets"
       :icon [:i.fab.fa-soundcloud]}]]}

   {:id "21"
    :props {:class "prefs"}
    :content
    [hover-ul
     [{:href "https://behance.net/IntegrationFactory/appreciated"
       :icon [:i.fab.fa-behance]}]]}

   {:id "22"
    :props {:class "prefs"}
    :content
    [:ul
     [:li [:img {:src "imgs/borderlands.png" :alt "borderlands"}]]
     [:li [:img {:src "imgs/fez.png" :alt "fez"}]]
     [:li [:img {:src "imgs/ssb.png" :alt "ssb"}]]
     [:li [:img {:src "imgs/wow.png" :alt "wow"}]]]}

   {:id "23"
    :props {:class "people"}
    :content [:img {:src "imgs/bois.jpg" :alt "bois"}]}

   {:id "24"
    :props {:class "people"}
    :content [:img {:src "imgs/phish.jpg" :alt "phaesh"}]}

   {:id "25"
    :props {:class "prefs"}
    :content
    [:div {:style {:width "100%" :height "100%"}}
     [:img {:src "imgs/shlin.png" :alt "ashlin c. dolan"
            :style {:object-fit "contain"}}]
     [:a {:href "https://ashlindolan.com"
          :on-mouse-over set-lighter
          :on-mouse-out set-darker
          :style {:pointer-events "all"
                  :font-size "40px"
                  :position "absolute"
                  :bottom ".5em"
                  :right "1em"
                  :color darker-rgb}}
      "ACD"]]}

   {:id "26"
    :props {:class "prefs"}
    :content
    [:div {:style {:width "100%" :height "100%"}}
     [:img {:src "imgs/profhos.jpg" :alt "profhos"}]
     [:a {:href "http://sugarboypress.blogspot.com"
          :on-mouse-over set-lighter
          :on-mouse-out set-darker
          :style {:pointer-events "all"
                  :font-size "40px"
                  :position "absolute"
                  :bottom ".5em"
                  :right "1em"
                  :color darker-rgb}}
      "Mark"]]}

   {:id "27"
    :props {:class "prefs"}
    :content
    [:div {:style {:width "100%" :height "100%"}}
     [:img {:src "imgs/pyramids.jpg" :alt "beeple"}]
     [:a {:href "https://beeple-crap.com"
          :on-mouse-over set-darker
          :on-mouse-out set-lighter
          :style {:pointer-events "all"
                  :font-size "40px"
                  :position "absolute"
                  :bottom ".5em"
                  :right "1em"
                  :color lighter-rgb}}
      "beeple"]]}

   {:id "28"
    :props {:class "prefs"}
    :content
    [:a {:href "https://ericasmith.co"
         :on-mouse-over set-lighter
         :on-mouse-out set-darker
         :style {:pointer-events "all"
                 :color darker-rgb
                 :width "80%"}}
     [:h1 "Erica Smith — Graphic Design"]]}

   {:id "29"
    :props {:class "things"}
    :content
    [:div
     [:a {:href "https://nuid.io"
          :style {:display "block"
                  :pointer-events "all"}}
      [:h1
       [:span {:on-mouse-over #(-> % .-target .-style .-color (set! "#00f2a2"))
               :on-mouse-out #(-> % .-target .-style .-color (set! "#181818"))
               :style {:color "#181818"}} "Nu"]
       [:span {:on-mouse-over #(-> % .-target .-style .-color (set! "#181818"))
               :on-mouse-out #(-> % .-target .-style .-color (set! "#00f2a2"))
               :style {:color "#00f2a2"}} "ID"]]]
     [:a {:href "https://nuid.io"
          :on-mouse-over #(-> % .-target .-style .-color (set! "#00f2a2"))
          :on-mouse-out #(-> % .-target .-style .-color (set! "#181818"))
          :style {:pointer-events "all"
                  :color "#181818"}}
      [:p "Decentralized Authentication"]]
     [:div#particles.particles
      {:style {:position "absolute"
       :height "100%"
       :width "100%"
       :left 0
       :top 0}}]]}

   {:id "30"
    :props {:class "things"}
    :content [:img {:src "imgs/lolli.png" :alt "lolli"}]}

   {:id "31"
    :props {:class "people"}
    :content
    (if (> (.-width (dom/getViewportSize)) 1000)
      [:video
       {:src "imgs/escape-room.mp4"
        :poster "imgs/escape-room.mp4"
        :type "video/mp4"
        :muted true
        :auto-play true
        :loop true}]
      [:img {:src "imgs/escape-room.jpg" :alt "nuidians"}])}

   {:id "32"
    :props {:class (if (< lighter 192) "nolan things" "things")}
    :content [:img {:src "imgs/colorcrete.jpg" :alt "colorcrete"}]}

   {:id "33"
    :props {:class "quotes"}
    :content
    [:div {:style {:width "80%"}}
     [:p {:style {:display "block"}}
      (str
       "\""
       (rand-nth
        ["one main factor in the upward trend of animal life has been the power of wandering."
         "seek simplicity, and distrust it."
         "the only simplicity to be trusted is found on the far side of complexity."
         "we think in generalities, but we live in details."
         "a science that hesitates to forget its founders is lost."
         "in the evolution of real knowledge, [a contradiction] marks the first step in progress towards victory."])
       "\"")]
     [:p ".• alfred north whitehead"]]}

   {:id "2000000000"
    :props {:class "nolan"}}])

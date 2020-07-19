(ns nag.html.isotope
  (:require
   [garden.stylesheet :as g.stylesheet]
   [nag.isotope :as isotope]
   [nag.lib :as lib]
   [nag.nav :as nav]
   [rum.core :as rum]))

(rum/defc ->li-component
  [{::keys [href icon]}]
  [:li
   [:a {:href href :target "_blank"}
    icon]])

(rum/defc ->ul-component
  [lis]
  (when (seq lis)
    [:ul {:class (lib/->html-safe ::isotope/ul)}
     (map ->li-component lis)]))

(def data
  [{::nav/filters [::nav/nolan]
    ::content     [:p {:style {:width "80%"}}
                   "im nolan. im originally from indiana and have an unbelievable family. pretty much everything else about me can be found out by clicking around furiously on this page."]}
   {::nav/filters [::nav/people]
    ::content     [:img {:alt "my fam" :loading "lazy" :src "/imgs/fam.jpg"}]}
   {::nav/filters [::nav/things]
    ::content     [:img {:alt     "colorful artwork"
                         :loading "lazy"
                         :src     "/imgs/rock.png"
                         :style   {:object-fit "contain"}}]}
   {::nav/filters [::nav/nolan ::nav/quotes]
    ::content     [:div {:style {:width "80%"}}
                   [:p {:style {:display "block" :font-weight "bold"}}
                    "one main factor in the upward trend of animal life has been the power of wandering"]
                   [:p ".• alfred north whitehead"]]}
   {::nav/filters [::nav/contact]
    ::content     (->ul-component
                   [{::href "https://github.com/notalwaysgray"
                     ::icon [:i.icon-github-circled]}
                    {::href "https://twitter.com/notalwaysgray"
                     ::icon [:i.icon-twitter]}
                    {::href "https://instagram.com/n.o.lan"
                     ::icon [:i.icon-instagram]}
                    {::href "https://www.linkedin.com/in/notalwaysgray"
                     ::icon [:i.icon-linkedin-squared]}
                    {::href "mailto:nolan330@gmail.com"
                     ::icon [:i.icon-mail-alt]}])}
   {::content [:img {:alt     "childhood baseball team"
                     :loading "lazy"
                     :src     "/imgs/ducks.jpg"}]}
   {::nav/filters [::nav/quotes]
    ::content     [:div {:style {:width "80%"}}
                   [:p {:style {:display "block" :font-weight "bold"}}
                    "my greatest concern was what to call it"]
                   [:p ".• claude shannon"]]}
   {::content [:img {:alt     "rocky california beach"
                     :loading "lazy"
                     :src     "/imgs/beach.jpg"
                     :style   {:object-fit "unset"}}]}
   {::nav/filters [::nav/quotes]
    ::content     [:div {:style {:width "80%"}}
                   [:p {:style {:display "block" :font-weight "bold"}}
                    "design is to take things apart in such a way that they can be put back together"]
                   [:p ".• rich hickey"]]}
   {::content [:img {:alt "the grand canyon" :loading "lazy" :src "/imgs/grandcan.jpg"}]}
   {::nav/filters [::nav/quotes]
    ::content     [:div {:style {:width "80%"}}
                   [:p {:style {:display "block" :font-weight "bold"}}
                    "remember, one of the most important principles in programming is the same as one of the most important principles in sorcery, all right?"]
                   [:p ".• hal abelson"]]}
   {::nav/filters [::nav/quotes]
    ::content     [:div {:style {:width "80%"}}
                   [:h3 {:style {:display "block"}} ".• overview effect"]
                   [:p "a cognitive shift in awareness reported by some astronauts and cosmonauts during spaceflight"]]}
   {::content [:div {:style {:width "100%" :height "100%"}}
               [:img {:alt "shlin" :loading "lazy" :src "imgs/shlin.jpg"}]
               [:a {:href   "https://ashlindolanstudio.com/"
                    :style  {:position "absolute"
                             :bottom   ".5em"
                             :right    "1em"
                             :color    "white"}
                    :target "_blank"}
                [:h1 "ACD"]]]}
   {::nav/filters [::nav/nolan ::nav/things]
    ::content     [:img {:alt     "a sidewalk chalk portal into outer space"
                         :loading "lazy"
                         :src     "/imgs/space.jpg"}]}
   {::nav/filters [::nav/things]
    ::content     [:img {:alt     "vague array of cross-sectional keyholes"
                         :loading "lazy"
                         :src     "/imgs/keys.png"
                         :style   {:filter         "saturate(0%) brightness(0%) contrast(100%)"
                                   :height         "84%"
                                   :width          "unset"
                                   :-webkit-filter "saturate(0%) brightness(0%) contrast(100%)"}}]}
   {::nav/filters [::nav/people]
    ::content     [:img {:alt     "my family's dog louis"
                         :loading "lazy"
                         :src     "/imgs/louis.jpg"}]}
   {::nav/filters [::nav/people]
    ::content     [:img {:alt     "a picture of friends"
                         :loading "lazy"
                         :src     "/imgs/squids.jpg"}]}
   {::nav/filters [::nav/things]
    ::content     [:img {:alt     "colorfully lit hallway at a busy, modern airport"
                         :loading "lazy"
                         :src     "/imgs/midway.jpg"}]}
   {::nav/filters [::nav/prefs]
    ::content     (->ul-component
                   [{::href "https://open.spotify.com/user/nolan330"
                     ::icon [:i.icon-spotify]}
                    {::href "https://www.discogs.com/user/notalwaysgray/collection?header=1"
                     ::icon [:i.icon-cd]}
                    {::href "https://soundcloud.com/notalwaysgray/sets"
                     ::icon [:i.icon-soundcloud]}])}
   {::nav/filters [::nav/prefs]
    ::content     (->ul-component
                   [{::href "https://behance.net/notalwaysgray/appreciated"
                     ::icon [:i.icon-behance]}])}
   {::nav/filters [::nav/prefs]
    ::content     (let [style {:filter         "saturate(0%) brightness(0%) contrast(100%)"
                               :-webkit-filter "saturate(0%) brightness(0%) contrast(100%)"}]
                    [:ul
                     {:class "-nag-isotope-ul"}
                     [:li [:img {:src "/imgs/borderlands.png" :loading "lazy" :alt "borderlands" :style style}]]
                     [:li [:img {:src "/imgs/fez.png" :loading "lazy" :alt "fez" :style style}]]
                     [:li [:img {:src "/imgs/ssb.png" :loading "lazy" :alt "ssb" :style style}]]
                     [:li [:img {:src "/imgs/wow.png" :loading "lazy" :alt "wow" :style style}]]])}
   {::nav/filters [::nav/people]
    ::content     [:img {:alt "friends" :loading "lazy" :src "/imgs/bois.jpg"}]}
   {::nav/filters [::nav/people]
    ::content     [:img {:alt     "phish; the band"
                         :loading "lazy"
                         :src     "/imgs/phish.jpg"}]}
   {::nav/filters [::nav/prefs]
    ::content     [:div {:style {:width "100%" :height "100%"}}
                   [:img {:alt     "printmaker mark hosford"
                          :loading "lazy"
                          :src     "/imgs/profhos.jpg"}]
                   [:a {:href   "http://sugarboypress.com"
                        :style  {:position "absolute"
                                 :bottom   ".5em"
                                 :right    "1em"
                                 :color    "white"}
                        :target "_blank"}
                    [:h1 "Mark"]]]}
   {::nav/filters [::nav/prefs]
    ::content     [:div {:style {:width "100%" :height "100%"}}
                   [:img {:alt     "digital artist beeple"
                          :loading "lazy"
                          :src     "/imgs/pyramids.jpg"}]
                   [:a {:href   "https://beeple-crap.com"
                        :style  {:position "absolute"
                                 :bottom   ".5em"
                                 :right    "1em"
                                 :color    "white"}
                        :target "_blank"}
                    [:h1 "beeple"]]]}
   {::nav/filters [::nav/prefs]
    ::content     [:div {:style {:width "100%" :height "100%"}}
                   [:img {:alt     "my sister's a graphic designer in Los Angeles"
                          :loading "lazy"
                          :src     "/imgs/era.png"
                          :style   {:object-position (str "center " (rand-int 101) "%")}}]
                   [:a {:href   "https://ericasmith.co"
                        :style  {:position "absolute"
                                 :bottom   ".5em"
                                 :right    "1em"
                                 :color    "white"}
                        :target "_blank"}
                    [:h1 "Erica"]]]}
   {::nav/filters [::nav/things]
    ::content     [:a {:href   "https://nuid.io"
                       :style  {:display "block"
                                :width   "33%"}
                       :target "_blank"}
                   [:img {:alt     "nuid, inc."
                          :loading "lazy"
                          :src     "/imgs/nuid.svg"
                          :style   {:filter         "invert(0)"
                                    :-webkit-filter "invert(0)"}}]]}
   {::nav/filters [::nav/things]
    ::content     (let [xf-css-str (str "translateY(-4px)")]
                    [:img {:src     "/imgs/lolli.png"
                           :loading "lazy"
                           :alt     "lolli"
                           :style   {:-webkit-transform xf-css-str
                                     :-moz-transform    xf-css-str
                                     :-ms-transform     xf-css-str
                                     :transform         xf-css-str}}])}
   {::nav/filters [::nav/people]
    ::content     [:img {:alt     "early nuidians"
                         :loading "lazy"
                         :src     "/imgs/escape-room.jpg"}]}
   {::nav/filters [::nav/things]
    ::content     [:img {:alt     "spraypainted concrete, under construction"
                         :loading "lazy"
                         :src     "imgs/colorcrete.jpg"}]}
   {::nav/filters [::nav/prefs]
    ::content     [:div {:style {:width "100%" :height "100%"}}
                   [:img {:alt     "digital artist dvdp"
                          :loading "lazy"
                          :src     "/imgs/dvdp.jpg"}]
                   [:a {:href   "https://davidope.com/"
                        :style  {:position "absolute"
                                 :bottom   ".5em"
                                 :right    "1em"
                                 :color    "white"}
                        :target "_blank"}
                    [:h1 "dvdp"]]]}
   {::nav/filters [::nav/quotes]
    ::content     [:div {:style {:width "80%"}}
                   [:p {:style {:display "block" :font-weight "bold"}}
                    "one big thing for me has always been: always think what you do sucks. because the second you stop believing that, you suck. and that's a fact"]
                   [:p ".• julian casablancas"]]}
   {::content [:img {:alt     "bright yellow pickup truck driving on a beach"
                     :loading "lazy"
                     :src     "/imgs/truck.jpg"}]}])

(rum/defc ->isotope-component
  [i {::nav/keys [filters] ::keys [content]}]
  [:button {:class (apply lib/->html-safe ::isotope/isotope filters)}
   [:p (inc i)]
   [:div {:class (lib/->html-safe ::isotope/content)}
    content]])

(rum/defc component
  []
  [:div {:class (lib/->html-safe ::isotope/container)}
   [:div {:class (lib/->html-safe ::isotope/sizer)}]
   (map-indexed ->isotope-component data)])

(def css
  [[(lib/->css-selector ::isotope/container)
    {:height     "100vh"
     :margin     "0 7px 0 3.5px"
     :max-height "100vh"
     :min-height "100vh"}]
   [(lib/->css-selector ::isotope/sizer)
    (lib/->css-selector ::isotope/isotope)
    {:height "25%"
     :width  "16.66%"}]
   [(lib/->css-selector ::isotope/isotope)
    {:background              "none"
     :border                  "3.5px solid transparent"
     :border-top-right-radius "1.2em"
     :box-shadow              "inset 0 0 0 3.5px #000"
     :box-sizing              "border-box"
     :font-size               "1.1rem"
     :overflow                "hidden"
     :padding                 "0"
     :position                "relative"
     :text-align              "left"}
    [:>
     [:p
      {:margin   "0"
       :position "absolute"
       :right    "0.75em"
       :top      "0.5em"}]]]
   [(lib/->css-selector ::isotope/content)
    {:align-items             "center"
     :border-top-right-radius "1.2em"
     :box-sizing              "border-box"
     :display                 "none"
     :height                  "100%"
     :justify-content         "center"
     :margin                  "0 auto"
     :pointer-events          "none"
     :width                   "100%"}]
   [(lib/->css-selector ::isotope/expanded)
    {:height "50%"
     :width  "50%"}
    [(lib/->css-selector ::isotope/content)
     {:display "flex"}
     [:a {:pointer-events "all"}]
     [:img :video
      {:border-top-right-radius "0.8em"
       :height                  "100%"
       :object-fit              "cover"
       :width                   "100%"}]
     [:ul
      [:li
       [:img
        {:margin    "0 14px"
         :max-width "75px"}]]]
     [(lib/->css-selector ::isotope/ul)
      {:display    "flex"
       :list-style "none"
       :margin     "0"
       :padding    "0"}
      [:li
       [:a
        {:color     "#000"
         :font-size "75px"
         :margin    "0 21px"}]]]]]
   [(g.stylesheet/at-media
     {:screen true :max-width "1000px"}
     [(lib/->css-selector ::isotope/sizer)
      (lib/->css-selector ::isotope/isotope)
      {:width "33.33%"}]
     [(lib/->css-selector ::isotope/expanded)
      {:height "60%"
       :width  "100%"}
      [(lib/->css-selector ::isotope/content)
       [:ul
        [:li
         [:img
          {:margin    "0 7px"
           :max-width "50px"}]]]]])]
   [(g.stylesheet/at-media
     {:screen true :max-width "500px"}
     [(lib/->css-selector ::isotope/sizer)
      (lib/->css-selector ::isotope/isotope)
      {:height "20%"}]
     [(lib/->css-selector ::isotope/expanded)
      {:height "40%"}
      [(lib/->css-selector ::isotope/content)
       [(lib/->css-selector ::isotope/ul)
        [:li
         [:a
          {:font-size "50px"
           :margin    "0 7px"}]]]]])]
   [(g.stylesheet/at-media
     {:screen true :max-height "500px"}
     [(lib/->css-selector ::isotope/sizer)
      (lib/->css-selector ::isotope/isotope)
      {:height "33%"
       :width  "33%"}]
     [(lib/->css-selector ::isotope/expanded)
      {:height "66%"
       :width  "66%"}])]
   [(g.stylesheet/at-media
     {:screen true :max-width "350px"}
     [(lib/->css-selector ::isotope/expanded)
      {:width "100%"}
      [(lib/->css-selector ::isotope/content)
       [(lib/->css-selector ::isotope/ul)
        [:li
         [:a {:font-size "42px"}]]]]])]])

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
                   "im nolan. i was raised by wolves in indiana and have an
                   unbelievable family. everything else about me can be found
                   out by clicking around furiously on this page"]}

   {::nav/filters [::nav/quotes]
    ::content     [:div {:style {:width "80%"}}
                   [:p {:style {:display "block" :font-weight "bold"}}
                    "one main factor in the upward trend of animal life has been
                    the power of wandering"]
                   [:p ".• alfred north whitehead"]]}

   {::nav/filters [::nav/contact]
    ::content     (->ul-component
                   [{::href "mailto:nolan330@gmail.com"
                     ::icon [:img {:src "/svg/icon/envelope-square-solid.svg"}]}
                    {::href "https://github.com/notalwaysgray"
                     ::icon [:img {:src "/svg/icon/github-brands.svg"}]}
                    {::href "https://www.linkedin.com/in/notalwaysgray"
                     ::icon [:img {:src "/svg/icon/linkedin-brands.svg"}]}])}

   {::content [:div {:style {:width "100%" :height "100%"}}
               [:a {:href   "https://www.beeple-crap.com/everydays"
                    :class  (lib/->html-safe ::isotope/external-link-icon)
                    :target "_blank"}
                [:img {:src "/svg/icon/external-link-regular.svg"}]]
               [:img {:class   (lib/->html-safe ::isotope/cover)
                      :alt     "pyramidal landscape"
                      :loading "lazy"
                      :src     "/jpg/pyramids.jpg"}]]}

   {::nav/filters [::nav/nolan]
    ::content     [:img {:class   (lib/->html-safe ::isotope/cover)
                         :alt     "sidewalk portal into outer space"
                         :loading "lazy"
                         :src     "/jpg/space.jpg"}]}

   {::nav/filters [::nav/quotes]
    ::content     [:div {:style {:width "80%"}}
                   [:p {:style {:display "block" :font-weight "bold"}}
                    "my greatest concern was what to call it"]
                   [:p ".• claude shannon"]]}

   {::content [:div {:style {:width "100%" :height "100%"}}
               [:a {:href   "https://ashlindolanstudio.com/"
                    :class  (lib/->html-safe ::isotope/external-link-icon)
                    :target "_blank"}
                [:img {:src "/svg/icon/external-link-regular.svg"}]]
               [:img {:class   (lib/->html-safe ::isotope/cover)
                      :alt     "shlin"
                      :loading "lazy"
                      :src     "/jpg/shlin.jpg"}]]}

   {::content [:div {:style {:width "80%"}}
               [:h3 {:display "block"}
                [:span ".•"]
                [:a {:href   "https://wikipedia.org/wiki/Mereology"
                     :style  {:margin-left "0.5rem"}
                     :target "_blank"}
                 "mereology"]]
               [:p "the study of parts and the wholes they form"]]}

   {::content [:a {:href   "https://github.com/notalwaysgray/fm"
                   :style  {:color           "white"
                            :text-align      "center"
                            :font-size       "3em"
                            :text-decoration "none"
                            :text-shadow     "0px 0.5rem rgba(173,216,230,0.42), -0.5rem 0px rgba(255,192,203,0.42)"}
                   :target "_blank"}
               [:h1 "fm"]]}

   {::content nil}

   {::content [:div {:style {:width "100%" :height "100%"}}
               [:a {:href   "https://www.ericasmith.co/"
                    :class  (lib/->html-safe ::isotope/external-link-icon)
                    :target "_blank"}
                [:img {:src "/svg/icon/external-link-regular.svg"}]]
               [:img {:class (lib/->html-safe ::isotope/cover)
                      :alt   "pixelated monotone flowers"
                      :src   "/png/era.png"
                      :style {:object-position "center 15%"}}]]}

   {::nav/filters [::nav/quotes]
    ::content     [:div {:style {:width "80%"}}
                   [:p {:style {:display "block" :font-weight "bold"}}
                    "design is to take things apart in such a way that they can
                    be put back together"]
                   [:p ".• rich hickey"]]}

   {::content [:img {:class   (lib/->html-safe ::isotope/cover)
                     :alt     "the grand canyon"
                     :loading "lazy"
                     :src     "/jpg/grandcan.jpg"}]}

   {::nav/filters [::nav/nolan]
    ::content     [:div {:style {:width "80%"}}
                   [:h3 {:display "block"}
                    [:span ".•"]
                    [:a {:href   "https://wikipedia.org/wiki/Overview_effect"
                         :style  {:margin-left "0.5rem"}
                         :target "_blank"}
                     "overview effect"]]
                   [:p "a cognitive shift in awareness reported by some
                   astronauts and cosmonauts during spaceflight"]]}

   {::content [:a {:href   "https://nuid.io"
                   :style  {:display "block" :width "33%"}
                   :target "_blank"}
               [:img {:alt     "nuid, inc."
                      :loading "lazy"
                      :src     "/svg/nuid.svg"
                      :style   {:filter         "invert(0)"
                                :-webkit-filter "invert(0)"}}]]}

   {::nav/filters [::nav/quotes]
    ::content     [:div {:style {:width "80%"}}
                   [:p {:style {:display "block" :font-weight "bold"}}
                    "remember, one of the most important principles in
                    programming is the same as one of the most important
                    principles in sorcery, all right? that's if you have the
                    name of the spirit, you can invoke it"]
                   [:p ".• hal abelson"]]}

   {::nav/filters [::nav/quotes]
    ::content     [:div {:style {:width "80%"}}
                   [:p {:style {:display "block" :font-weight "bold"}}
                    "what we know now, is that these spaces are not linearly
                    separable. there is no line that leaves the useful and
                    interesting on one side and the foolhardy on the other"]
                   [:p ".• mark tarver"]]}

   {::nav/filters [::nav/quotes]
    ::content     [:div {:style {:width "80%"}}
                   [:p {:style {:display "block" :font-weight "bold"}}
                    "one big thing for me has always been: always think what you
                    do sucks. because the second you stop believing that, you
                    suck. and that's a fact"]
                   [:p ".• julian casablancas"]]}

   {::content [:div {:style {:width "100%" :height "100%"}}
               [:a {:href   "https://genius.com/The-voidz-where-no-eagles-fly-lyrics"
                    :class  (lib/->html-safe ::isotope/external-link-icon)
                    :target "_blank"}
                [:img {:src "/svg/icon/external-link-regular.svg"}]]
               [:img {:class   (lib/->html-safe ::isotope/cover)
                      :alt     "album cover for where no eagles fly by the voidz"
                      :loading "lazy"
                      :src     "/jpg/julian.jpg"}]]}])

(rum/defc ->isotope-component
  [i {::nav/keys [filters] ::keys [content]}]
  [:button {:class (apply lib/->html-safe ::isotope/isotope filters)}
   [:p (inc i)]
   [:div {:class (lib/->html-safe ::isotope/content)}
    content]])

(rum/defc component []
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
     :box-shadow              "inset 0 0 0 1.5px #000"
     :box-sizing              "border-box"
     :font-size               "1rem"
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
    {:height "50%" :width "50%"}
    [(lib/->css-selector ::isotope/content)
     {:display "flex"}
     [:a {:pointer-events "all"}]
     [(lib/->css-selector ::isotope/cover)
      {:border-top-right-radius "0.8em"
       :height                  "100%"
       :object-fit              "cover"
       :width                   "100%"}]
     [(lib/->css-selector ::isotope/external-link-icon)
      {:position "absolute"
       :bottom   "1em"
       :right    "1em"
       :width    "1.5em"}
      [:> [:img {:filter         "invert(100%)"
                 :-webkit-filter "invert(100%)"}]]]
     [(lib/->css-selector ::isotope/ul)
      {:display         "flex"
       :justify-content "space-around"
       :list-style      "none"
       :margin          "0"
       :padding         "0"
       :width           "50%"}
      [:li {:margin "0 5px" :width "66px"}]]]]
   [(g.stylesheet/at-media
     {:screen true :max-width "1000px"}
     [(lib/->css-selector ::isotope/sizer)
      (lib/->css-selector ::isotope/isotope)
      {:width "33.33%"}]
     [(lib/->css-selector ::isotope/expanded)
      {:height "60%"
       :width  "100%"}])]
   [(g.stylesheet/at-media
     {:screen true :max-width "500px"}
     [(lib/->css-selector ::isotope/sizer)
      (lib/->css-selector ::isotope/isotope)
      {:height "20%"}]
     [(lib/->css-selector ::isotope/expanded)
      {:height "40%"}
      [(lib/->css-selector ::isotope/content)
       [(lib/->css-selector ::isotope/ul)
        {:width "80%"}
        [:li {:width "42px"}]]]])]
   [(g.stylesheet/at-media
     {:screen true :max-height "500px"}
     [(lib/->css-selector ::isotope/sizer)
      (lib/->css-selector ::isotope/isotope)
      {:height "33%"
       :width  "33%"}]
     [(lib/->css-selector ::isotope/expanded)
      {:height "66%"
       :width  "66%"}
      [(lib/->css-selector ::isotope/content)
       [(lib/->css-selector ::isotope/ul)
        [:li {:width "42px"}]]]])]
   [(g.stylesheet/at-media
     {:screen true :max-width "350px"}
     [(lib/->css-selector ::isotope/expanded)
      {:width "100%"}])]])

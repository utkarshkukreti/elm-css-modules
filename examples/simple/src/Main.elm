module Main exposing (main)

import Browser
import Html exposing (div, text)
import Style.Thing


main : Program () () ()
main =
    Browser.staticPage <|
        div []
            [ div [ Style.Thing.red ] [ text "Red" ]
            , div [ Style.Thing.green ] [ text "Green" ]
            ]

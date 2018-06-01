module Main exposing (main)

import Browser
import Html exposing (div, text)
import Style.Alert
import Style.Button


main : Program () () ()
main =
    Browser.staticPage <|
        div []
            [ div [ Style.Button.primary ] [ text "Primary Button" ]
            , text " "
            , div [ Style.Button.secondary ] [ text "Secondary Button" ]
            , div [ Style.Alert.primary ] [ text "Primary Alert" ]
            , div [ Style.Alert.secondary ] [ text "Secondary Alert" ]
            ]

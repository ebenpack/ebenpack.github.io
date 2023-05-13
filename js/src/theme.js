import {EditorView} from "@codemirror/view"
import {HighlightStyle, tags as t} from "@codemirror/highlight"

const chalky = "#AE81FF",
  coral = "#F92672",
  cyan = "#56b6c2",
  invalid = "#ffffff",
  ivory = "#abb2bf",
  stone = "#7d8799",
  malibu = "#61afef",
  sage = "#98c379",
  whiskey = "#66D9EF",
  violet = "#c678dd",
  darkBackground = "#272822",
  highlightBackground = "#373831",
  background = "#272822",
  tooltipBackground = "#353a42",
  selection = "#49483e",
  cursor = "white"

export const oneDarkTheme = EditorView.theme({
    "&": {
      color: ivory,
      backgroundColor: background,
      fontSize: "1.3em"
    },

    ".cm-content": {
      caretColor: cursor
    },

    "&.cm-focused .cm-cursor": {borderLeftColor: cursor},
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {backgroundColor: selection},

    ".cm-panels": {backgroundColor: darkBackground, color: ivory},
    ".cm-panels.cm-panels-top": {borderBottom: "2px solid black"},
    ".cm-panels.cm-panels-bottom": {borderTop: "2px solid black"},

    ".cm-searchMatch": {
      backgroundColor: "#72a1ff59",
      outline: "1px solid #457dff"
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "#6199ff2f"
    },

    ".cm-activeLine": {backgroundColor: highlightBackground},
    ".cm-selectionMatch": {backgroundColor: "#aafe661a"},

    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "#bad0f847",
      outline: "1px solid #515a6b"
    },

    ".cm-gutters": {
      backgroundColor: background,
      color: "white",
      border: "none",
      borderRight: "1px solid white"
    },

    ".cm-activeLineGutter": {
      backgroundColor: highlightBackground
    },

    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: "#ddd"
    },

    ".cm-tooltip": {
      border: "none",
      backgroundColor: tooltipBackground
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent"
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: tooltipBackground,
      borderBottomColor: tooltipBackground
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: highlightBackground,
        color: ivory
      }
    }
  }, {dark: true})

  /// The highlighting style for code in the One Dark theme.
  export const oneDarkHighlightStyle = HighlightStyle.define([
    {tag: t.keyword,
     color: violet},
    {tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
     color: "white"},
    {tag: [t.function(t.variableName), t.labelName],
     color: malibu},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)],
     color: whiskey},
    {tag: [t.definition(t.name), t.separator],
     color: ivory},
    {tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
     color: chalky},
    {tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)],
     color: cyan},
    {tag: [t.meta, t.comment],
     color: stone},
    {tag: t.strong,
     fontWeight: "bold"},
    {tag: t.emphasis,
     fontStyle: "italic"},
    {tag: t.strikethrough,
     textDecoration: "line-through"},
    {tag: t.link,
     color: stone,
     textDecoration: "underline"},
    {tag: t.heading,
     fontWeight: "bold",
     color: coral},
    {tag: [t.atom, t.bool, t.special(t.variableName)],
     color: "#fd971f" },
    {tag: [t.processingInstruction, t.string, t.inserted],
     color: sage},
    {tag: t.invalid,
     color: invalid},
  ])

  export const oneDark = [oneDarkTheme, oneDarkHighlightStyle]

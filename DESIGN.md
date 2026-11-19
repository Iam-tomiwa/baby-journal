---
name: The family journals
description: A cloth-bound baby journal on the web, one book per child, read by age.
colors:
  ink: "#1d2145"
  ink-soft: "#4a4e73"
  paper: "#fffdf8"
  cover-fg: "#fff6dc"
  tomato: "#c43a23"
  tomato-deep: "#9c2b18"
  cobalt: "#2f55d4"
  cobalt-deep: "#2242ad"
  marigold: "#f0a52b"
  marigold-deep: "#c9841a"
  leaf: "#27794d"
  leaf-deep: "#1c5d3a"
  plum: "#7a3f8f"
  plum-deep: "#5f2f71"
  sky: "#a9cbef"
  butter: "#f7d774"
  rose: "#f4b3ad"
  mint: "#a8d5b0"
  lilac: "#c9b8ec"
  muted: "#efeaf8"
  accent-wash: "#e3ecfb"
  destructive: "#b8321c"
typography:
  display:
    fontFamily: "Caprasimo, ui-serif, Georgia, serif"
    fontSize: "clamp(2.6rem, 9vw, 5.5rem)"
    fontWeight: 400
    lineHeight: 0.95
  headline:
    fontFamily: "Caprasimo, ui-serif, Georgia, serif"
    fontSize: "clamp(2.25rem, 7vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1
  title:
    fontFamily: "Gochi Hand, Comic Sans MS, cursive"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.25
  hand:
    fontFamily: "Gochi Hand, Comic Sans MS, cursive"
    fontSize: "1.3rem"
    fontWeight: 400
    lineHeight: 1.15
  body:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  print: "3px"
  board: "4px"
  lg: "0.875rem"
  xl: "1.225rem"
  2xl: "1.575rem"
  date-card: "1.6rem"
  3xl: "1.925rem"
  full: "9999px"
spacing:
  gutter: "1.25rem"
  gutter-sm: "2rem"
  grid-x: "1rem"
  grid-x-md: "2rem"
  grid-x-lg: "2.5rem"
  grid-y: "2.25rem"
  grid-y-md: "3.5rem"
  field-gap: "1.5rem"
  page-max: "72rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "0 1.75rem"
    height: "3rem"
  button-cover:
    backgroundColor: "{colors.cover-fg}"
    textColor: "{colors.tomato}"
    rounded: "{rounded.full}"
    padding: "0 1.5rem"
    height: "3rem"
  button-album:
    backgroundColor: "{colors.butter}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 1.75rem"
    height: "3.5rem"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-outline-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-round:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "3rem"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "0 1.25rem"
    height: "2.75rem"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "0 0.875rem"
    height: "3rem"
  desk-tab:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.full}"
    padding: "0 1rem"
    height: "2.75rem"
  desk-tab-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  index-tab:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 1rem"
    height: "2.75rem"
  index-tab-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  print-frame:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.hand}"
    rounded: "{rounded.print}"
    padding: "0.625rem 0.625rem 0.75rem"
  milestone-card:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.cover-fg}"
    rounded: "{rounded.date-card}"
    padding: "9%"
  note-slip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.hand}"
    padding: "2.15rem 1.25rem 1rem"
  cassette:
    backgroundColor: "{colors.tomato}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "5%"
---

# Design System: The family journals

## Overview

**Creative North Star: "The Book on the Shelf"**

The browser window is a cloth-bound baby journal. A journal's first screen is its closed cover in the child's colour; scrolling swings that cover open on its spine, and everything after is sheets of coloured sugar paper, one per age, with prints taped down by hand. Every surface is a named material: bookcloth, sugar paper, white print stock, washi tape, die-cut sticker vinyl, ruled note paper, an endpaper of dots, a navy album page of cassettes. All of it is drawn in code. The textures are procedural SVG noise and gradients, and the only rasters are the family's own photographs.

The mood is loud, warm and handmade: saturated colour at full bleed, chunky stamped lettering, handwriting wherever the book is written in, and nothing lined up quite straight. Density is low. A sheet holds a handful of things with generous paper around them, and a sheet with only one or two entries gives them more room and alternates sides, the way a hand-filled album does.

Motion follows one grammar: things are placed, not faded. Prints arrive a little high and turned, then settle on a spring; tape presses down after them; stickers are slapped on with a bounce; opening a print lifts that same print off the page into the reader. The parents' desk is the same world at lower volume: plain paper, navy ink, pill controls, and a live preview of the entry on the sheet it will land on.

**Key Characteristics:**
- Full-bleed coloured surfaces; no neutral page chrome anywhere in the reading experience.
- Three typefaces with fixed jobs: stamped display, handwriting, and a plain grotesk for controls.
- Navy ink for all text, borders and shadows. There is no grey and no black.
- Deterministic hand-placement: each entry's tilt, nudge, tape side and tape colour are seeded from its id, so the page looks arranged by hand and renders identically every time.
- Pills for anything pressed; near-square corners for anything made of paper.
- Light theme only.

## Colors

A primary-school paint box: five saturated bookcloth colours, five chalky sugar-paper pastels, navy ink and warm white paper.

### Primary
- **Navy Ink** (`ink`): all text on paper and sheets, every outline, the primary button, the active tab, the reader backdrop and the album sheet. Shadows are tinted with it too.
- **Soft Ink** (`ink-soft`): secondary text on the parents' desk (hints, row details, inactive desk tabs). Used on paper and the muted wash only.

### Secondary
The five bookcloths. Each is a cover colour, and the same five are the tones for date cards, washi tape and cassettes.
- **Tomato** (`tomato`, hinge shade `tomato-deep`): default cover.
- **Cobalt** (`cobalt`, `cobalt-deep`): also the focus ring, caret, upload progress and the has-a-song mark.
- **Marigold** (`marigold`, `marigold-deep`): the one cloth that takes ink lettering instead of cream.
- **Leaf** (`leaf`, `leaf-deep`): also the upload-succeeded text.
- **Plum** (`plum`, `plum-deep`).
- **Stamp Cream** (`cover-fg`): lettering, stitching and the button on tomato, cobalt, leaf and plum cloth.

### Tertiary
The sugar-paper sheets, dealt to chapters in a fixed order: sky, butter, rose, mint, lilac, then round again.
- **Sky** (`sky`), **Butter** (`butter`), **Rose** (`rose`), **Mint** (`mint`), **Lilac** (`lilac`): chapter backgrounds, index tabs, and the preview panel on the desk. Butter doubles as the accent on navy: mixtape title, reader date line, the album-page button, the selected cassette outline and the text selection colour.
- **Album** (the `ink` value used as a sheet): the mixtape page and the journal footer.

### Neutral
- **Paper** (`paper`): the desk background, prints, note slips, cassette labels, dialogs, inputs. Warm white, never pure white.
- **Lilac Wash** (`muted`): the desk tab tray and inline code.
- **Sky Wash** (`accent-wash`): hover fill on the upload well and suggestion chips.
- **Brick** (`destructive`): the remove button and error text only.
- Borders are ink at reduced opacity (18% for hairlines, 42% for input strokes), never a separate grey.

### Named Rules
**The Navy Ink Rule.** Text, outlines and shadows are navy (`ink`), at full strength or as a transparency of it. Grey and black do not appear.

**The Paired Foreground Rule.** A cloth or tone never sets its own text colour. It carries a foreground with it: cream on tomato, cobalt, leaf and plum; ink on marigold. Ink on those four saturated cloths fails contrast (below 3:1), and cream on marigold fails worse (1.9:1).

**The Soft Ink Stays on Paper Rule.** `ink-soft` is for paper and the lilac wash. On rose and lilac sheets it drops to about 4.4:1, so text on sugar paper is full ink.

## Typography

**Display Font:** Caprasimo (with ui-serif, Georgia, serif)
**Hand Font:** Gochi Hand (with Comic Sans MS, cursive)
**Body/Label Font:** Schibsted Grotesk (with ui-sans-serif, system-ui, sans-serif)

**Character:** A fat, soft-cornered display face that reads as foil-stamped or cut from felt, a round felt-tip hand for whatever is written in the book, and a plain friendly grotesk that stays out of the way on controls.

### Hierarchy
- **Display** (400, `clamp(2.6rem, 9vw, 5.5rem)`, line-height 0.95): chapter titles, the mixtape title, the shelf heading (up to 6rem, 0.92). On the cover the child's name scales with the cover itself (container units, capped at 11rem, line-height 0.9) and steps down for long names so it stays on one line. Also the date on a milestone card.
- **Headline** (400, `clamp(2.25rem, 7vw, 3.75rem)`, line-height 1): the parents' desk heading; 1.75rem for walkthrough step titles.
- **Title** (Gochi Hand, 1.5rem, tight): inscriptions under a display heading, such as a chapter's month range, the shelf line, "This journal belongs to".
- **Hand** (Gochi Hand, 1.2rem to 1.3rem, line-height 1.15): print captions, milestone titles, cassette labels. Note slips set it at 1.3rem on a fixed 1.75rem line so the writing sits on the rules. 1.75rem for the caption in the reader.
- **Body** (Schibsted Grotesk 400, 1rem, line-height 1.625; 1.125rem for empty-state and setup paragraphs): desk copy, the longer story under a print in the reader, form values. Paragraphs are capped between 38ch and 75ch.
- **Label** (Schibsted Grotesk 600, 0.875rem): field labels, index tabs, corner links. Buttons use the same weight at 1rem.

### Named Rules
**The Three Voices Rule.** Caprasimo is stamped or printed on the book. Gochi Hand is written in the book by a person: captions, firsts, notes, inscriptions. Schibsted Grotesk is the app speaking: controls, hints, system copy. A control is never set in the hand, and a caption is never set in the grotesk.

**The Ruled Line Rule.** Handwriting on ruled paper locks to the 1.75rem rule: line-height, the gap before the sign-off and the top offset are all multiples of it.

## Layout

Journal reading is a single column of full-bleed sheets. Each sheet has a 1.25rem gutter (2rem from 640px), a 72rem content measure, and generous vertical paper (4rem top and 6rem bottom on phones, 6rem and 8rem from 768px). From 1024px sheets reserve 6rem on the right for the index tabs.

Entries sit on a dense-flow collage grid: 2 columns on phones, 6 from 768px, 12 from 1024px, with gaps of 1rem / 2rem / 2.5rem across and 2.25rem / 3.5rem down. Span depends on what the entry is: a portrait print or date card takes 3 of 12, a landscape print 5, a note 4. A sheet with one or two entries gives them 4, 7 and 6 instead, and odd-numbered sheets start from the right so sparse pages alternate sides. Items are vertically centred in their row, then pushed off the line by a seeded nudge (-14px to 22px, scaled to 40% on phones) and a seeded tilt (1.2 to 3.6 degrees either way).

The cover and everything on it sizes from its own container, so the same component fills a window or sits on the shelf at 17rem wide. The shelf is a wrapped, centred row of books at a 3:4 ratio, each tilted a few degrees.

The parents' desk is a 72rem column on paper. Forms are a single stack of fields with 1.5rem between them; from 1024px a sticky preview panel sits to the right (roughly 1fr to 0.85fr). Below that, the preview moves to just above the submit button so it is on screen at the moment of adding.

Breakpoints are Tailwind's defaults, used at 640px, 768px, 1024px and occasionally 1280px.

## Elevation & Depth

Depth is physical and shallow: things lie on paper and cast a short, soft, navy-tinted shadow. Nothing floats on a glow, and surfaces themselves are flat colour with a paper tooth.

### Shadow Vocabulary
- **Print** (`0 1px 1px rgb(29 33 69 / 0.14), 0 12px 22px -12px rgb(29 33 69 / 0.5)`): anything lying on a sheet. Prints, date cards, note slips, cassettes, the nameplate, round reader buttons, desktop index tabs.
- **Lifted** (`0 2px 3px rgb(29 33 69 / 0.16), 0 26px 40px -18px rgb(29 33 69 / 0.6)`): something picked up off the page. The print in the reader, the page block under a shelf book.
- **Tape** (`0 1px 2px rgb(29 33 69 / 0.18)`): washi tape only.
- **Sticker** (drop-shadow `0 3px 3px rgb(29 33 69 / 0.3)`): follows the die-cut outline.
- **Cover board** (`14px 10px 30px -12px rgb(29 33 69 / 0.6)`): the swinging cover over the page beneath.
- **Window cut** (inset, top-weighted, ink at 55%): the photo set back behind the cover board.

### Named Rules
**The Lying Flat Rule.** A shadow says how far a thing is off the paper. Resting things take the print shadow, held things the lifted one. Shadows are never decoration and never coloured anything but ink.

**The Placed, Not Faded Rule.** Entrances are physical. An entry arrives 30px high, 5 degrees over-turned and 6% large, then settles on the shared spring (stiffness 300, damping 26, mass 0.9), staggered 70ms across a row. Tape presses on 280ms later, scaling down from 150%. Stickers land last on a bouncier spring (stiffness 420, damping 16). Only transform and opacity animate. With reduced motion, or before the animation engine loads, everything rests in place and the cover becomes a static first screen.

## Shapes

Two families. Paper goods have nearly square corners: prints at 3px, note slips and the nameplate at 0, a book's spine side at 4px with a rounder fore-edge. Everything a finger presses is a full pill or a circle: buttons, tabs, chips, the child picker, the cover swatches, the round photo window on the cover. Between them sit a few soft moulded objects: date cards (1.6rem), cassettes and dialogs (about 1.6rem), inputs (about 1.2rem), preview panels (about 1.9rem).

Sheets are cut apart with a pinking-shear edge: a 10px zigzag in the next sheet's colour biting into the one above. Nothing on a sheet sits square; tilt is part of the shape. Outlines, where used, are 2px solid ink, and the nameplate carries a 3px double rule. Focus is a 3px cobalt outline offset by 3px.

Stickers are flat two- or three-colour drawings with a thick white die-cut edge, dealt two to a chapter from one shuffled sheet per journal so neighbours never match.

## Components

### Buttons
Tactile pills that squash when pressed.
- **Shape:** full pill, 3rem tall (2.75rem for secondary actions, 3.5rem for the mixtape's play button), 600-weight grotesk at 1rem.
- **Primary:** ink fill, paper text. One per form or empty state.
- **On a cover:** cream fill with the cloth colour as text. On the album page: butter fill, ink text.
- **Outline:** 2px ink border, transparent; fills ink on hover.
- **Round:** 3rem paper circle with the print shadow, for close and previous/next in the reader.
- **Destructive:** brick fill, paper text, only inside the confirm dialog.
- **Hover / press:** scale up 3 to 5%, down to 97% on press, 150 to 200ms on `cubic-bezier(0.16, 1, 0.3, 1)`. No colour change on filled buttons.
- **Quiet links:** underlined 600-weight grotesk at 0.875rem with a 2.75rem hit area, for corner and footer navigation.

### Chips
- **Child picker:** 2px ink outline pill with a dot in the child's cover colour; fills ink when chosen.
- **Suggestion chips:** thin ink-at-40% outline; hover takes the sky wash, pressed state fills butter with a full ink border.
- **Video mark:** small ink pill, paper text, on the corner of a video print.

### Cards / Containers
- **Print frame:** paper border of 0.5rem to 0.625rem, slightly deeper at the bottom for the handwritten caption; 3px corners; print shadow; the image inset on a 2px radius.
- **Date card:** a square in one of the five tones with its paired foreground; age in small grotesk and an icon along the top, the date large in Caprasimo, the first's title in hand beneath. Padding is 9% of the card.
- **Note slip:** paper with cobalt rules at 28% every 1.75rem, square corners, handwriting throughout, date and "Love, name" on the last line.
- **Sheet:** flat sugar-paper colour with a tiled fractal-noise tooth at 6% ink. Also used rounded (about 1.9rem) as the desk's preview panel and for the sample-journal notice.
- **Dialogs:** paper, about 1.6rem to 1.9rem corners. The walkthrough tops each step with a 14rem sheet-coloured picture and slides steps past like pages (260ms).

### Inputs / Fields
- **Style:** paper fill, 1px ink-at-42% stroke, about 1.2rem corners, 3rem tall, 1rem text. Label above in 600-weight 0.875rem ink; hint below in soft ink.
- **Focus:** the global 3px cobalt outline.
- **Upload well:** 2px dashed ink-at-50% border, 1.6rem corners; border goes solid ink and the well takes the sky wash on hover, cobalt border while dragging. Progress is a 0.5rem cobalt bar.
- **Error:** brick text on a 10% brick wash, rounded, under the fields.

### Navigation
- **Index tabs (journal):** one per chapter in that chapter's sheet colour with a 2px ink border. From 1024px they stick out of the right edge, flat on the outside, with the print shadow; the current one turns ink and pulls further out, others slide out slightly on hover. Below 1024px they become a horizontally scrolling strip on an ink bar along the bottom, with a paper ring on the current one. The mixtape tab is ink with butter text and border. They appear only once the cover is open and hide while the reader is up.
- **Desk tabs:** a lilac-wash tray (pill from 640px, wrapping below) holding 2.75rem pills; the active one is ink with paper text.

### Book Cover
Bookcloth in the child's colour: two directions of stretched noise overlaid as warp and weft. A darker spine strip down the left edge is sewn with slightly uneven stitches in cream with an ink shadow thread. A round window with a deep-shade rim and an inset shadow holds the cover photo. The name is stamped below in Caprasimo, the birth date in hand, then the one action. Closed, the page block shows as fine ruled edges along the fore-edge and tail.

### Cover Opening
The journal's first screen. A 210svh scroll track pins the viewport while the cover rotates on its left edge from 0 to -96 degrees under 2400px perspective; the nameplate page on its dotted endpaper is uncovered beneath as an ink shade lifts. The button drives the same scroll over 1.15s.

### Reader
Opening a print lifts that same image off the sheet (shared layout) onto a 97% ink backdrop, framed by a thick paper ring with the lifted shadow. Caption in hand, story in grotesk, date line in butter. Arrow keys step, Escape closes, focus returns to the print.

### Cassette
A 1.38:1 body in one of the five tones, a paper label with the title in hand, and an ink window with two reels that spin while that song plays. The selected tape takes a butter outline.

## Do's and Don'ts

### Do:
- **Do** set every piece of text in `ink`, or in the foreground paired with its cloth: cream on tomato, cobalt, leaf and plum, ink on marigold.
- **Do** give each chapter the next sheet in the order sky, butter, rose, mint, lilac, and cut it from the one above with the pinked edge.
- **Do** tilt anything lying on a sheet between 1.2 and 3.6 degrees, seeded from its id so server and client agree.
- **Do** tape photos, videos and notes down with one washi strip in a tone colour. Date cards are not taped.
- **Do** keep hit areas at 2.75rem or more and every pressed control a pill or a circle.
- **Do** bring things in by placing them: transform and opacity only, on the shared settle spring, once per element.
- **Do** show a parent the entry on its real sheet colour before they add it.
- **Do** build new materials procedurally (SVG filters, gradients, masks). The only rasters are photographs.
- **Do** honour reduced motion with a fully laid-out, still page.

### Don't:
- **Don't** use grey or black for text, borders or shadows. Use ink or a transparency of it.
- **Don't** lay entries out as an equal-card photo grid. Spans follow what the entry is and how full the sheet is.
- **Don't** put the whole product on cream paper. Paper is for prints, slips and the desk; the journal's pages are coloured.
- **Don't** set controls or system copy in Gochi Hand, or captions and notes in Schibsted Grotesk.
- **Don't** use `ink-soft` on sugar-paper sheets.
- **Don't** add a dark theme, glows, blurs or gradient fills. Colour is flat and depth is a short navy shadow.
- **Don't** let parents choose stickers. They are dealt by the book.

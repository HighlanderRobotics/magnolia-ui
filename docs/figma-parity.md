# Figma component parity

Reference: [Lovat 2027 — Components](https://www.figma.com/design/aFsGTC9XlSZIO6HEQA1Zyz/Lovat-2027?node-id=0-1). Inspected through Figma MCP for this implementation. The supplied App page is 1701:108; shared component definitions are on 0:1. No Figma document was edited.

Run `npm run gallery` and open [the comparison preview](http://127.0.0.1:4173/figma). It renders production components, with source links beside each group. The preview self-hosts Heebo 400/500 and Material Symbols; the library continues to leave font ownership with the application.

| Reference                                                            | Implementation                                                                               |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Button/Spacious/Light 5:11; Dark 187:49                              | Comfortable visible height 44px, 16px Heebo Medium, 10px/20px padding, 7px radius            |
| Button/Compact/Light 205:27; Dark 205:52                             | Compact visible height 33px, 14px Heebo Medium, 6px/12px padding, 5px radius                 |
| Inputs 5:29                                                          | 44px/33px fields, 14px/10px horizontal content inset; original select chevrons               |
| Switch/Light 147:209; Dark 196:168                                   | 58×34 track, 28px thumb, 3px inset, 24px travel; state/disabled/hover colors                 |
| Checkbox/Radio sets under Inputs                                     | 24px comfortable, 18px compact, 10px/8px label gaps; original checked/disabled SVG artwork   |
| Menu/Spacious/Light 116:476; Compact 223:1498; Dark 196:135/223:1532 | 222px menu width, 140px maximum height, 8px/14px or 6px/10px row padding, surface background |
| Pills 1969:943                                                       | 14px Heebo Medium, 7px/10px padding, 7px radius, purple/secondary active states              |

Button widths with the reference label differ by up to one pixel because Figma rounds text bounds while browser text shaping and platform hinting differ. Heights, switch dimensions and selection sizes are asserted directly in browser tests.

Role-specific disabled colors are preserved instead of collapsing every button into the same gray. Text-only buttons stay transparent when disabled. Native React Native controls share these semantic states and Pill colors; they retain 48px touch targets and native platform interaction. Flutter remains a Material 3 adapter, rather than a web-control renderer.

## Accessibility differences retained intentionally

The Figma components include low-contrast states. The implementation keeps the existing accessible semantic values for field/unchecked-selection boundaries, placeholders, error messages and dark danger hover. The reference dark danger hover is #ab5858; the accessible implementation uses #963333 with a light foreground. Keyboard focus remains explicit, and radio boundaries receive an outer outline without editing the original SVG.

Visible web button boxes follow Figma, while invisible activation areas retain the 48px comfortable / 44px compact target. Checkbox, radio and switch labels also retain larger activation areas. Button labels can expand their control beyond its reference height. Disabled controls keep native disabled semantics; their subdued design colors are not normal interactive text.

Pill active swatches come from the actual shared Pill components (purple #bbaaf0 / secondary #292929), with their documented foregrounds. Inactive pills adapt to the current surface so they remain legible in dark mode. This corrects the old component's fixed dark foreground in dark app contexts.

## Original assets and verification

`figma-assets.json` records the source file/node, original SVG root dimensions and SHA-256 for 29 assets. Files in `packages/svelte/src/lib/assets/figma` are unmodified Figma downloads. Their root dimensions are retained; CSS slots use the corresponding 24px/18px selection size or 12.5×6.25 chevron. There are no temporary Figma asset URLs at runtime.

Tests check original bytes, CSS callsites, computed asset bindings and dimensions across light/dark and both densities, plus native state changes, disabled/cancelled Pill actions, axe, keyboard behavior and browser hydration. The gallery also covers all four button states and selection/disabled combinations. Web screenshots are recorded for desktop/mobile review; this does not establish migrated consumer or native-device parity.

Navigation chrome, scouting widgets, field artwork and app-specific screens from the App page remain application-owned and outside this component rewrite. Lovat dependencies and patches remain unchanged.

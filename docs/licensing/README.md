# Magnolia UI licensing proposal

**Draft for review only. Neither this page nor the [MIT template](proposed/MIT.txt) grants a license to Magnolia UI.** The template intentionally leaves the holder and year blank until the relevant rights holders approve the proposed grant.

[LVT-395](https://linear.app/highlander-robotics/issue/LVT-395) proposes MIT for standalone Magnolia UI, separate from Lovat's proposed core license. The intended scope is first-party reusable package code and tokens that the confirmed rights holders can license. Review examples and documentation separately, and do not assume that imported Figma assets, fonts, icon artwork, third-party code, or brand assets are included. Preserve applicable upstream notices.

## Before applying the license

- [ ] Confirm copyright holders and authority for current and historical contributions, and record the approval in [LVT-392](https://linear.app/highlander-robotics/issue/LVT-392).
- [ ] Review dependencies, the [Figma export inventories](../v2-assets.json) and [earlier asset inventory](../figma-assets.json), and packaged media. Identify what can be included, what needs separate attribution, and what must be excluded or replaced.
- [ ] Once approved, complete the MIT copyright line and add the root `LICENSE` and README scope. Update the Svelte, React Native, Starlight, and tokens npm manifests from `UNLICENSED` to `MIT`, sync lockfile metadata, and include the applicable license and notices in published packages, including Flutter.
- [ ] Inspect npm pack manifests and the Flutter publication dry run before shipping. Confirm reusable packages do not include Lovat core code, and verify GitHub license detection. Do not change the terms recorded for older releases by assumption.

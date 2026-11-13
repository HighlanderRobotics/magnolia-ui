<script lang="ts">
  import {
    MagnoliaUIRoot,
    DensityProvider,
    Button,
    TextField,
    Select,
    Switch,
    Checkbox,
    Radio,
    Pill,
    Icon,
    MenuWrapper,
    Menu,
    MenuButton,
  } from '@highlanderrobotics/magnolia-svelte';
  import type { Variant } from '@highlanderrobotics/magnolia-svelte';
  const panels = [
    { theme: 'light', density: 'comfortable', node: '5:11' },
    { theme: 'light', density: 'compact', node: '205:27' },
    { theme: 'dark', density: 'comfortable', node: '187:49' },
    { theme: 'dark', density: 'compact', node: '205:52' },
  ] as const;
  const variants: Variant[] = ['secondary', 'primary', 'danger', 'text-only'];
  const states = ['enabled', 'hover', 'disabled', 'active'];
  const options = [
    { label: 'Qualification', value: 'qm' },
    { label: 'Unavailable', value: 'unavailable', disabled: true },
    { label: 'Playoff', value: 'playoff' },
  ];
  let menu = $state(false);
  let activePill = $state(false);
  let lastAction = $state('Choose an action');
</script>

<div class="reference">
  <header class="intro">
    <a href="/">← Component gallery</a>
    <p>MAGNOLIA UI · FIGMA COMPONENTS</p>
    <h1>The same foundation,<br />in design and code.</h1>
    <div class="intro-bottom">
      <span>Lovat 2027 · Heebo · light & dark</span><a
        href="https://www.figma.com/design/aFsGTC9XlSZIO6HEQA1Zyz/Lovat-2027?node-id=0-1"
        target="_blank"
        rel="noreferrer">Open Figma reference ↗</a
      >
    </div>
  </header>
  <main>
    <section aria-labelledby="actions">
      <div class="section-heading">
        <h2 id="actions">01 / Buttons</h2>
        <p>Primary, secondary, danger and text actions in both densities.</p>
      </div>
      <div class="panels">
        {#each panels as panel}<MagnoliaUIRoot
            theme={panel.theme}
            density={panel.density}
            ><article
              class="panel"
              data-testid="buttons-{panel.theme}-{panel.density}"
            >
              <div class="panel-heading">
                <h3>{panel.theme} / {panel.density}</h3>
                <a
                  href="https://www.figma.com/design/aFsGTC9XlSZIO6HEQA1Zyz/Lovat-2027?node-id={panel.node.replace(
                    ':',
                    '-',
                  )}"
                  target="_blank"
                  rel="noreferrer">Reference ↗</a
                >
              </div>
              <div class="state-table">
                <div class="role-head">
                  <span></span>{#each variants as variant}<span
                      >{variant === 'text-only' ? 'Text' : variant}</span
                    >{/each}
                </div>
                {#each states as state}<div class="state-row">
                    <span class="state-name">{state}</span
                    >{#each variants as variant}<div class="sample">
                        <Button
                          {variant}
                          disabled={state === 'disabled'}
                          data-preview-state={state}>Button</Button
                        >
                      </div>{/each}
                  </div>{/each}
              </div>
            </article></MagnoliaUIRoot
          >{/each}
      </div>
    </section>
    <section aria-labelledby="inputs">
      <div class="section-heading">
        <h2 id="inputs">02 / Inputs & selection</h2>
        <p>Original vector artwork, native form behavior.</p>
      </div>
      <div class="panels">
        {#each panels as panel}<MagnoliaUIRoot
            theme={panel.theme}
            density={panel.density}
            ><article
              class="panel"
              data-testid="inputs-{panel.theme}-{panel.density}"
            >
              <div class="panel-heading">
                <h3>{panel.theme} / {panel.density}</h3>
                <a
                  href="https://www.figma.com/design/aFsGTC9XlSZIO6HEQA1Zyz/Lovat-2027?node-id=5-29"
                  target="_blank"
                  rel="noreferrer">Reference ↗</a
                >
              </div>
              <div class="input-samples">
                <TextField
                  ariaLabel="{panel.theme} {panel.density} placeholder"
                  placeholder="Placeholder"
                /><TextField
                  ariaLabel="{panel.theme} {panel.density} text"
                  value="Text"
                /><TextField
                  ariaLabel="{panel.theme} {panel.density} disabled field"
                  value="Text"
                  disabled
                /><Select
                  ariaLabel="{panel.theme} {panel.density} match"
                  placeholder="Placeholder"
                  items={options}
                /><Select
                  ariaLabel="{panel.theme} {panel.density} disabled select"
                  placeholder="Placeholder"
                  items={options}
                  disabled
                />
              </div>
              <div class="selections">
                {#each [false, true] as disabled}<div class="selection-column">
                    <Checkbox label="Option" {disabled} /><Checkbox
                      label="Option"
                      {disabled}
                      checked
                    /><Radio label="Option" {disabled} value="off" /><Radio
                      label="Option"
                      {disabled}
                      value="on"
                      group="on"
                    />
                  </div>{/each}
              </div>
              <div class="switches">
                <Switch label="Off" /><Switch label="On" value /><Switch
                  label="Disabled off"
                  disabled
                /><Switch label="Disabled on" value disabled />
              </div>
            </article></MagnoliaUIRoot
          >{/each}
      </div>
    </section>
    <section aria-labelledby="pills">
      <div class="section-heading">
        <h2 id="pills">03 / Pills & actions</h2>
        <p>Selection controls already used in the app designs.</p>
      </div>
      <div class="panels">
        {#each ['light', 'dark'] as theme}<MagnoliaUIRoot
            theme={theme as 'light' | 'dark'}
            ><article class="panel" data-testid="pills-{theme}">
              <div class="panel-heading">
                <h3>{theme} / pills</h3>
                <a
                  href="https://www.figma.com/design/aFsGTC9XlSZIO6HEQA1Zyz/Lovat-2027?node-id=1969-943"
                  target="_blank"
                  rel="noreferrer">Reference ↗</a
                >
              </div>
              <div class="pill-row">
                <Pill>Pill</Pill><Pill active>Pill</Pill><Pill
                  variant="secondary">Pill</Pill
                ><Pill variant="secondary" active>Pill</Pill>
              </div>
            </article></MagnoliaUIRoot
          >{/each}
      </div>
    </section>
    <section aria-labelledby="try">
      <div class="section-heading">
        <h2 id="try">04 / Try the controls</h2>
        <p>
          These are the production components, with keyboard and pointer
          interactions.
        </p>
      </div>
      <MagnoliaUIRoot theme="dark"
        ><article class="panel interactive">
          <Pill bind:active={activePill}>Toggle selection</Pill><MenuWrapper
            ><Button
              aria-haspopup="menu"
              aria-expanded={menu}
              aria-controls="reference-actions"
              onclick={() => (menu = !menu)}
              >Match actions <Icon icon="expand_more" /></Button
            ><Menu
              id="reference-actions"
              bind:open={menu}
              ariaLabel="Reference actions"
              ><MenuButton onclick={() => (lastAction = 'Match opened')}
                >Open match</MenuButton
              ><MenuButton disabled>Unavailable</MenuButton><MenuButton
                onclick={() => (lastAction = 'Match copied')}
                >Copy match</MenuButton
              ></Menu
            ></MenuWrapper
          ><span aria-live="polite">{lastAction}</span><DensityProvider
            density="compact"
            ><Button variant="secondary">Compact nested action</Button
            ></DensityProvider
          >
        </article></MagnoliaUIRoot
      >
    </section>
    <aside class="notes">
      <h2>Design notes</h2>
      <p>
        Visible control sizes, typography, spacing, switch geometry, disabled
        roles and original selection artwork follow the Figma components.
        Controls retain larger invisible hit areas and visible keyboard focus.
        Field borders, placeholder/error text and the dark danger hover keep
        accessible contrast where the reference is too faint.
      </p>
    </aside>
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    background: #f5f5f5;
    font-family: 'Heebo', sans-serif;
    color: #1f1f1f;
  }
  :global(:root) {
    --mg-icon-font-family: 'Material Symbols Rounded Variable';
  }
  .reference {
    max-width: 1440px;
    margin: auto;
    padding: 48px 40px 80px;
  }
  .intro > a {
    font-size: 14px;
  }
  .intro > p {
    margin: 40px 0 16px;
    font-size: 12px;
    letter-spacing: 0.14em;
  }
  .intro h1 {
    font-weight: 500;
    font-size: clamp(36px, 5vw, 64px);
    letter-spacing: -0.045em;
    line-height: 1.08;
    margin: 0 0 32px;
  }
  .intro-bottom {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    padding-bottom: 32px;
    border-bottom: 1px solid #b4b4b4;
  }
  a {
    color: inherit;
    text-underline-offset: 4px;
  }
  .section-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 20px;
    margin: 40px 0 18px;
  }
  .section-heading h2 {
    font-size: 22px;
    font-weight: 500;
    margin: 0;
  }
  .section-heading p {
    font-size: 14px;
    color: #454545;
    margin: 0;
  }
  .panels {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
  .panels :global(.mg-root) {
    border-radius: 14px;
  }
  .panel {
    padding: 24px;
    min-width: 0;
  }
  .panel-heading {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }
  .panel-heading h3 {
    font-size: 14px;
    font-weight: 500;
    text-transform: capitalize;
    margin: 0;
  }
  .panel-heading a {
    font-size: 12px;
    color: var(--mg-muted);
  }
  .state-table {
    overflow-x: auto;
    padding: 6px 4px 10px;
  }
  .state-row,
  .role-head {
    display: grid;
    grid-template-columns: 66px repeat(4, minmax(66px, 1fr));
    gap: 12px;
    align-items: center;
    min-width: 432px;
  }
  .role-head {
    font-size: 11px;
    color: var(--mg-muted);
    margin-bottom: 16px;
    text-align: center;
    text-transform: capitalize;
  }
  .state-row {
    margin: 18px 0;
  }
  .state-name {
    font-size: 11px;
    color: var(--mg-muted);
    text-transform: capitalize;
  }
  .sample {
    display: flex;
    justify-content: center;
  }
  .input-samples {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 183px));
    gap: 16px;
  }
  .selections {
    display: flex;
    gap: 48px;
    margin-top: 24px;
  }
  .selection-column {
    display: flex;
    flex-direction: column;
  }
  .switches {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px 16px;
    margin-top: 16px;
  }
  .pill-row {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    padding: 8px 0;
  }
  .interactive {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
    border-radius: 14px;
  }
  .notes {
    margin-top: 48px;
    border-top: 1px solid #b4b4b4;
    padding-top: 20px;
    max-width: 850px;
  }
  .notes h2 {
    font-size: 16px;
    font-weight: 500;
  }
  .notes p {
    font-size: 14px;
    line-height: 1.65;
    color: #454545;
  }
  :global([data-preview-state='hover'].mg-button.primary),
  :global([data-preview-state='active'].mg-button.primary) {
    background: var(--mg-primary-hover);
  }
  :global([data-preview-state='hover'].mg-button.secondary),
  :global([data-preview-state='active'].mg-button.secondary) {
    background: var(--mg-secondary-hover);
  }
  :global([data-preview-state='hover'].mg-button.danger),
  :global([data-preview-state='active'].mg-button.danger) {
    background: var(--mg-danger-hover);
  }
  :global([data-preview-state='hover'].mg-button.text-only),
  :global([data-preview-state='active'].mg-button.text-only) {
    color: var(--mg-primary-hover);
  }
  @media (max-width: 980px) {
    .panels {
      grid-template-columns: 1fr;
    }
    .reference {
      padding: 32px 20px;
    }
    .section-heading {
      display: block;
    }
    .section-heading p {
      margin-top: 8px;
    }
  }
  @media (max-width: 480px) {
    .panel {
      padding: 18px;
    }
    .input-samples {
      grid-template-columns: 1fr;
    }
    .switches {
      grid-template-columns: 1fr;
    }
  }
</style>

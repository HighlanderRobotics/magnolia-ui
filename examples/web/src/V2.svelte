<script lang="ts">
  import '@fontsource/roboto/400.css';
  import '@fontsource/roboto/500.css';
  import '@fontsource/roboto-mono/400.css';
  import {
    MagnoliaUIRoot,
    Button,
    TextField,
    SegmentedControl,
    Tabs,
    Card,
    Stat,
    Checkbox,
    Radio,
    Switch,
    Chip,
    IconButton,
    Kbd,
    SearchField,
    TextArea,
    Select,
  } from '../../../packages/svelte/src/lib/v2/index';
  let theme = $state<'dark' | 'light' | 'system'>('dark');
  let density = $state<'comfortable' | 'compact'>('comfortable');
  let tab = $state('overview');
  let period = $state('week');
  let name = $state('Northwind');
  let loading = $state(false);
  let saved = $state(false);
  let checked = $state(true),
    mixed = $state(true),
    notifications = $state(true),
    filter = $state(true);
  let radio = $state<string | null>('weekly'),
    interval = $state<string | null>('week'),
    search = $state(''),
    note = $state('');
  let submitted = $state('');
  const source =
    'https://www.figma.com/design/cXx2mM66UtpxNVbResHxq3/Magnolia-v2--Copy-';
  function save() {
    loading = true;
    setTimeout(() => {
      loading = false;
      saved = true;
    }, 1000);
  }
</script>

<MagnoliaUIRoot {theme} {density}>
  <main>
    <header>
      <div>
        <p class="eyebrow">MAGNOLIA UI</p>
        <h1>v2 component source</h1>
        <p class="intro">
          Production components · Figma variables · Dark and light · Two
          densities
        </p>
      </div>
      <div class="settings">
        <label
          >Theme <select aria-label="Theme" bind:value={theme}
            ><option value="dark">Dark</option><option value="light"
              >Light</option
            ><option value="system">System</option></select
          ></label
        >
        <label
          >Density <select aria-label="Density" bind:value={density}
            ><option value="comfortable">Comfortable</option><option
              value="compact">Compact</option
            ></select
          ></label
        >
      </div>
    </header>
    <p class="intro">
      Core implementation preview. Additional component families remain tracked
      in <a href="https://linear.app/highlander-robotics/issue/LVT-380"
        >LVT-380</a
      >.
    </p>
    <section aria-labelledby="actions">
      <div class="section-title">
        <h2 id="actions">Actions</h2>
        <a href={`${source}?node-id=43-148`}>Figma: Button</a>
      </div>
      <div class="row" data-testid="buttons">
        <Button>Button</Button><Button variant="secondary">Button</Button
        ><Button variant="tertiary">Button</Button><Button variant="danger"
          >Button</Button
        ><Button disabled>Button</Button><Button loading>Button</Button>
      </div>
      <div class="row">
        <Button size="medium">Button</Button><Button
          size="medium"
          variant="secondary">Button</Button
        ><Button size="medium" variant="tertiary">Button</Button><Button
          size="medium"
          variant="danger">Button</Button
        >
      </div>
      <div class="row">
        <IconButton label="More options" /><IconButton
          label="More options disabled"
          disabled
        /><Kbd key="K" modifier /><Kbd key="Enter" />
      </div>
    </section>
    <section aria-labelledby="input-controls">
      <div class="section-title">
        <h2 id="input-controls">Form controls</h2>
        <a href={`${source}?node-id=46-403`}>Figma: Actions &amp; Inputs</a>
      </div>
      <form
        onsubmit={(event) => {
          event.preventDefault();
          submitted = `Saved ${interval} report: ${note}`;
        }}
      >
        <div class="grid fields">
          <Select
            label="Report interval"
            items={[
              { value: 'day', label: 'Daily' },
              { value: 'week', label: 'Weekly' },
              { value: 'disabled', label: 'Unavailable', disabled: true },
              { value: 'month', label: 'Monthly' },
            ]}
            name="interval"
            bind:value={interval}
            required
          />
          <SearchField
            label="Search projects"
            placeholder="Search"
            shortcut="K"
            bind:value={search}
          />
          <TextArea
            label="Report notes"
            bind:value={note}
            characterLimit={280}
            placeholder="Add a note"
          />
        </div>
        <div class="row">
          <Checkbox label="Include archived" name="archived" bind:checked />
          <Checkbox
            label="Select all projects"
            checked
            indeterminate={mixed}
            onchange={() => (mixed = false)}
          />
          <Checkbox label="Disabled choice" disabled />
          <Switch label="Notifications" bind:checked={notifications} />
        </div>
        <fieldset class="choice-set">
          <legend>Report frequency</legend>
          <div class="row">
            <Radio
              name="frequency"
              value="daily"
              label="Daily frequency"
              bind:group={radio}
            /><Radio
              name="frequency"
              value="weekly"
              label="Weekly frequency"
              bind:group={radio}
            /><Radio
              name="frequency"
              value="disabled"
              label="Unavailable frequency"
              disabled
              bind:group={radio}
            />
          </div>
        </fieldset>
        <div class="row">
          <Chip label="Active projects" bind:selected={filter} /><Chip
            label="Paused"
          /><Chip label="Disabled filter" disabled /><Button
            type="submit"
            variant="secondary">Save report</Button
          ><Button type="reset" variant="tertiary">Reset report</Button>
        </div>
        {#if submitted}<p data-testid="report-saved">{submitted}</p>{/if}
      </form>
    </section>
    <section aria-labelledby="fields">
      <div class="section-title">
        <h2 id="fields">Fields</h2>
        <a href={`${source}?node-id=44-209`}>Figma: TextField</a>
      </div>
      <div class="grid fields">
        <TextField
          label="Project name"
          bind:value={name}
          helper="Visible to your team"
        /><TextField
          label="Match number"
          placeholder="Enter a number"
          error="Enter a value between 1 and 99"
        /><TextField
          label="Disabled field"
          placeholder="Placeholder"
          disabled
        />
      </div>
    </section>
    <section aria-labelledby="navigation">
      <div class="section-title">
        <h2 id="navigation">Navigation and value selection</h2>
        <a href={`${source}?node-id=54-87`}>Figma: Tab</a>
      </div>
      <Tabs
        label="Project views"
        bind:value={tab}
        items={[
          { value: 'overview', label: 'Overview' },
          { value: 'activity', label: 'Activity' },
          { value: 'notes', label: 'Notes' },
          { value: 'disabled', label: 'Unavailable', disabled: true },
        ]}
      >
        {#snippet children(selected)}<p class="panel">
            {selected === 'overview'
              ? `${name || 'Untitled project'} overview`
              : selected === 'activity'
                ? 'Recent project activity'
                : 'Project notes'}
          </p>{/snippet}
      </Tabs>
      <SegmentedControl
        label="Date range"
        bind:value={period}
        items={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
        ]}
      >
        {#snippet children(selected)}<p class="panel">
            Showing this {selected}
          </p>{/snippet}
      </SegmentedControl>
    </section>
    <section aria-labelledby="display">
      <div class="section-title">
        <h2 id="display">Display</h2>
        <a href={`${source}?node-id=49-142`}>Figma: Stat</a>
      </div>
      <div class="grid">
        <Card title={name || 'Untitled project'} description="Last 7 days">
          {#snippet action()}<Button
              variant="tertiary"
              size="medium"
              onclick={save}
              {loading}>Save</Button
            >{/snippet}
          <div class="stats">
            <Stat label="Total" value="1,284" emphasis /><Stat
              label="Per day"
              value="14.2"
              size="medium"
            /><Stat label="Best day" value="31" size="medium" />
          </div>
          <p class="status" role="status">
            {saved ? 'Changes saved' : 'All changes synced'}
          </p>
        </Card>
        <Card title="Data states" description="Missing values stay missing"
          ><div class="stats">
            <Stat label="No data" value={null} /><Stat
              label="Loading"
              loading
            />
          </div></Card
        >
      </div>
    </section>
  </main>
</MagnoliaUIRoot>

<style>
  :global(body) {
    margin: 0;
  }
  main {
    min-height: 100vh;
    max-width: 1440px;
    margin: auto;
    padding: 48px 64px;
  }
  header,
  .section-title,
  .settings {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
  }
  .settings {
    flex-wrap: wrap;
  }
  .settings label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }
  select {
    background: var(--mg-v2-color-bg-field);
    color: var(--mg-v2-color-fg-primary);
    border: 1px solid var(--mg-v2-color-border-default);
    border-radius: var(--mg-v2-radius-control);
    padding: 8px;
    font: inherit;
  }
  .eyebrow {
    font-size: 12px;
    letter-spacing: 0.1em;
    color: var(--mg-v2-color-fg-secondary);
    margin: 0 0 12px;
  }
  h1 {
    font-size: var(--mg-v2-type-title-lg-size);
    line-height: var(--mg-v2-type-title-lg-line);
    font-weight: 500;
    letter-spacing: -0.01em;
    margin: 0;
  }
  h2 {
    font-size: var(--mg-v2-type-title-md-size);
    line-height: var(--mg-v2-type-title-md-line);
    font-weight: 500;
    margin: 0;
  }
  a {
    color: var(--mg-v2-color-fg-accent);
    font-size: 13px;
  }
  .intro,
  .panel,
  .status {
    color: var(--mg-v2-color-fg-secondary);
  }
  .intro {
    margin: 12px 0 24px;
  }
  section {
    padding: 32px 0;
    border-top: 1px solid var(--mg-v2-color-border-subtle);
  }
  .section-title {
    margin-bottom: 24px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 16px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
  .fields {
    align-items: start;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .stats {
    display: flex;
    align-items: baseline;
    gap: 24px;
    flex-wrap: wrap;
  }
  .status {
    font-size: 13px;
    margin: 0;
  }
  .panel {
    margin: 16px 0 24px;
  }
  .choice-set {
    border: 0;
    padding: 0;
    margin: 16px 0 0;
    min-width: 0;
  }
  .choice-set legend {
    font-size: var(--mg-v2-type-label-sm-size);
    color: var(--mg-v2-color-fg-secondary);
  }
  @media (max-width: 800px) {
    main {
      padding: 24px;
    }
    header {
      align-items: flex-start;
      flex-direction: column;
    }
    .grid,
    .fields {
      grid-template-columns: 1fr;
    }
    .section-title {
      gap: 12px;
      align-items: baseline;
      flex-wrap: wrap;
    }
    .stats {
      gap: 20px;
    }
  }
</style>

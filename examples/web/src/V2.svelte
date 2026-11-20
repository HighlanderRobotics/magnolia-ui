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
    Badge,
    StatusIndicator,
    Trend,
    Avatar,
    AvatarGroup,
    ProgressBar,
    ProgressRing,
    Spinner,
    Skeleton,
    Divider,
    CardHeader,
    EmptyState,
    Banner,
    ListItem,
    AmbientWash,
    NumberField,
    Stepper,
    Link,
    SelectableCard,
    Steps,
    FileField,
    Attachment,
    Calendar,
    DateField,
    TimeField,
    Combobox,
    MultiSelect,
    Slider,
    NavItem,
    NavSection,
    NavRailItem,
    Breadcrumb,
    TabBarItem,
    TabBar,
    TopBar,
  } from '../../../packages/svelte/src/lib/v2/index';
  import Glyph from '../../../packages/svelte/src/lib/v2/Glyph.svelte';
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
  let confidence = $state(70);
  let destination = $state('Home');
  let collapsed = $state(false),
    mobileHome = $state(true),
    headerAction = $state('');
  let owner = $state<string | null>('priya'),
    tags = $state(['damaged', 'followup']),
    searching = $state(false);
  const people = [
    { value: 'priya', label: 'Priya Nair' },
    { value: 'pritam', label: 'Pritam Rao' },
    { value: 'april', label: 'April Ochoa' },
    { value: 'maya', label: 'Maya Chen' },
    { value: 'unavailable', label: 'Unavailable person', disabled: true },
  ];
  const tagOptions = [
    { value: 'damaged', label: 'Damaged' },
    { value: 'followup', label: 'Follow up' },
    { value: 'review', label: 'Needs review' },
    { value: 'archive', label: 'Archived', disabled: true },
  ];
  let dueDate = $state<string | undefined>('2026-10-14'),
    startTime = $state<string | undefined>('14:30'),
    rangeStart = $state<string | undefined>('2026-10-14'),
    rangeEnd = $state<string | undefined>('2026-10-17');
  let files = $state<File[]>([]),
    uploadFailed = $state(true),
    sampleVisible = $state(true),
    uploadVisible = $state(true),
    imageVisible = $state(true),
    currentStep = $state(1);
  let cycleTime = $state<number | undefined>(4.2),
    tally = $state(3),
    choice = $state<string | null>('phone');
  let selectedList = $state('northwind'),
    bannerOpen = $state(true),
    context = $state<string | null>('session-alpha');
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
    <section aria-labelledby="numeric-controls" data-testid="numeric-family">
      <div class="section-title">
        <h2 id="numeric-controls">Numbers and choices</h2>
        <a href={`${source}?node-id=103-1453`}>Figma: NumberField</a>
      </div>
      <form onsubmit={(event) => event.preventDefault()}>
        <div class="grid">
          <NumberField
            label="Cycle time"
            unit="s"
            helper="0–60, one decimal"
            min={0}
            max={60}
            step={0.1}
            bind:value={cycleTime}
            placeholder="–"
            name="cycleTime"
          />
          <div>
            <Stepper
              label="Items counted"
              bind:value={tally}
              min={0}
              max={5}
              name="tally"
            />
          </div>
        </div>
        <fieldset class="choice-set">
          <legend>Data source</legend>
          <div class="row">
            <SelectableCard
              title="This phone"
              description={'Items checked 12\nNotes: Latch is loose; reported to facilities.'}
              meta="2:41 PM"
              name="source"
              value="phone"
              bind:group={choice}
            /><SelectableCard
              title="Cloud version"
              description={'Items checked 14\nNotes: Reviewed by Maya.'}
              meta="2:45 PM"
              name="source"
              value="cloud"
              bind:group={choice}
            /><SelectableCard
              title="Archived version"
              description="Unavailable"
              name="source"
              value="archived"
              disabled
              bind:group={choice}
            />
          </div>
        </fieldset>
        <Button type="reset" variant="tertiary"
          >Reset numbers and choices</Button
        >
      </form>
      <div class="row">
        <Link href="#display">View all entries</Link><Link
          href="#display"
          variant="quiet">Team 8033</Link
        ><Link href={source} external>Open design source</Link><Link
          href="#display"
          disabled>Unavailable link</Link
        >
      </div>
    </section>
    <section aria-labelledby="files-and-progress" data-testid="files-family">
      <div class="section-title">
        <h2 id="files-and-progress">Files and flow</h2>
        <a href={`${source}?node-id=77-1216`}>Figma: FileField</a>
      </div>
      <Steps
        label="Report progress"
        items={['Details', 'Counts', 'Review']}
        current={currentStep}
      />
      <div class="row">
        <Button
          variant="tertiary"
          disabled={currentStep === 0}
          onclick={() => currentStep--}>Previous step</Button
        ><Button
          variant="secondary"
          disabled={currentStep === 2}
          onclick={() => currentStep++}>Next step</Button
        >
      </div>
      <form onsubmit={(event) => event.preventDefault()}>
        <FileField label="Photos" name="photos" bind:files />
        <div class="attachment-stack">
          {#each files as file, i}<Attachment
              name={file.name}
              detail={`${Math.round(file.size / 1024)} KB`}
              onRemove={() => {
                files = files.filter((_, index) => i !== index);
              }}
            />{/each}
        </div>
        <Button type="reset" variant="tertiary">Reset photos</Button>
      </form>
      <div class="attachment-stack">
        {#if uploadVisible}<Attachment
            name="north-gate.jpg"
            detail="2.4 of 3.1 MB"
            state="uploading"
            progress={77}
            onRemove={() => (uploadVisible = false)}
          />{/if}
        {#if sampleVisible}<Attachment
            name="inspection.jpg"
            state={uploadFailed ? 'failed' : 'done'}
            detail="3.1 MB"
            onRetry={() => (uploadFailed = false)}
            onRemove={() => (sampleVisible = false)}
          />{:else}<Button
            variant="tertiary"
            onclick={() => {
              sampleVisible = true;
              uploadFailed = true;
            }}>Restore attachment</Button
          >{/if}
        {#if imageVisible}<Attachment
            name="east-stand.png"
            state="image"
            detail="1.2 MB"
            onRemove={() => (imageVisible = false)}
          />{/if}
      </div>
    </section>
    <section aria-labelledby="dates-and-times" data-testid="temporal-family">
      <div class="section-title">
        <h2 id="dates-and-times">Dates and times</h2>
        <a href={`${source}?node-id=357-2430`}>Figma: DateField</a>
      </div>
      <form onsubmit={(event) => event.preventDefault()}>
        <div class="grid">
          <DateField
            label="Due date"
            name="dueDate"
            bind:value={dueDate}
            min="2026-10-01"
            max="2026-11-30"
            helper="October or November 2026"
          /><TimeField
            label="Start time"
            name="startTime"
            bind:value={startTime}
            helper="Local time"
          />
        </div>
        <Button variant="tertiary" type="reset">Reset dates and times</Button>
      </form>
      <Calendar
        label="Date range"
        range
        bind:value={rangeStart}
        bind:endValue={rangeEnd}
        today="2026-10-09"
      />
    </section>
    <section aria-labelledby="searchable-choices" data-testid="combo-family">
      <div class="section-title">
        <h2 id="searchable-choices">Searchable choices</h2>
        <a href={`${source}?node-id=77-1069`}>Figma: Combobox</a>
      </div>
      <form onsubmit={(event) => event.preventDefault()}>
        <div class="grid">
          <Combobox
            label="Owner"
            items={people}
            bind:value={owner}
            name="owner"
            placeholder="Search people"
            required
            itemNoun="people"
            loading={searching}
          /><MultiSelect
            label="Tags"
            items={tagOptions}
            bind:value={tags}
            name="tags"
            required
            loading={searching}
          />
        </div>
        <Button variant="tertiary" type="reset">Reset searchable choices</Button
        >
      </form>
      <Switch label="Simulate searching" bind:checked={searching} />
      <form onsubmit={(event) => event.preventDefault()}>
        <div class="row">
          <Slider
            label="Confidence"
            bind:value={confidence}
            name="confidence"
          /><Slider label="Disabled confidence" value={70} disabled />
        </div>
        <Button variant="tertiary" type="reset">Reset confidence</Button>
      </form>
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
    <section aria-labelledby="display" data-testid="display-family">
      <div class="section-title">
        <h2 id="display">Display</h2>
        <a href={`${source}?node-id=49-142`}>Figma: Stat</a>
      </div>
      <div class="display-stack">
        <div class="row">
          {#each ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as tone}<Badge
              label={tone}
              tone={tone as
                | 'neutral'
                | 'accent'
                | 'success'
                | 'warning'
                | 'danger'
                | 'info'}
              icon
            />{/each}
        </div>
        <div class="row">
          <StatusIndicator label="Synced" /><StatusIndicator
            label="3 overdue"
            tone="warning"
          /><StatusIndicator label="Review required" tone="danger" />
        </div>
        <div class="row">
          <Trend value={12} sentiment="positive" /><Trend
            value={-8}
            sentiment="positive"
          /><Trend value={0} />
        </div>
        <Divider />
        <div class="row">
          {#each [24, 28, 32, 40] as size}<Avatar
              name="Alex Baker"
              size={size as 24 | 28 | 32 | 40}
            /><Avatar
              name="Unassigned person"
              size={size as 24 | 28 | 32 | 40}
              content="icon"
            />{/each}
          <AvatarGroup
            people={[
              { name: 'Maya Chen' },
              { name: 'Sam Rivera' },
              { name: 'Priya Nair' },
              { name: 'Alex Kim' },
              { name: 'Jordan Lee' },
              { name: 'Taylor Reed' },
            ]}
          />
        </div>
        <div class="row">
          <ProgressBar label="Neutral completion" value={65} /><ProgressBar
            label="Accent completion"
            value={42}
            tone="accent"
          /><ProgressBar label="Pending completion" />
        </div>
        <div class="row">
          {#each [0, 25, 50, 75, 100] as value}<ProgressRing
              label={`${value} percent complete`}
              {value}
              tone="accent"
            />{/each}<ProgressRing
            label="Overall completion"
            value={65}
            size="large"
            tone="accent"
          />
        </div>
        <div class="row">
          <Spinner label="Loading small" /><Spinner
            label="Loading medium"
            size="medium"
          /><Spinner label="Loading large" size="large" /><Skeleton /><Skeleton
            shape="block"
          /><Skeleton shape="circle" />
        </div>
        <Banner
          title="Review pending tasks"
          body="Three tasks need an owner before this project can be completed."
          tone="warning"
          dismissible
          bind:open={bannerOpen}
        >
          {#snippet action()}<Button
              variant="tertiary"
              size="medium"
              onclick={() => (selectedList = 'larkspur')}>Review tasks</Button
            >{/snippet}
        </Banner>
        {#if !bannerOpen}<Button
            variant="tertiary"
            onclick={() => (bannerOpen = true)}>Restore banner</Button
          >{/if}
        <Card
          ><CardHeader title="Recent activity" description="Last 7 days" />
          <ListItem
            title="Northwind"
            description="214 entries"
            meta="2 h"
            selected={selectedList === 'northwind'}
            unread
            onclick={() => (selectedList = 'northwind')}
            >{#snippet leading()}<Avatar name="Maya Chen" />{/snippet}</ListItem
          >
          <ListItem
            title="Larkspur"
            description="233 entries"
            meta="4 h"
            selected={selectedList === 'larkspur'}
            onclick={() => (selectedList = 'larkspur')}
            >{#snippet leading()}<Glyph name="folder" />{/snippet}</ListItem
          >
          <ListItem
            title="Archived workspace"
            description="Read only"
            disabled
          />
        </Card>
        <EmptyState
          >{#snippet action()}<Button
              variant="secondary"
              onclick={() => (name = 'New project')}
              >{#snippet icon()}<Glyph name="plus" />{/snippet}Create item</Button
            >{/snippet}</EmptyState
        >
        <Select
          label="Data context"
          bind:value={context}
          items={[
            { value: 'session-alpha', label: 'Session Alpha' },
            { value: 'session-beta', label: 'Session Beta' },
          ]}
        />
        <div class="wash-demo">
          <AmbientWash contextId={context ?? 'session-alpha'} />
          <h3>
            {context === 'session-alpha' ? 'Session Alpha' : 'Session Beta'}
          </h3>
          <p>The same session gets the same ambient color on each device.</p>
        </div>
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
    <section
      data-testid="mobile-navigation-family"
      aria-label="Mobile navigation components"
    >
      <h2>Mobile navigation</h2>
      <TopBar
        title="Project settings"
        onback={() => (headerAction = 'Back')}
        onaction={() => (headerAction = 'More options')}
      />
      <TopBar
        title="Northwind"
        variant="large"
        {collapsed}
        onback={() => (headerAction = 'Back')}
        onaction={() => (headerAction = 'More options')}
      />
      <Button variant="tertiary" onclick={() => (collapsed = !collapsed)}
        >Toggle header collapse</Button
      >
      <div style="margin-top:16px">
        <TabBar label="Mobile destinations">
          <TabBarItem
            label="Home"
            selected={mobileHome}
            onclick={() => (mobileHome = !mobileHome)}
          />
          <TabBarItem label="Search" href="#mobile-search"
            >{#snippet icon()}<Glyph name="tab-search" />{/snippet}</TabBarItem
          >
          <TabBarItem label="Inbox" href="#mobile-inbox" badge={4}
            >{#snippet icon()}<Glyph name="tab-inbox" />{/snippet}</TabBarItem
          >
          <TabBarItem label="Profile" href="#mobile-profile"
            >{#snippet icon()}<Glyph name="tab-user" />{/snippet}</TabBarItem
          >
        </TabBar>
      </div>
      <p role="status">Header action: {headerAction}</p>
      <span id="mobile-search">Search destination</span> ·
      <span id="mobile-inbox">Inbox destination</span>
      · <span id="mobile-profile">Profile destination</span>
    </section>
    <section data-testid="navigation-family" aria-label="Navigation components">
      <h2>Navigation</h2>
      <Breadcrumb
        items={[
          { label: 'Projects', onclick: () => (destination = 'Projects') },
          { label: 'Northwind', href: '#navigation-current' },
          { label: 'Settings' },
        ]}
      />
      <div
        style="display:flex;gap:24px;flex-wrap:wrap;margin-top:16px;align-items:flex-start"
      >
        <nav aria-label="Workspace" style="max-width:100%">
          <NavSection label="Workspace" />
          {#each ['Home', 'Projects'] as label}
            <NavItem
              {label}
              count={label === 'Projects' ? 3 : undefined}
              selected={destination === label}
              onclick={() => (destination = label)}
            />
          {/each}
          <NavItem label="Unavailable" href="#unavailable" disabled count={0} />
        </nav>
        <nav aria-label="Tablet" style="display:flex;gap:4px">
          <NavRailItem
            label="Home"
            selected={destination === 'Home'}
            onclick={() => (destination = 'Home')}
          />
          <NavRailItem
            label="Projects"
            selected={destination === 'Projects'}
            onclick={() => (destination = 'Projects')}
          />
          <NavRailItem label="Locked" disabled />
        </nav>
      </div>
      <p id="navigation-current" role="status">Destination: {destination}</p>
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
  .display-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-top: 24px;
  }
  .attachment-stack {
    display: grid;
    gap: 12px;
    margin-block: 12px;
  }
  .wash-demo {
    position: relative;
    isolation: isolate;
    max-width: 390px;
    min-height: 400px;
    padding: 24px;
    background: var(--mg-v2-color-bg-base);
  }
  .wash-demo h3 {
    margin: 0;
    font-weight: 500;
  }
  .wash-demo p {
    color: var(--mg-v2-color-fg-secondary);
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

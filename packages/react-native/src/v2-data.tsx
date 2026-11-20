import React, { useState, useRef, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import {
  paginationRange,
  paginationPages,
} from '@highlanderrobotics/magnolia-tokens/v2';
import { Text, Glyph, IconButton, Button, Select, useMagnolia } from './v2.js';

export function PaginationPages({
  page = 1,
  totalPages,
  onPageChange,
  disabled = false,
  label = 'Pagination',
}: {
  page?: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  label?: string;
}) {
  const t = useMagnolia(),
    r = paginationRange(page, totalPages, 1),
    pages = paginationPages(r.current, r.totalPages);
  return (
    <View
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <IconButton
        label="Previous page"
        variant="tertiary"
        disabled={disabled || r.current === 1}
        onPress={() => onPageChange(r.current - 1)}
        icon={<Glyph name="page-prev" />}
      />
      {pages.map((n, i) => (
        <React.Fragment key={n}>
          {i > 0 && n - pages[i - 1] > 1 && (
            <Text
              style={{
                width: 36,
                textAlign: 'center',
                color: t.colors['color/fg/secondary'],
              }}
            >
              …
            </Text>
          )}
          <PageButton
            page={n}
            current={n === r.current}
            disabled={disabled}
            onPress={() => onPageChange(n)}
          />
        </React.Fragment>
      ))}
      <IconButton
        label="Next page"
        variant="tertiary"
        disabled={disabled || r.current === r.totalPages}
        onPress={() => onPageChange(r.current + 1)}
        icon={<Glyph name="page-next" />}
      />
    </View>
  );
}
function PageButton({
  page,
  current,
  disabled,
  onPress,
}: {
  page: number;
  current: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const t = useMagnolia();
  const [focus, setFocus] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Page ${page}`}
      accessibilityState={{ selected: current, disabled }}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={({ pressed }) => ({
        minWidth: 44,
        minHeight: 44,
        padding: 4,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
        backgroundColor:
          t.colors[
            current
              ? 'color/bg/selected'
              : pressed
                ? 'color/bg/ghost-pressed'
                : 'color/bg/base'
          ],
        outlineWidth: focus ? 2 : 0,
        outlineOffset: -2,
        outlineColor: t.colors['color/border/focus'],
      })}
    >
      <Text
        style={{
          fontSize: t.sizes['type/body/sm/size'],
          lineHeight:
            t.sizes[current ? 'type/label/sm/line' : 'type/body/sm/line'],
          fontWeight: current ? '500' : '400',
          color: t.colors[current ? 'color/fg/primary' : 'color/fg/secondary'],
        }}
      >
        {page}
      </Text>
    </Pressable>
  );
}
export function Pagination({
  page = 1,
  total,
  pageSize = 25,
  pageSizes = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  disabled = false,
  label = 'Table pagination',
}: {
  page?: number;
  total: number;
  pageSize?: number;
  pageSizes?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  disabled?: boolean;
  label?: string;
}) {
  const t = useMagnolia(),
    r = paginationRange(page, total, pageSize),
    sizes = [...new Set([...pageSizes, r.pageSize])]
      .filter((n) => Number.isInteger(n) && n > 0)
      .sort((a, b) => a - b);
  return (
    <View
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
      }}
    >
      <Text
        accessibilityLiveRegion="polite"
        style={{
          flexGrow: 1,
          fontSize: t.sizes['type/body/sm/size'],
          lineHeight: t.sizes['type/body/sm/line'],
          color: t.colors['color/fg/secondary'],
        }}
      >
        {r.start}–{r.end} of {r.total}
      </Text>
      <Select
        label="Rows per page"
        items={sizes.map((size) => ({
          value: String(size),
          label: String(size),
        }))}
        value={String(r.pageSize)}
        disabled={disabled}
        onValueChange={(value) => {
          if (value) {
            onPageSizeChange(Number(value));
            onPageChange(1);
          }
        }}
      />
      <IconButton
        label="Previous page"
        variant="tertiary"
        disabled={disabled || r.current === 1}
        onPress={() => onPageChange(r.current - 1)}
        icon={
          <Glyph
            name={r.current === 1 ? 'page-prev-disabled' : 'page-prev'}
            color={
              t.colors[
                r.current === 1 ? 'color/fg/disabled' : 'color/fg/primary'
              ]
            }
          />
        }
      />
      <IconButton
        label="Next page"
        variant="tertiary"
        disabled={disabled || r.current === r.totalPages}
        onPress={() => onPageChange(r.current + 1)}
        icon={<Glyph name="page-next" />}
      />
    </View>
  );
}
export function TableHeaderCell({
  label,
  sort,
  onSort,
  align = 'start',
  style,
}: {
  label: string;
  sort?: 'ascending' | 'descending';
  onSort?: () => void;
  align?: 'start' | 'end';
  style?: StyleProp<ViewStyle>;
}) {
  const t = useMagnolia(),
    [focus, setFocus] = useState(false),
    [hover, setHover] = useState(false);
  const layout: ViewStyle = {
    minWidth: 140,
    minHeight: onSort
      ? Math.max(44, t.sizes['size/row-table'])
      : t.sizes['size/row-table'],
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: align === 'end' ? 'flex-start' : 'flex-start',
    flexDirection: align === 'end' ? 'row-reverse' : 'row',
    gap: 4,
    borderBottomWidth: 1,
    borderColor: t.colors['color/border/subtle'],
    backgroundColor: hover ? t.colors['color/bg/ghost-hover'] : 'transparent',
    outlineWidth: focus ? 2 : 0,
    outlineOffset: -2,
    outlineColor: t.colors['color/border/focus'],
  };
  const content = (
    <>
      <Text
        style={{
          fontSize: t.sizes['type/label/sm/size'],
          lineHeight: t.sizes['type/label/sm/line'],
          fontWeight: '500',
          color:
            t.colors[
              sort || hover || focus ? 'color/fg/primary' : 'color/fg/secondary'
            ],
        }}
      >
        {label}
      </Text>
      {onSort && (
        <View style={{ opacity: sort || focus || hover ? 1 : 0 }}>
          <Glyph name={sort ? `table-${sort}` : 'table-sort'} />
        </View>
      )}
    </>
  );
  return onSort ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${sort ? `sorted ${sort}` : 'not sorted'}`}
      accessibilityHint="Activate to sort"
      onPress={onSort}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={[layout, style]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={[layout, style]}>{content}</View>
  );
}
const SelectedRow = createContext(false);
export function TableCell({
  value = '',
  variant = 'text',
  children,
  editable = false,
  label = 'Edit cell',
  onCommit,
  style,
}: {
  value?: string;
  variant?: 'text' | 'secondary' | 'numeric';
  children?: ReactNode;
  editable?: boolean;
  label?: string;
  onCommit?: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useMagnolia(),
    [editing, setEditing] = useState(false),
    [draft, setDraft] = useState(value),
    [focus, setFocus] = useState(false);
  const selected = useContext(SelectedRow);
  const textStyle = {
    fontSize: t.sizes['type/body/sm/size'],
    lineHeight: t.sizes['type/body/sm/line'],
    color:
      t.colors[
        variant === 'secondary' && !selected
          ? 'color/fg/secondary'
          : 'color/fg/primary'
      ],
    textAlign: variant === 'numeric' ? ('right' as const) : ('left' as const),
    fontVariant: variant === 'numeric' ? ['tabular-nums' as const] : undefined,
  };
  const activeEdit = useRef(false);
  const commit = () => {
    if (!activeEdit.current) return;
    activeEdit.current = false;
    setEditing(false);
    if (draft !== value) onCommit?.(draft);
  };
  return (
    <View
      style={[
        {
          minWidth: 140,
          minHeight: editable
            ? Math.max(44, t.sizes['size/row-table'])
            : t.sizes['size/row-table'],
          paddingHorizontal: 12,
          justifyContent: 'center',
          borderBottomWidth: 1,
          borderColor: t.colors['color/border/row'],
          backgroundColor: editing ? t.colors['color/bg/field'] : 'transparent',
          outlineWidth: focus ? 2 : 0,
          outlineOffset: -2,
          outlineColor: t.colors['color/border/focus'],
          borderRadius: focus || editing ? 4 : 0,
        },
        style,
      ]}
    >
      {editing ? (
        <TextInput
          accessibilityLabel={label}
          autoFocus
          selectTextOnFocus
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={commit}
          onBlur={commit}
          onKeyPress={(e) => {
            if (e.nativeEvent.key === 'Escape') {
              activeEdit.current = false;
              setEditing(false);
              setDraft(value);
            }
          }}
          style={[
            textStyle,
            { fontFamily: t.fontFamily, padding: 0, minHeight: 44 },
          ]}
        />
      ) : editable ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value}`}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onPress={() => {
            setDraft(value);
            activeEdit.current = true;
            setEditing(true);
          }}
          style={{ minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={textStyle}>{value}</Text>
        </Pressable>
      ) : (
        (children ?? <Text style={textStyle}>{value}</Text>)
      )}
    </View>
  );
}
export function TableRow({
  selected = false,
  style,
  children,
  ...rest
}: ViewProps & { selected?: boolean }) {
  const t = useMagnolia();
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: 'row',
          backgroundColor: selected
            ? t.colors['color/bg/selected']
            : 'transparent',
        },
        style,
      ]}
    >
      <SelectedRow.Provider value={selected}>{children}</SelectedRow.Provider>
    </View>
  );
}
type Row = Record<string, string | number | null>;
type Column = {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'start' | 'end';
  secondary?: boolean;
};
export function Table({
  caption,
  columns,
  rows,
  sortBy,
  sortDirection = 'ascending',
  onSortChange,
  cell,
  rowContent,
  rowKey = (row, index) => row.id ?? index,
}: {
  caption: string;
  columns: Column[];
  rows: Row[];
  sortBy?: string | null;
  sortDirection?: 'ascending' | 'descending';
  onSortChange?: (key: string, direction: 'ascending' | 'descending') => void;
  cell?: (row: Row, key: string) => ReactNode;
  rowContent?: (row: Row) => ReactNode;
  rowKey?: (row: Row, index: number) => string | number;
}) {
  const t = useMagnolia(),
    collator = new Intl.Collator(undefined, { numeric: true }),
    sorted =
      sortBy && columns.some((c) => c.key === sortBy && c.sortable)
        ? [...rows].sort(
            (a, b) =>
              collator.compare(
                String(a[sortBy] ?? ''),
                String(b[sortBy] ?? ''),
              ) * (sortDirection === 'ascending' ? 1 : -1),
          )
        : rows;
  return (
    <View>
      <Text
        accessibilityRole="header"
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          color: t.colors['color/fg/secondary'],
        }}
      >
        {caption}
      </Text>
      <ScrollView horizontal accessibilityLabel={caption}>
        <View>
          <View style={{ flexDirection: 'row' }}>
            {columns.map((column) => (
              <TableHeaderCell
                key={column.key}
                label={column.label}
                align={column.align}
                sort={sortBy === column.key ? sortDirection : undefined}
                onSort={
                  column.sortable && onSortChange
                    ? () =>
                        onSortChange(
                          column.key,
                          sortBy === column.key && sortDirection === 'ascending'
                            ? 'descending'
                            : 'ascending',
                        )
                    : undefined
                }
              />
            ))}
          </View>
          {sorted.length ? (
            sorted.map((row, i) => (
              <React.Fragment key={rowKey(row, i)}>
                {rowContent ? (
                  rowContent(row)
                ) : (
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        label={`${column.label}: ${row[column.key] ?? ''}`}
                        variant={
                          column.align === 'end'
                            ? 'numeric'
                            : column.secondary
                              ? 'secondary'
                              : 'text'
                        }
                      >
                        {cell ? (
                          cell(row, column.key)
                        ) : (
                          <Text
                            accessibilityLabel={`${column.label}: ${row[column.key] ?? ''}`}
                            style={{
                              fontSize: t.sizes['type/body/sm/size'],
                              lineHeight: t.sizes['type/body/sm/line'],
                              color:
                                t.colors[
                                  column.secondary
                                    ? 'color/fg/secondary'
                                    : 'color/fg/primary'
                                ],
                            }}
                          >
                            {row[column.key] ?? ''}
                          </Text>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )}
              </React.Fragment>
            ))
          ) : (
            <Text style={{ padding: 12 }}>No results</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
export function BulkActionBar({
  count,
  onClear,
  onAssign,
  onExport,
  onDelete,
  children,
  style,
}: {
  count: number;
  onClear: () => void;
  onAssign?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useMagnolia();
  if (!(count > 0)) return null;
  return (
    <View
      accessibilityLabel="Selection actions"
      onAccessibilityEscape={onClear}
      accessibilityActions={[{ name: 'escape', label: 'Clear selection' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'escape') onClear();
      }}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: t.colors['color/border/default'],
          backgroundColor: t.colors['color/bg/overlay'],
          boxShadow: '0 1px 2px #0003, 0 8px 20px #0000004d',
        },
        style,
      ]}
    >
      <Text
        accessibilityLiveRegion="polite"
        style={{
          paddingHorizontal: 8,
          fontSize: t.sizes['type/label/size'],
          lineHeight: t.sizes['type/label/line'],
          fontWeight: '500',
        }}
      >
        {Math.floor(count)} selected
      </Text>
      <View
        style={{
          width: 1,
          height: 20,
          backgroundColor: t.colors['color/border/subtle'],
        }}
      />
      {children ?? (
        <>
          {onAssign && (
            <Button
              variant="tertiary"
              icon={<Glyph name="bulk-assign" />}
              onPress={onAssign}
            >
              Assign
            </Button>
          )}
          {onExport && (
            <Button
              variant="tertiary"
              icon={<Glyph name="bulk-export" />}
              onPress={onExport}
            >
              Export
            </Button>
          )}
          {onDelete && (
            <Button
              variant="tertiary"
              icon={<Glyph name="bulk-delete" />}
              onPress={onDelete}
            >
              Delete
            </Button>
          )}
        </>
      )}
      <IconButton
        label="Clear selection"
        variant="tertiary"
        icon={<Glyph name="bulk-clear" />}
        onPress={onClear}
      />
    </View>
  );
}

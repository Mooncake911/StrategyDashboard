import { colors, borderRadius, typography, shadows } from '../theme'

function Table({ columns, children, style, ...props }) {
  if (columns && !children) {
    return <TableWithColumns columns={columns} style={style} {...props} />
  }
  return (
    <div style={{ padding: '14px 20px', ...style }} {...props}>
      <table style={{
        width: '100%', borderCollapse: 'collapse', fontSize: typography.sizes.sm,
        background: colors.white, borderRadius: borderRadius.md, overflow: 'hidden',
        boxShadow: shadows.card,
      }}>
        {children}
      </table>
    </div>
  )
}

function TableWithColumns({ columns, children, rows, renderRow, style, ...props }) {
  return (
    <Table style={style} {...props}>
      <Table.Head>
        {columns.map((col) => (
          <Table.Cell key={col.key} as="th" style={col.headStyle}>
            {col.label}
          </Table.Cell>
        ))}
      </Table.Head>
      <Table.Body>
        {renderRow
          ? rows.map((row, i) => renderRow(row, i))
          : children}
      </Table.Body>
    </Table>
  )
}

Table.Head = function Head({ children, style, ...props }) {
  return (
    <thead {...props}>
      <tr style={{ background: colors.navy, ...style }}>
        {children}
      </tr>
    </thead>
  )
}

Table.Body = function Body({ children, style, ...props }) {
  return <tbody style={style} {...props}>{children}</tbody>
}

Table.Row = function Row({ children, index, style, ...props }) {
  return (
    <tr
      style={{
        background: index != null && index % 2 === 0 ? colors.white : '#F8FAFD',
        ...style,
      }}
      {...props}
    >
      {children}
    </tr>
  )
}

Table.Cell = function Cell({ children, as = 'td', style, ...props }) {
  const isTh = as === 'th'
  const base = isTh
    ? {
        padding: '9px 10px', textAlign: 'left', fontSize: typography.sizes.xxs,
        fontWeight: typography.weights.bold, color: colors.blueLight,
        textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap',
      }
    : {
        padding: '8px 10px', borderBottom: `1px solid ${colors.border}`,
        verticalAlign: 'top', fontSize: typography.sizes.sm,
      }
  const Tag = isTh ? 'th' : 'td'
  return <Tag style={{ ...base, ...style }} {...props}>{children}</Tag>
}

export default Table

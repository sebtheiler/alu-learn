import TeX from '@components/TeX';

const Leaf = ({ attributes, children, leaf, readOnly }) => {
  if (leaf.bold)
    children = <strong>{children}</strong>

  if (leaf.code)
    children = <code>{children}</code>

  if (leaf.italic)
    children = <em>{children}</em>

  if (leaf.underline)
    children = <u>{children}</u>

  if (leaf.math_inline) {
    if (readOnly) {
      children = <TeX math={children.props.text.text} />
    } else {
      children = <span className='math-inline'>{children}</span>
    }
  }

  return <span {...attributes}>{children}</span>
}

export default Leaf;
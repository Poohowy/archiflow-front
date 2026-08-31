function ArchiFlowLogo({ size = 96, className = '', title = 'ArchiFlow' }) {
  const computedClassName = className ? `archiflow-logo ${className}` : 'archiflow-logo'
  const decorative = !title
  const resolvedSize = typeof size === 'number' ? `${size}px` : size
  const logoPath = '/archiflow-logo.svg'

  return (
    <img
      src={logoPath}
      className={computedClassName}
      alt={decorative ? '' : title}
      aria-hidden={decorative}
      style={{ height: resolvedSize, width: 'auto' }}
      loading="eager"
      decoding="async"
    />
  )
}

export default ArchiFlowLogo

import { Link } from 'react-router-dom';

const VARIANTS = {
  primary: 'btn-primary',
  accent: 'btn-accent',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const SIZES = { sm: 'btn-sm', md: '', lg: 'btn-lg' };

// Botón unificado. Renderiza <Link>, <a> o <button> según las props.
export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  children,
  ...props
}) {
  const classes = `btn ${VARIANTS[variant] || ''} ${SIZES[size] || ''} ${className}`.trim();

  if (to) return <Link to={to} className={classes} {...props}>{children}</Link>;
  if (href) return <a href={href} className={classes} {...props}>{children}</a>;
  return <button className={classes} {...props}>{children}</button>;
}

import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const base = (props: IconProps) => ({
  width: props.size ?? 20,
  height: props.size ?? 20,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
})

export const CalendarIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(props)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </svg>
)

export const PlusIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const TrashIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(props)}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
)

export const CloseIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(props)}>
    <path d="M6 6l12 12M6 18L18 6" />
  </svg>
)

export const ChevronLeftIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(props)}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
)

export const ChevronRightIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(props)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
)

export const HomeIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(props)}>
    <path d="M3 11l9-8 9 8M5 10v10h14V10" />
  </svg>
)

export const ChartIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(props)}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)

export const SettingsIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(props)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

export const CopyIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(props)}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

export const CheckIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(props)}>
    <path d="M5 13l4 4L19 7" />
  </svg>
)

export const EditIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(props)}>
    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
)

export const WhatsappIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(props)} fill="currentColor" stroke="none">
    <path d="M20.52 3.48A11.85 11.85 0 0 0 12.06 0C5.5 0 .12 5.37.12 11.94c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.93 11.93 0 0 0 5.79 1.48h.01c6.56 0 11.94-5.38 11.94-11.94 0-3.19-1.24-6.19-3.49-8.42zM12.06 21.8h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.72.97 1-3.63-.24-.37a9.85 9.85 0 0 1-1.51-5.24c0-5.45 4.43-9.88 9.88-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.9 6.99c0 5.45-4.43 9.85-9.9 9.85zm5.42-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48a9.04 9.04 0 0 1-1.66-2.07c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
  </svg>
)
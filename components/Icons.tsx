import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

/** Вифлеемская звезда — символ айдентики мероприятия. */
export const StarIcon = ({ className, ...rest }: IconProps) => (
  <svg viewBox="-50 -50 100 115" fill="currentColor" className={className} aria-hidden="true" {...rest}>
    <path d="M0,-42 Q1.65,-7.95 11,-11 Q6.75,-1.65 34,0 Q6.75,1.65 11,11 Q1.65,10.35 0,58 Q-1.65,10.35 -11,11 Q-6.75,1.65 -34,0 Q-6.75,-1.65 -11,-11 Q-1.65,-7.95 0,-42 Z" />
  </svg>
);

const base = (props: IconProps) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
});

export const PlayIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none" /></svg>
);
export const PauseIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" /></svg>
);
export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M15 6l-6 6 6 6" /></svg>
);
export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M9 6l6 6-6 6" /></svg>
);
export const MusicIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
);
export const MusicOffIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /><path d="M3 3l18 18" /></svg>
);
export const VolumeIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M11 5L6 9H2v6h4l5 4z" fill="currentColor" stroke="none" /><path d="M15.5 8.5a5 5 0 010 7" /><path d="M18.5 5.5a9 9 0 010 13" /></svg>
);
export const VolumeOffIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M11 5L6 9H2v6h4l5 4z" fill="currentColor" stroke="none" /><path d="M22 9l-6 6" /><path d="M16 9l6 6" /></svg>
);
export const SettingsIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></svg>
);
export const FullscreenIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M8 3H3v5" /><path d="M16 3h5v5" /><path d="M8 21H3v-5" /><path d="M16 21h5v-5" /></svg>
);
export const ExitFullscreenIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 8h5V3" /><path d="M21 8h-5V3" /><path d="M3 16h5v5" /><path d="M21 16h-5v5" /></svg>
);
export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 12l5 5L20 7" /></svg>
);
export const TrashIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
);
export const PlusIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 5v14" /><path d="M5 12h14" /></svg>
);
export const MinusIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 12h14" /></svg>
);
export const PrintIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 9V3h12v6" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><path d="M6 14h12v7H6z" /></svg>
);
export const ResetIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 12a9 9 0 109-9" /><path d="M3 4v5h5" /></svg>
);
export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const TrophyIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v5a5 5 0 01-10 0z" /><path d="M7 6H4v2a3 3 0 003 3" /><path d="M17 6h3v2a3 3 0 01-3 3" /></svg>
);
export const KeyboardIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" /></svg>
);
export const PlusTimeIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="13" r="8" /><path d="M12 10v6" /><path d="M9 13h6" /><path d="M9 2h6" /></svg>
);
export const HomeIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></svg>
);
export const UploadIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M4 20h16" /></svg>
);
export const DownloadIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 4v12" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></svg>
);
export const EditIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 20h4l10-10-4-4L4 16z" /><path d="M13 7l4 4" /></svg>
);

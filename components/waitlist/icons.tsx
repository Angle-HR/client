// Inline icons for the waitlist. Sized to fill their host wrapper (our UI
// components place icons in fixed boxes); coloured via currentColor so the
// design-system token on the parent drives the colour.
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function XIcon(props: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7.60498 5.93872L13.7097 14.01H12.4805L12.4426 13.9612L6.30615 5.93872H7.60498Z"
        fill="#666666"
        style={{
          fill: 'color(display-p3 0.4000 0.4000 0.4000)',
          fillOpacity: '1',
        }}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.5005 1.99951C16.881 1.99971 18.0005 3.12014 18.0005 4.50073V15.5005C18.0003 16.8809 16.8809 18.0003 15.5005 18.0005H4.50073C3.12014 18.0005 1.99971 16.881 1.99951 15.5005V4.50073C1.99951 3.12002 3.12002 1.99951 4.50073 1.99951H15.5005ZM4.52881 5.20142L8.5437 10.4529L4.56543 15H6.55273L6.58936 14.9573L9.47144 11.6638L11.9861 14.9512L12.0239 15H15.6653L11.3232 9.26147L15.0513 5.00122H13.0652L13.0286 5.04395L10.4041 8.04199L8.13965 5.05005L8.10303 5.00122H4.375L4.52881 5.20142Z"
        fill="#666666"
        style={{
          fill: 'color(display-p3 0.4000 0.4000 0.4000)',
          fillOpacity: '1',
        }}
      />
    </svg>
  )
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.5005 1.99951C16.881 1.99971 18.0005 3.12014 18.0005 4.50073V15.5005C18.0003 16.8809 16.8809 18.0003 15.5005 18.0005H4.50073C3.12014 18.0005 1.99971 16.881 1.99951 15.5005V4.50073C1.99951 3.12002 3.12002 1.99951 4.50073 1.99951H15.5005ZM4.43848 8.19214V15.3918H6.85303V8.19214H4.43848ZM12.7844 8.00049C12.3455 7.98441 11.9102 8.08692 11.5259 8.29834C11.1416 8.50979 10.8223 8.82217 10.603 9.20044V8.18359H8.18848V15.3845H10.603V11.2354C10.6096 11.0875 10.6364 10.9405 10.6836 10.7996C10.7757 10.5459 10.9444 10.3267 11.1658 10.1709C11.3874 10.015 11.6523 9.92995 11.9238 9.92798C12.8008 9.92816 13.147 10.5605 13.147 11.5283V15.3918H15.5615V11.2476C15.5613 9.03195 14.394 8.00049 12.7844 8.00049ZM5.64575 4.68872C5.31285 4.68873 4.99374 4.81977 4.7583 5.05371C4.52284 5.28775 4.39087 5.60529 4.39087 5.93628C4.3909 6.26722 4.52287 6.58483 4.7583 6.81885C4.99372 7.05271 5.31291 7.18383 5.64575 7.18384C5.82243 7.20375 6.0012 7.18609 6.17065 7.13257C6.34023 7.07895 6.49691 6.99037 6.62964 6.87256C6.76232 6.75476 6.86822 6.61037 6.94092 6.44897C7.01358 6.2876 7.05198 6.11307 7.052 5.93628C7.052 5.7594 7.01363 5.5838 6.94092 5.42236C6.86821 5.2612 6.76218 5.11643 6.62964 4.99878C6.49699 4.88113 6.34007 4.79234 6.17065 4.73877C6.00128 4.68532 5.82233 4.66882 5.64575 4.68872Z"
        fill="#666666"
        style={{
          fill: 'color(display-p3 0.4000 0.4000 0.4000)',
          fillOpacity: '1',
        }}
      />
    </svg>
  )
}

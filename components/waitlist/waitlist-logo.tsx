// OPEN HR wordmark. Figma `logo`: the mark (#333333 → text-primary) next to a
// pill (radius sm-6, 0.5px border) holding "OPEN HR" at body-s / weight 600,
// tightly tracked.
function WaitlistLogo() {
  return (
    <div className="inline-flex items-center gap-[4px] text-text-primary" aria-label="Open HR">
      <svg
        className="h-[24px] w-[24px]"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.392 17.8314L11.4651 17.8293C15.0012 18.0765 18.2291 17.0485 19.821 15.2907C20.5661 14.4679 20.4173 13.2571 19.9168 12.2663L17.7516 7.97948L17.6611 7.80022C16.7506 6.1601 13.8972 5.16693 10.6515 5.50176C7.2662 5.85099 4.59366 7.52733 4.19835 9.41515L2.99125 13.2508C2.78323 13.9118 2.85807 14.6497 3.3409 15.1468C4.97841 16.8326 7.98387 17.9182 11.392 17.8314ZM10.727 6.23386C13.8237 5.9144 16.4812 7.08163 16.6627 8.84096C16.8442 10.6003 14.481 12.2855 11.3842 12.6049C8.28753 12.9244 5.63002 11.7572 5.44852 9.99784C5.26703 8.23851 7.63028 6.55332 10.727 6.23386Z"
          fill="currentColor"
        />
        <path
          d="M10.4144 9.7834C12.4834 9.24691 14.4443 9.4987 15.4749 10.3156C14.6244 11.1784 13.1207 11.8427 11.3577 12.0246C9.75562 12.1899 8.28168 11.9211 7.26887 11.3674C8.03891 10.69 9.13544 10.115 10.4144 9.7834Z"
          fill="currentColor"
        />
      </svg>
      <span className="inline-flex items-center rounded-sm-6 border-[0.5px] border-[#000000] px-[4px] py-[4px]">
        <span className="text-body-s font-semibold leading-none tracking-tight">OPEN&nbsp;HR</span>
      </span>
    </div>
  )
}

export { WaitlistLogo }

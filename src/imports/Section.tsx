function Remove() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="remove">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <mask height="24" id="mask0_35_391" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_35_391)">
            <path d="M5 13V11H19V13H5Z" fill="url(#paint0_linear_35_391)" id="remove_2" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_35_391" x1="5" x2="19" y1="12" y2="12">
            <stop offset="0.26" stopColor="#5236AB" />
            <stop offset="0.66" stopColor="#E121B4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Header">
      <p className="flex-[1_0_0] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#200a58] text-[18px] whitespace-pre-wrap">Section header 1</p>
      <Remove />
    </div>
  );
}

function AccordionElementsContent() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name=".Accordion/Elements/Content">
      <div className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[0] not-italic relative shrink-0 text-[#333] text-[16px] w-full whitespace-pre-wrap">
        <p className="leading-[20px] mb-[16px]">{`This is content for your accordion. Add interesting things in the space to help users. You can even make a bullet list if you want. `}</p>
        <ul className="list-disc">
          <li className="mb-[16px] ms-[24px]">
            <span className="leading-[20px]">{`List item 1 `}</span>
          </li>
          <li className="mb-[16px] ms-[24px]">
            <span className="leading-[20px]">List item 2</span>
          </li>
          <li className="ms-[24px]">
            <span className="leading-[20px]">{`List item 3 `}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function Section() {
  return (
    <div className="bg-white relative rounded-[4px] size-full" data-name="Section">
      <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[16px] relative rounded-[inherit] size-full">
        <Header />
        <AccordionElementsContent />
      </div>
      <div aria-hidden="true" className="absolute border border-[#cbc3e6] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}
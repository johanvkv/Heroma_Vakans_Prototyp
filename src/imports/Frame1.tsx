import svgPaths from "./svg-7j8bz0x4es";

function Remove() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="remove">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <mask height="24" id="mask0_15_268" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_15_268)">
            <path d="M5 13V11H19V13H5Z" fill="url(#paint0_linear_15_268)" id="remove_2" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_15_268" x1="5" x2="19" y1="12" y2="12">
            <stop stopColor="#5236AB" />
            <stop offset="1" stopColor="#200A58" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Header">
      <p className="flex-[1_0_0] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#200a58] text-[18px]">Section header 1</p>
      <Remove />
    </div>
  );
}

function Section() {
  return (
    <div className="bg-white relative rounded-[4px] shrink-0 w-full" data-name="Section">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start p-[16px] relative w-full">
          <Header />
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name=".Accordion/Elements/Content">
            <div className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[0] not-italic relative shrink-0 text-[#333] text-[16px] w-full whitespace-pre-wrap">
              <p className="leading-[20px] mb-[16px]">This is content for your accordion. Add interesting things in the space to help users. You can even make a bullet list if you want. jkdlclks</p>
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
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#cbc3e6] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Add() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="add">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="add">
          <mask height="24" id="mask0_15_366" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_15_366)">
            <path d={svgPaths.p2a6e0600} fill="url(#paint0_linear_15_366)" id="add_2" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_15_366" x1="5" x2="19" y1="12" y2="12">
            <stop stopColor="#5236AB" />
            <stop offset="1" stopColor="#200A58" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Header1() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Header">
      <p className="flex-[1_0_0] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#200a58] text-[18px]">Section header 2</p>
      <Add />
    </div>
  );
}

function Section1() {
  return (
    <div className="bg-white relative rounded-[4px] shrink-0 w-full" data-name="Section">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[16px] relative w-full">
          <Header1 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#efefef] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Add1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="add">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="add">
          <mask height="24" id="mask0_15_366" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_15_366)">
            <path d={svgPaths.p2a6e0600} fill="url(#paint0_linear_15_366)" id="add_2" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_15_366" x1="5" x2="19" y1="12" y2="12">
            <stop stopColor="#5236AB" />
            <stop offset="1" stopColor="#200A58" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Header2() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Header">
      <p className="flex-[1_0_0] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#200a58] text-[18px]">Section header 3</p>
      <Add1 />
    </div>
  );
}

function Section2() {
  return (
    <div className="bg-white relative rounded-[4px] shrink-0 w-full" data-name="Section">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[16px] relative w-full">
          <Header2 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#efefef] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Add2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="add">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="add">
          <mask height="24" id="mask0_15_366" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_15_366)">
            <path d={svgPaths.p2a6e0600} fill="url(#paint0_linear_15_366)" id="add_2" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_15_366" x1="5" x2="19" y1="12" y2="12">
            <stop stopColor="#5236AB" />
            <stop offset="1" stopColor="#200A58" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Header3() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Header">
      <p className="flex-[1_0_0] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#200a58] text-[18px]">Section header 4</p>
      <Add2 />
    </div>
  );
}

function Section3() {
  return (
    <div className="bg-white relative rounded-[4px] shrink-0 w-full" data-name="Section">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[16px] relative w-full">
          <Header3 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#efefef] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Add3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="add">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="add">
          <mask height="24" id="mask0_15_366" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_15_366)">
            <path d={svgPaths.p2a6e0600} fill="url(#paint0_linear_15_366)" id="add_2" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_15_366" x1="5" x2="19" y1="12" y2="12">
            <stop stopColor="#5236AB" />
            <stop offset="1" stopColor="#200A58" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Header4() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Header">
      <p className="flex-[1_0_0] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#200a58] text-[18px]">Section header 5</p>
      <Add3 />
    </div>
  );
}

function Section4() {
  return (
    <div className="bg-white relative rounded-[4px] shrink-0 w-full" data-name="Section">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[16px] relative w-full">
          <Header4 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#efefef] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Sections() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Sections">
      <div className="content-stretch flex flex-col items-start pb-[8px] relative shrink-0 w-full" data-name=".Accordion/Elements/Section">
        <Section />
      </div>
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name=".Accordion/Elements/Section">
        <Section1 />
      </div>
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name=".Accordion/Elements/Section">
        <Section2 />
      </div>
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name=".Accordion/Elements/Section">
        <Section3 />
      </div>
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name=".Accordion/Elements/Section">
        <Section4 />
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute content-stretch flex gap-[48px] items-start left-0 top-0 w-[1094px]" data-name="Accordion">
        <Sections />
      </div>
    </div>
  );
}
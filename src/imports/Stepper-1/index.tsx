import svgPaths from "./svg-apnyr6a3g1";

function Check() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Check">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_439_1026)" id="Check">
          <g id="Vector" />
          <path d={svgPaths.pcbbaa00} fill="var(--fill-0, white)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_439_1026">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IndicatorLine() {
  return <div className="bg-[#5236ab] flex-[1_0_0] min-h-px relative w-px" data-name="Indicator line" />;
}

function Indicator() {
  return (
    <div className="content-stretch flex flex-col h-full items-center relative shrink-0" data-name="Indicator">
      <div className="bg-[#5236ab] content-stretch flex items-center justify-center p-[4px] relative rounded-[100px] shrink-0" data-name=".Stepper/Icon">
        <Check />
      </div>
      <IndicatorLine />
    </div>
  );
}

function StepTitle() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start min-w-px pt-px relative" data-name="Step title">
      <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-end leading-[0] not-italic relative shrink-0 text-[#5236ab] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">Step title</p>
      </div>
    </div>
  );
}

function Edit() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Edit">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_439_1034)" id="Edit">
          <g id="Vector" />
          <path d={svgPaths.p2c1a3200} fill="var(--fill-0, #5236AB)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_439_1034">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IndicatorLine1() {
  return <div className="bg-[#a8a8a8] flex-[1_0_0] min-h-px relative w-px" data-name="Indicator line" />;
}

function Indicator1() {
  return (
    <div className="content-stretch flex flex-col items-center relative self-stretch shrink-0" data-name="Indicator">
      <div className="bg-white content-stretch flex items-center justify-center p-[4px] relative rounded-[100px] shrink-0" data-name=".Stepper/Icon">
        <div aria-hidden className="absolute border border-[#5236ab] border-solid inset-0 pointer-events-none rounded-[100px]" />
        <Edit />
      </div>
      <IndicatorLine1 />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[16px] w-full">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque tellus leo, iaculis id consectetur vel, lacinia sit amet lectus. Vivamus porta turpis ut venenis lobortis. Proin vel mi ac risus ultricies accumsan. Pellentesque habitant morbi tristique senectus et netus et suada fames ac turpis egestas. Nunc eu lorem venenis, vulpute nisl ut, semper magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Back</p>
    </div>
  );
}

function ContentDropdown() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content1 />
    </div>
  );
}

function Content2() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Cancel</p>
    </div>
  );
}

function ContentDropdown1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content2 />
    </div>
  );
}

function Content3() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
        <p className="leading-[24px]">Next</p>
      </div>
    </div>
  );
}

function ContentDropdown2() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content3 />
    </div>
  );
}

function PrimarySecondaryActions() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center justify-end min-w-px relative" data-name="Primary + secondary actions">
      <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown1 />
      </div>
      <div className="bg-[#5236ab] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown2 />
      </div>
    </div>
  );
}

function Actions() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Actions">
      <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown />
      </div>
      <PrimarySecondaryActions />
    </div>
  );
}

function ContentActions() {
  return (
    <div className="flex-[1_0_0] min-w-px relative self-stretch" data-name="Content + actions">
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-[32px] pt-px relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-end leading-[0] not-italic relative shrink-0 text-[#333] text-[16px] w-full">
          <p className="leading-[normal]">Step title</p>
        </div>
        <Content />
        <Actions />
      </div>
    </div>
  );
}

function IndicatorLine2() {
  return <div className="bg-[#a8a8a8] flex-[1_0_0] min-h-px relative w-px" data-name="Indicator line" />;
}

function Indicator2() {
  return (
    <div className="content-stretch flex flex-col h-full items-center relative shrink-0" data-name="Indicator">
      <div className="bg-white relative rounded-[100px] shrink-0 size-[24px]" data-name=".Stepper/Icon">
        <div aria-hidden className="absolute border border-[#a8a8a8] border-solid inset-0 pointer-events-none rounded-[100px]" />
      </div>
      <IndicatorLine2 />
    </div>
  );
}

function StepTitle1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start min-w-px pt-px relative" data-name="Step title">
      <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-end leading-[0] not-italic relative shrink-0 text-[#333] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">Step title</p>
      </div>
    </div>
  );
}

function IndicatorLine3() {
  return <div className="bg-[#a8a8a8] flex-[1_0_0] min-h-px relative w-px" data-name="Indicator line" />;
}

function Indicator3() {
  return (
    <div className="content-stretch flex flex-col h-full items-center relative shrink-0" data-name="Indicator">
      <div className="bg-white relative rounded-[100px] shrink-0 size-[24px]" data-name=".Stepper/Icon">
        <div aria-hidden className="absolute border border-[#a8a8a8] border-solid inset-0 pointer-events-none rounded-[100px]" />
      </div>
      <IndicatorLine3 />
    </div>
  );
}

function StepTitle2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start min-w-px pt-px relative" data-name="Step title">
      <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-end leading-[0] not-italic relative shrink-0 text-[#333] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">Step title</p>
      </div>
    </div>
  );
}

function Indicator4() {
  return (
    <div className="content-stretch flex flex-col items-center relative self-stretch shrink-0" data-name="Indicator">
      <div className="bg-white relative rounded-[100px] shrink-0 size-[24px]" data-name=".Stepper/Icon">
        <div aria-hidden className="absolute border border-[#a8a8a8] border-solid inset-0 pointer-events-none rounded-[100px]" />
      </div>
    </div>
  );
}

function StepTitle3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start min-w-px pt-px relative" data-name="Step title">
      <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-end leading-[0] not-italic relative shrink-0 text-[#333] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">Step title</p>
      </div>
    </div>
  );
}

export default function Stepper() {
  return (
    <div className="content-stretch flex flex-col items-start px-[16px] relative size-full" data-name="Stepper">
      <div className="content-stretch flex gap-[16px] h-[49px] items-start relative shrink-0 w-full" data-name=".Stepper/Indicators/Vertical">
        <Indicator />
        <StepTitle />
      </div>
      <div className="content-stretch flex gap-[16px] h-[49px] items-start relative shrink-0 w-full" data-name=".Stepper/Indicators/Vertical">
        <Indicator1 />
        <ContentActions />
      </div>
      <div className="content-stretch flex gap-[16px] h-[49px] items-start relative shrink-0 w-full" data-name=".Stepper/Indicators/Vertical">
        <Indicator2 />
        <StepTitle1 />
      </div>
      <div className="content-stretch flex gap-[16px] h-[49px] items-start relative shrink-0 w-full" data-name=".Stepper/Indicators/Vertical">
        <Indicator3 />
        <StepTitle2 />
      </div>
      <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name=".Stepper/Indicators/Vertical">
        <Indicator4 />
        <StepTitle3 />
      </div>
    </div>
  );
}
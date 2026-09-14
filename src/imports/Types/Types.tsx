import svgPaths from "./svg-1nt4lzvgh6";

function Content() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start justify-center min-h-px relative w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-w-px not-italic relative text-[#333] text-[16px]">
        <p className="leading-[normal]">Label</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
        <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 5">
            <path d="M5 5L0 0H10L5 5Z" fill="var(--fill-0, #151515)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Default() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[18px] whitespace-nowrap">Default / unfilled</p>
      <div className="bg-white content-stretch flex flex-col h-[48px] items-start justify-center p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border border-[#a8a8a8] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <Content />
      </div>
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start justify-center min-h-px relative w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-w-px not-italic relative text-[#333] text-[16px]">
        <p className="leading-[normal]">Option 1</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
        <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 5">
            <path d="M5 5L0 0H10L5 5Z" fill="var(--fill-0, #151515)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Selected() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Selected">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[18px] whitespace-nowrap">Filled / selected</p>
      <div className="bg-white content-stretch flex flex-col h-[48px] items-start justify-center p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border border-[#a8a8a8] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <Content1 />
        <div className="absolute bg-white content-stretch flex h-[8px] items-end justify-center left-[8px] px-[4px] top-0" data-name=".Forms elements/Label">
          <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[12px] whitespace-nowrap">Label</p>
        </div>
      </div>
    </div>
  );
}

function Content2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start justify-center min-h-px relative w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-w-px not-italic relative text-[#333] text-[16px]">
        <p className="leading-[normal]">Option 1</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
        <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 5">
            <path d="M5 5L0 0H10L5 5Z" fill="var(--fill-0, #151515)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function EmptyText() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[24px] items-center min-w-px relative" data-name="Empty+Text">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[0] min-w-px not-italic relative text-[#5236ab] text-[16px]">
        <p className="leading-[20px]">Option 1</p>
      </div>
    </div>
  );
}

function EmptyText1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[24px] items-center min-w-px relative" data-name="Empty+Text">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[0] min-w-px not-italic relative text-[#333] text-[16px]">
        <p className="leading-[20px]">Option 2</p>
      </div>
    </div>
  );
}

function EmptyText2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[24px] items-center min-w-px relative" data-name="Empty+Text">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[0] min-w-px not-italic relative text-[#333] text-[16px]">
        <p className="leading-[20px]">Option 3</p>
      </div>
    </div>
  );
}

function EmptyText3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[24px] items-center min-w-px relative" data-name="Empty+Text">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[0] min-w-px not-italic relative text-[#333] text-[16px]">
        <p className="leading-[20px]">Option 4</p>
      </div>
    </div>
  );
}

function VerticalScroll() {
  return (
    <div className="absolute bottom-[8px] content-stretch flex items-start right-[8px] top-[8px] w-[5px]" data-name="Vertical scroll">
      <div className="bg-[#c0c0c0] h-[77px] relative rounded-[5px] shrink-0 w-[5px]" data-name="Scroll Bar/Short" />
    </div>
  );
}

function Active() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Active">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[18px] whitespace-nowrap">Active / focus</p>
      <div className="bg-white content-stretch flex flex-col h-[48px] items-start justify-center p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border-2 border-[#5236ab] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <Content2 />
        <p className="[word-break:break-word] absolute bottom-[-4px] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] left-[12px] not-italic right-[12px] text-[#333] text-[12px] translate-y-full">Supporting text</p>
        <div className="absolute bg-white content-stretch flex h-[8px] items-end justify-center left-[8px] px-[4px] top-0" data-name=".Forms elements/Label">
          <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#5236ab] text-[12px] whitespace-nowrap">Label</p>
        </div>
        <div className="absolute bg-[#f2f1f9] content-stretch flex flex-col items-start left-0 overflow-clip right-0 rounded-[4px] shadow-[0px_2px_6px_2px_rgba(0,0,0,0.15),0px_2px_6px_2px_rgba(0,0,0,0.15)] top-[48px]" data-name="Dropdown list">
          <div className="bg-[#e6e3f3] relative shrink-0 w-full" data-name=".Dropdown list/Elements">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex items-center p-[12px] relative size-full">
                <EmptyText />
              </div>
            </div>
          </div>
          <div className="bg-[#f2f1f9] relative shrink-0 w-full" data-name=".Dropdown list/Elements">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex items-center p-[12px] relative size-full">
                <EmptyText1 />
              </div>
            </div>
          </div>
          <div className="bg-[#f2f1f9] relative shrink-0 w-full" data-name=".Dropdown list/Elements">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex items-center p-[12px] relative size-full">
                <EmptyText2 />
              </div>
            </div>
          </div>
          <div className="bg-[#f2f1f9] relative shrink-0 w-full" data-name=".Dropdown list/Elements">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex items-center p-[12px] relative size-full">
                <EmptyText3 />
              </div>
            </div>
          </div>
          <VerticalScroll />
        </div>
      </div>
    </div>
  );
}

function Row() {
  return (
    <div className="content-stretch flex gap-[98px] items-start relative shrink-0 w-full" data-name="Row 1">
      <Default />
      <Selected />
      <Active />
    </div>
  );
}

function Content3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start justify-center min-h-px relative w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-w-px not-italic relative text-[16px] text-[rgba(21,21,21,0.45)]">
        <p className="leading-[normal]">Label</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
        <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 5">
            <path d="M5 5L0 0H10L5 5Z" fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Disabled() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[18px] whitespace-nowrap">Disabled</p>
      <div className="bg-white content-stretch flex flex-col h-[48px] items-start justify-center p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border border-[#a8a8a8] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <Content3 />
      </div>
    </div>
  );
}

function Content4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start justify-center min-h-px relative w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-w-px not-italic relative text-[#333] text-[16px]">
        <p className="leading-[normal]">Option 1</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
        <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 5">
            <path d="M5 5L0 0H10L5 5Z" fill="var(--fill-0, #151515)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function RequiredError() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Required error">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[18px] whitespace-nowrap">Error</p>
      <div className="bg-white content-stretch flex flex-col h-[48px] items-start justify-center p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border border-[#b00020] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <Content4 />
        <p className="[word-break:break-word] absolute bottom-[-4px] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] left-[12px] not-italic right-[12px] text-[#b00020] text-[12px] translate-y-full">Error message</p>
        <div className="absolute bg-white content-stretch flex h-[8px] items-end justify-center left-[8px] px-[4px] top-0" data-name=".Forms elements/Label">
          <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#b00020] text-[12px] whitespace-nowrap">Label</p>
        </div>
      </div>
    </div>
  );
}

function Row1() {
  return (
    <div className="content-stretch flex gap-[98px] items-start relative shrink-0 w-full" data-name="Row 2">
      <Disabled />
      <RequiredError />
    </div>
  );
}

function Content5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start justify-center min-h-px relative w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-w-px not-italic relative text-[16px] text-[rgba(21,21,21,0.45)]">
        <p className="leading-[normal]">Option 1</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
        <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 5">
            <path d="M5 5L0 0H10L5 5Z" fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function DisabledFilled() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Disabled / filled">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[18px] whitespace-nowrap">Disabled / filled</p>
      <div className="bg-white content-stretch flex flex-col h-[48px] items-start justify-center p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border border-[#a8a8a8] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <Content5 />
        <div className="absolute bg-white content-stretch flex h-[8px] items-end justify-center left-[8px] px-[4px] top-0" data-name=".Forms elements/Label">
          <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-[rgba(21,21,21,0.45)] whitespace-nowrap">Label</p>
        </div>
      </div>
    </div>
  );
}

function Content6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start justify-center min-h-px relative w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-w-px not-italic relative text-[#333] text-[16px]">
        <p className="leading-[normal]">Option 1</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
        <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 5">
            <path d="M5 5L0 0H10L5 5Z" fill="var(--fill-0, #151515)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Hover() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[18px] whitespace-nowrap">Hover</p>
      <div className="bg-white content-stretch flex flex-col h-[48px] items-start justify-center p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <Content6 />
        <div className="absolute bg-white content-stretch flex h-[8px] items-end justify-center left-[8px] px-[4px] top-0" data-name=".Forms elements/Label">
          <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[12px] whitespace-nowrap">Label</p>
        </div>
      </div>
    </div>
  );
}

function Row2() {
  return (
    <div className="content-stretch flex gap-[98px] items-start relative shrink-0 w-full" data-name="Row 3">
      <DisabledFilled />
      <Hover />
    </div>
  );
}

function States() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-name="States">
      <Row />
      <Row1 />
      <Row2 />
    </div>
  );
}

function DropdownSingleSelection() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Dropdown Single Selection">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[24px] w-full">Dropdown single selection</p>
      <States />
    </div>
  );
}

function Content7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start justify-center min-h-px relative w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-w-px not-italic relative text-[#333] text-[16px]">
        <p className="leading-[normal]">Label</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
        <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 5">
            <path d="M5 5L0 0H10L5 5Z" fill="var(--fill-0, #151515)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Default1() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[18px] whitespace-nowrap">Default / unfilled</p>
      <div className="bg-white content-stretch flex flex-col h-[48px] items-start justify-center p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border border-[#a8a8a8] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <Content7 />
      </div>
    </div>
  );
}

function Content8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start justify-center min-h-px relative w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-w-px not-italic relative text-[#333] text-[16px]">
        <p className="leading-[normal]">Option 1, Option 2</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
        <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 5">
            <path d="M5 5L0 0H10L5 5Z" fill="var(--fill-0, #151515)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Selected1() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Selected">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[18px] whitespace-nowrap">Filled / selected</p>
      <div className="bg-white content-stretch flex flex-col h-[48px] items-start justify-center p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border border-[#a8a8a8] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <Content8 />
        <div className="absolute bg-white content-stretch flex h-[8px] items-end justify-center left-[8px] px-[4px] top-0" data-name=".Forms elements/Label">
          <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[12px] whitespace-nowrap">Label</p>
        </div>
      </div>
    </div>
  );
}

function Content9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start justify-center min-h-px relative w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-w-px not-italic relative text-[#333] text-[16px]">
        <p className="leading-[normal]">Option 1, Option 2</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
        <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 5">
            <path d="M5 5L0 0H10L5 5Z" fill="var(--fill-0, #151515)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icons() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icons">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_102_3397)" id="Icons">
          <g id="Vector" />
          <path d={svgPaths.p73e7900} fill="var(--fill-0, #5236AB)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_102_3397">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconText() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-w-px relative" data-name="Icon+Text">
      <Icons />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] min-w-px not-italic relative text-[#5236ab] text-[16px]">Option 1</p>
    </div>
  );
}

function Icons1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icons">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_102_3397)" id="Icons">
          <g id="Vector" />
          <path d={svgPaths.p73e7900} fill="var(--fill-0, #5236AB)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_102_3397">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconText1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-w-px relative" data-name="Icon+Text">
      <Icons1 />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] min-w-px not-italic relative text-[#5236ab] text-[16px]">Option 2</p>
    </div>
  );
}

function Icons2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icons">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icons">
          <path d={svgPaths.p3b4f0880} fill="var(--fill-0, #151515)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IconText2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-w-px relative" data-name="Icon+Text">
      <Icons2 />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] min-w-px not-italic relative text-[#333] text-[16px]">Option 3</p>
    </div>
  );
}

function Icons3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icons">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icons">
          <path d={svgPaths.p3b4f0880} fill="var(--fill-0, #151515)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IconText3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-w-px relative" data-name="Icon+Text">
      <Icons3 />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] min-w-px not-italic relative text-[#333] text-[16px]">Option 4</p>
    </div>
  );
}

function VerticalScroll1() {
  return (
    <div className="absolute bottom-[8px] content-stretch flex items-start right-[8px] top-[8px]" data-name="Vertical scroll">
      <div className="bg-[#c0c0c0] h-[77px] relative rounded-[5px] shrink-0 w-[5px]" data-name="Scroll Bar/Short" />
    </div>
  );
}

function Active1() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Active">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[18px] whitespace-nowrap">Active / focus</p>
      <div className="bg-white content-stretch flex flex-col h-[48px] items-start justify-center p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border-2 border-[#5236ab] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <Content9 />
        <p className="[word-break:break-word] absolute bottom-[-4px] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] left-[12px] not-italic right-[12px] text-[#333] text-[12px] translate-y-full">Supporting text</p>
        <div className="absolute bg-white content-stretch flex h-[8px] items-end justify-center left-[8px] px-[4px] top-0" data-name=".Forms elements/Label">
          <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#5236ab] text-[12px] whitespace-nowrap">Label</p>
        </div>
        <div className="absolute bg-[#f2f1f9] content-stretch flex flex-col items-start left-0 overflow-clip right-0 rounded-[4px] shadow-[0px_2px_6px_2px_rgba(0,0,0,0.15),0px_2px_6px_2px_rgba(0,0,0,0.15)] top-[48px]" data-name="Dropdown list">
          <div className="bg-[#e6e3f3] relative shrink-0 w-full" data-name=".Dropdown list/Elements">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex items-center p-[12px] relative size-full">
                <IconText />
              </div>
            </div>
          </div>
          <div className="bg-[#e6e3f3] relative shrink-0 w-full" data-name=".Dropdown list/Elements">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex items-center p-[12px] relative size-full">
                <IconText1 />
              </div>
            </div>
          </div>
          <div className="bg-[#f2f1f9] relative shrink-0 w-full" data-name=".Dropdown list/Elements">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex items-center p-[12px] relative size-full">
                <IconText2 />
              </div>
            </div>
          </div>
          <div className="bg-[#f2f1f9] relative shrink-0 w-full" data-name=".Dropdown list/Elements">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex items-center p-[12px] relative size-full">
                <IconText3 />
              </div>
            </div>
          </div>
          <VerticalScroll1 />
        </div>
      </div>
    </div>
  );
}

function Row3() {
  return (
    <div className="content-stretch flex gap-[98px] items-start relative shrink-0 w-full" data-name="Row 1">
      <Default1 />
      <Selected1 />
      <Active1 />
    </div>
  );
}

function Content10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start justify-center min-h-px relative w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-w-px not-italic relative text-[16px] text-[rgba(21,21,21,0.45)]">
        <p className="leading-[normal]">Label</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
        <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 5">
            <path d="M5 5L0 0H10L5 5Z" fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Disabled1() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[18px] whitespace-nowrap">Disabled</p>
      <div className="bg-white content-stretch flex flex-col h-[48px] items-start justify-center p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border border-[#a8a8a8] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <Content10 />
      </div>
    </div>
  );
}

function Content11() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start justify-center min-h-px relative w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-w-px not-italic relative text-[#333] text-[16px]">
        <p className="leading-[normal]">Option 1, Option 2</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
        <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 5">
            <path d="M5 5L0 0H10L5 5Z" fill="var(--fill-0, #151515)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function RequiredError1() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Required error">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[18px] whitespace-nowrap">Error</p>
      <div className="bg-white content-stretch flex flex-col h-[48px] items-start justify-center p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border border-[#b00020] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <Content11 />
        <p className="[word-break:break-word] absolute bottom-[-4px] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] left-[12px] not-italic right-[12px] text-[#b00020] text-[12px] translate-y-full">Error message</p>
        <div className="absolute bg-white content-stretch flex h-[8px] items-end justify-center left-[8px] px-[4px] top-0" data-name=".Forms elements/Label">
          <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#b00020] text-[12px] whitespace-nowrap">Label</p>
        </div>
      </div>
    </div>
  );
}

function Row4() {
  return (
    <div className="content-stretch flex gap-[98px] items-start relative shrink-0 w-full" data-name="Row 2">
      <Disabled1 />
      <RequiredError1 />
    </div>
  );
}

function Content12() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start justify-center min-h-px relative w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-w-px not-italic relative text-[16px] text-[rgba(21,21,21,0.45)]">
        <p className="leading-[normal]">Option 1, Option 2</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
        <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 5">
            <path d="M5 5L0 0H10L5 5Z" fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function DisabledFilled1() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Disabled / filled">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[18px] whitespace-nowrap">Disabled / filled</p>
      <div className="bg-white content-stretch flex flex-col h-[48px] items-start justify-center p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border border-[#a8a8a8] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <Content12 />
        <div className="absolute bg-white content-stretch flex h-[8px] items-end justify-center left-[8px] px-[4px] top-0" data-name=".Forms elements/Label">
          <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-[rgba(21,21,21,0.45)] whitespace-nowrap">Label</p>
        </div>
      </div>
    </div>
  );
}

function Content13() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start justify-center min-h-px relative w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-w-px not-italic relative text-[#333] text-[16px]">
        <p className="leading-[normal]">Option 1, Option 2</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
        <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 5">
            <path d="M5 5L0 0H10L5 5Z" fill="var(--fill-0, #151515)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Hover1() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[18px] whitespace-nowrap">Hover</p>
      <div className="bg-white content-stretch flex flex-col h-[48px] items-start justify-center p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <Content13 />
        <div className="absolute bg-white content-stretch flex h-[8px] items-end justify-center left-[8px] px-[4px] top-0" data-name=".Forms elements/Label">
          <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[12px] whitespace-nowrap">Label</p>
        </div>
      </div>
    </div>
  );
}

function Row5() {
  return (
    <div className="content-stretch flex gap-[98px] items-start relative shrink-0 w-full" data-name="Row 3">
      <DisabledFilled1 />
      <Hover1 />
    </div>
  );
}

function States1() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-name="States">
      <Row3 />
      <Row4 />
      <Row5 />
    </div>
  );
}

function DropdownMultiSelection() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Dropdown Multi Selection">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[24px] w-full">Dropdown multi selection</p>
      <States1 />
    </div>
  );
}

export default function Types() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative size-full" data-name="Types">
      <DropdownSingleSelection />
      <DropdownMultiSelection />
    </div>
  );
}
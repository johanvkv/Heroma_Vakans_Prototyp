import svgPaths from "./svg-2lutiktoax";

function Content() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/White">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, white)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content />
    </div>
  );
}

function Default() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-[#5236ab] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[4px] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown />
      </div>
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content1 />
    </div>
  );
}

function Hover() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#cbc3e6] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown1 />
      </div>
    </div>
  );
}

function Content2() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown2() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content2 />
    </div>
  );
}

function Focus() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#afa3d8] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[4px] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown2 />
      </div>
    </div>
  );
}

function Content3() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/White">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, white)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown3() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content3 />
    </div>
  );
}

function Pressed() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#3a2679] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[4px] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown3 />
      </div>
    </div>
  );
}

function Content4() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Gray">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown4() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content4 />
    </div>
  );
}

function Disabled() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[4px] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown4 />
      </div>
    </div>
  );
}

export default function Variants() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative size-full" data-name="Variants">
      <Default />
      <Hover />
      <Focus />
      <Pressed />
      <Disabled />
    </div>
  );
}
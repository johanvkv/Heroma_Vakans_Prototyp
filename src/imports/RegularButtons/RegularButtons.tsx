import svgPaths from "./svg-0a4trn7vch";

function Content() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
        <p className="leading-[24px]">Button</p>
      </div>
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
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-[#5236ab] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown />
      </div>
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
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
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#cbc3e6] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown1 />
      </div>
    </div>
  );
}

function Content2() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
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
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#afa3d8] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown2 />
      </div>
    </div>
  );
}

function Content3() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Button</p>
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
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#3a2679] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown3 />
      </div>
    </div>
  );
}

function Content4() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
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
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown4 />
      </div>
    </div>
  );
}

function States() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="States">
      <Default />
      <Hover />
      <Focus />
      <Pressed />
      <Disabled />
    </div>
  );
}

function Primary() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Primary">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Primary</p>
      <States />
    </div>
  );
}

function Content5() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown5() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content5 />
    </div>
  );
}

function Default1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown5 />
      </div>
    </div>
  );
}

function Content6() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown6() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content6 />
    </div>
  );
}

function Hover1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown6 />
      </div>
    </div>
  );
}

function Content7() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown7() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content7 />
    </div>
  );
}

function Focus1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#c0c0c0] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown7 />
      </div>
    </div>
  );
}

function Content8() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown8() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content8 />
    </div>
  );
}

function Pressed1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#a8a8a8] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown8 />
      </div>
    </div>
  );
}

function Content9() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown9() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content9 />
    </div>
  );
}

function Disabled1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown9 />
      </div>
    </div>
  );
}

function States1() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="States">
      <Default1 />
      <Hover1 />
      <Focus1 />
      <Pressed1 />
      <Disabled1 />
    </div>
  );
}

function Secondary() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Secondary">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Secondary</p>
      <States1 />
    </div>
  );
}

function Content10() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown10() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content10 />
    </div>
  );
}

function Default2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-white relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown10 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#5236ab] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content11() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown11() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content11 />
    </div>
  );
}

function Hover2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#f2f1f9] relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown11 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#5236ab] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content12() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown12() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content12 />
    </div>
  );
}

function Focus2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#e6e3f3] relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown12 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#200a58] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content13() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown13() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content13 />
    </div>
  );
}

function Pressed2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#cbc3e6] relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown13 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#200a58] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content14() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown14() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content14 />
    </div>
  );
}

function Disabled2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-white relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown14 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#efefef] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function States2() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="States">
      <Default2 />
      <Hover2 />
      <Focus2 />
      <Pressed2 />
      <Disabled2 />
    </div>
  );
}

function Outline() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Outline">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Outline</p>
      <States2 />
    </div>
  );
}

function Content15() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown15() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content15 />
    </div>
  );
}

function Default3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown15 />
      </div>
    </div>
  );
}

function Content16() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown16() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content16 />
    </div>
  );
}

function Hover3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown16 />
      </div>
    </div>
  );
}

function Content17() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown17() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content17 />
    </div>
  );
}

function Focus3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#f2f1f9] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown17 />
      </div>
    </div>
  );
}

function Content18() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown18() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content18 />
    </div>
  );
}

function Pressed3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#e6e3f3] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown18 />
      </div>
    </div>
  );
}

function Content19() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown19() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content19 />
    </div>
  );
}

function Disabled3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown19 />
      </div>
    </div>
  );
}

function States3() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="States">
      <Default3 />
      <Hover3 />
      <Focus3 />
      <Pressed3 />
      <Disabled3 />
    </div>
  );
}

function LabelOnly() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Label only">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Label only</p>
      <States3 />
    </div>
  );
}

function StandardButtonTypes() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Standard button types">
      <Primary />
      <Secondary />
      <Outline />
      <LabelOnly />
    </div>
  );
}

function StandardButtons() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Standard buttons">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[24px] w-full">Standard buttons</p>
      <StandardButtonTypes />
    </div>
  );
}

function Content20() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/White">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, white)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown20() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content20 />
    </div>
  );
}

function Default4() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-[#5236ab] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown20 />
      </div>
    </div>
  );
}

function Content21() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown21() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content21 />
    </div>
  );
}

function Hover4() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#cbc3e6] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown21 />
      </div>
    </div>
  );
}

function Content22() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown22() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content22 />
    </div>
  );
}

function Focus4() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#afa3d8] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown22 />
      </div>
    </div>
  );
}

function Content23() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/White">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, white)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown23() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content23 />
    </div>
  );
}

function Pressed4() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#3a2679] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown23 />
      </div>
    </div>
  );
}

function Content24() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Gray">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown24() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content24 />
    </div>
  );
}

function Disabled4() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown24 />
      </div>
    </div>
  );
}

function Variants() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default4 />
      <Hover4 />
      <Focus4 />
      <Pressed4 />
      <Disabled4 />
    </div>
  );
}

function Primary1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Primary">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Primary</p>
      <Variants />
    </div>
  );
}

function Content25() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown25() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content25 />
    </div>
  );
}

function Default5() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown25 />
      </div>
    </div>
  );
}

function Content26() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown26() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content26 />
    </div>
  );
}

function Hover5() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown26 />
      </div>
    </div>
  );
}

function Content27() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown27() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content27 />
    </div>
  );
}

function Focus5() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#c0c0c0] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown27 />
      </div>
    </div>
  );
}

function Content28() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown28() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content28 />
    </div>
  );
}

function Pressed5() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#a8a8a8] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown28 />
      </div>
    </div>
  );
}

function Content29() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Gray">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown29() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content29 />
    </div>
  );
}

function Disabled5() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown29 />
      </div>
    </div>
  );
}

function Variants1() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default5 />
      <Hover5 />
      <Focus5 />
      <Pressed5 />
      <Disabled5 />
    </div>
  );
}

function Secondary1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Secondary">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Secondary</p>
      <Variants1 />
    </div>
  );
}

function Content30() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown30() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content30 />
    </div>
  );
}

function Default6() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-white relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown30 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#5236ab] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content31() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown31() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content31 />
    </div>
  );
}

function Hover6() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#f2f1f9] relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown31 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#5236ab] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content32() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown32() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content32 />
    </div>
  );
}

function Focus6() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#e6e3f3] relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown32 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#200a58] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content33() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown33() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content33 />
    </div>
  );
}

function Pressed6() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#cbc3e6] relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown33 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#200a58] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content34() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #151515)" fillOpacity="0.45" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown34() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content34 />
    </div>
  );
}

function Disabled6() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-white relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown34 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#efefef] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Variants2() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default6 />
      <Hover6 />
      <Focus6 />
      <Pressed6 />
      <Disabled6 />
    </div>
  );
}

function Outline1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Outline">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Outline</p>
      <Variants2 />
    </div>
  );
}

function Content35() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown35() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content35 />
    </div>
  );
}

function Default7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown35 />
      </div>
    </div>
  );
}

function Content36() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown36() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content36 />
    </div>
  );
}

function Hover7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown36 />
      </div>
    </div>
  );
}

function Content37() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown37() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content37 />
    </div>
  );
}

function Focus7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#f2f1f9] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown37 />
      </div>
    </div>
  );
}

function Content38() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown38() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content38 />
    </div>
  );
}

function Pressed7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#e6e3f3] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown38 />
      </div>
    </div>
  );
}

function Content39() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Gray">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown39() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content39 />
    </div>
  );
}

function Disabled7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown39 />
      </div>
    </div>
  );
}

function Variants3() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default7 />
      <Hover7 />
      <Focus7 />
      <Pressed7 />
      <Disabled7 />
    </div>
  );
}

function LabelOnly1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Label only">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Label only</p>
      <Variants3 />
    </div>
  );
}

function ButtonsWithIconTypes() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Buttons with icon types">
      <Primary1 />
      <Secondary1 />
      <Outline1 />
      <LabelOnly1 />
    </div>
  );
}

function LabelWithIconButtons() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Label with icon buttons">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[24px] whitespace-nowrap">Label with icon buttons</p>
      <ButtonsWithIconTypes />
    </div>
  );
}

function Content40() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/White">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, white)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown40() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content40 />
    </div>
  );
}

function Default8() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-[#5236ab] content-stretch flex items-center justify-center overflow-clip p-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown40 />
      </div>
    </div>
  );
}

function Content41() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown41() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content41 />
    </div>
  );
}

function Hover8() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#cbc3e6] content-stretch flex items-center justify-center overflow-clip p-[12px] relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown41 />
      </div>
    </div>
  );
}

function Content42() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown42() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content42 />
    </div>
  );
}

function Focus8() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#afa3d8] content-stretch flex items-center justify-center overflow-clip p-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown42 />
      </div>
    </div>
  );
}

function Content43() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/White">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, white)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown43() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content43 />
    </div>
  );
}

function Pressed8() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#3a2679] content-stretch flex items-center justify-center overflow-clip p-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown43 />
      </div>
    </div>
  );
}

function Content44() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Gray">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown44() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content44 />
    </div>
  );
}

function Disabled8() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip p-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown44 />
      </div>
    </div>
  );
}

function Variants4() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default8 />
      <Hover8 />
      <Focus8 />
      <Pressed8 />
      <Disabled8 />
    </div>
  );
}

function Primary2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Primary">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Primary</p>
      <Variants4 />
    </div>
  );
}

function Content45() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown45() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content45 />
    </div>
  );
}

function Default9() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip p-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown45 />
      </div>
    </div>
  );
}

function Content46() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown46() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content46 />
    </div>
  );
}

function Hover9() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip p-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown46 />
      </div>
    </div>
  );
}

function Content47() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown47() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content47 />
    </div>
  );
}

function Focus9() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#c0c0c0] content-stretch flex items-center justify-center overflow-clip p-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown47 />
      </div>
    </div>
  );
}

function Content48() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown48() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content48 />
    </div>
  );
}

function Pressed9() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#a8a8a8] content-stretch flex items-center justify-center overflow-clip p-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown48 />
      </div>
    </div>
  );
}

function Content49() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Gray">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown49() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content49 />
    </div>
  );
}

function Disabled9() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip p-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown49 />
      </div>
    </div>
  );
}

function Variants5() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default9 />
      <Hover9 />
      <Focus9 />
      <Pressed9 />
      <Disabled9 />
    </div>
  );
}

function Secondary2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Secondary">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Secondary</p>
      <Variants5 />
    </div>
  );
}

function Content50() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown50() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content50 />
    </div>
  );
}

function Default10() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-white relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown50 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#5236ab] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content51() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown51() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content51 />
    </div>
  );
}

function Hover10() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#f2f1f9] relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown51 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#5236ab] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content52() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown52() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content52 />
    </div>
  );
}

function Focus10() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#e6e3f3] relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown52 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#200a58] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content53() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown53() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content53 />
    </div>
  );
}

function Pressed10() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#cbc3e6] relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown53 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#200a58] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content54() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #151515)" fillOpacity="0.45" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown54() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content54 />
    </div>
  );
}

function Disabled10() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-white relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown54 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#efefef] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Variants6() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default10 />
      <Hover10 />
      <Focus10 />
      <Pressed10 />
      <Disabled10 />
    </div>
  );
}

function Outline2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Outline">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Outline</p>
      <Variants6 />
    </div>
  );
}

function Content55() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown55() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content55 />
    </div>
  );
}

function Default11() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="content-stretch flex items-center justify-center overflow-clip p-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown55 />
      </div>
    </div>
  );
}

function Content56() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown56() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content56 />
    </div>
  );
}

function Hover11() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="content-stretch flex items-center justify-center overflow-clip p-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown56 />
      </div>
    </div>
  );
}

function Content57() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown57() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content57 />
    </div>
  );
}

function Focus11() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#f2f1f9] content-stretch flex items-center justify-center overflow-clip p-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown57 />
      </div>
    </div>
  );
}

function Content58() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown58() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content58 />
    </div>
  );
}

function Pressed11() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#e6e3f3] content-stretch flex items-center justify-center overflow-clip p-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown58 />
      </div>
    </div>
  );
}

function Content59() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Gray">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown59() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content59 />
    </div>
  );
}

function Disabled11() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="content-stretch flex items-center justify-center overflow-clip p-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown59 />
      </div>
    </div>
  );
}

function Variants7() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default11 />
      <Hover11 />
      <Focus11 />
      <Pressed11 />
      <Disabled11 />
    </div>
  );
}

function LabelOnly2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Label only">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Label only</p>
      <Variants7 />
    </div>
  );
}

function IconButtonTypes() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Icon button types">
      <Primary2 />
      <Secondary2 />
      <Outline2 />
      <LabelOnly2 />
    </div>
  );
}

function IconButtons() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Icon buttons">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[24px] w-full">Icon buttons</p>
      <IconButtonTypes />
    </div>
  );
}

function Content60() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/White">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, white)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown60() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content60 />
    </div>
  );
}

function Default12() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-[#5236ab] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown60 />
      </div>
    </div>
  );
}

function Content61() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown61() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content61 />
    </div>
  );
}

function Hover12() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#cbc3e6] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown61 />
      </div>
    </div>
  );
}

function Content62() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown62() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content62 />
    </div>
  );
}

function Focus12() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#afa3d8] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown62 />
      </div>
    </div>
  );
}

function Content63() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/White">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, white)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown63() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content63 />
    </div>
  );
}

function Pressed12() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#3a2679] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown63 />
      </div>
    </div>
  );
}

function Content64() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Gray">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown64() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content64 />
    </div>
  );
}

function Disabled12() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown64 />
      </div>
    </div>
  );
}

function Variants8() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default12 />
      <Hover12 />
      <Focus12 />
      <Pressed12 />
      <Disabled12 />
    </div>
  );
}

function Primary3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Primary">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Primary</p>
      <Variants8 />
    </div>
  );
}

function Content65() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown65() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content65 />
    </div>
  );
}

function Default13() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown65 />
      </div>
    </div>
  );
}

function Content66() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown66() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content66 />
    </div>
  );
}

function Hover13() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown66 />
      </div>
    </div>
  );
}

function Content67() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown67() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content67 />
    </div>
  );
}

function Focus13() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#c0c0c0] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown67 />
      </div>
    </div>
  );
}

function Content68() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown68() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content68 />
    </div>
  );
}

function Pressed13() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#a8a8a8] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown68 />
      </div>
    </div>
  );
}

function Content69() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Gray">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown69() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content69 />
    </div>
  );
}

function Disabled13() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown69 />
      </div>
    </div>
  );
}

function Variants9() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default13 />
      <Hover13 />
      <Focus13 />
      <Pressed13 />
      <Disabled13 />
    </div>
  );
}

function Secondary3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Secondary">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Secondary</p>
      <Variants9 />
    </div>
  );
}

function Content70() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown70() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content70 />
    </div>
  );
}

function Default14() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-white relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown70 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#5236ab] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content71() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown71() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content71 />
    </div>
  );
}

function Hover14() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#f2f1f9] relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown71 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#5236ab] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content72() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown72() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content72 />
    </div>
  );
}

function Focus14() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#e6e3f3] relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown72 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#200a58] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content73() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown73() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content73 />
    </div>
  );
}

function Pressed14() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#cbc3e6] relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown73 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#200a58] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content74() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #151515)" fillOpacity="0.45" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown74() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content74 />
    </div>
  );
}

function Disabled14() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-white relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown74 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#efefef] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Variants10() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default14 />
      <Hover14 />
      <Focus14 />
      <Pressed14 />
      <Disabled14 />
    </div>
  );
}

function Outline3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Outline">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Outline</p>
      <Variants10 />
    </div>
  );
}

function Content75() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown75() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content75 />
    </div>
  );
}

function Default15() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown75 />
      </div>
    </div>
  );
}

function Content76() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown76() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content76 />
    </div>
  );
}

function Hover15() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown76 />
      </div>
    </div>
  );
}

function Content77() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown77() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content77 />
    </div>
  );
}

function Focus15() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#f2f1f9] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown77 />
      </div>
    </div>
  );
}

function Content78() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown78() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content78 />
    </div>
  );
}

function Pressed15() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#e6e3f3] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown78 />
      </div>
    </div>
  );
}

function Content79() {
  return (
    <div className="content-stretch flex gap-[8px] h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Gray">
        <div className="absolute inset-[16.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p13494900} fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown79() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content79 />
    </div>
  );
}

function Disabled15() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown79 />
      </div>
    </div>
  );
}

function Variants11() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default15 />
      <Hover15 />
      <Focus15 />
      <Pressed15 />
      <Disabled15 />
    </div>
  );
}

function LabelOnly3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Label only">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Label only</p>
      <Variants11 />
    </div>
  );
}

function IconWithLabel() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Icon with label">
      <Primary3 />
      <Secondary3 />
      <Outline3 />
      <LabelOnly3 />
    </div>
  );
}

function IconWithLabelButtons() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Icon with label buttons">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[24px] whitespace-nowrap">Icon with label buttons</p>
      <IconWithLabel />
    </div>
  );
}

function Content80() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
        <p className="leading-[24px]">Button</p>
      </div>
    </div>
  );
}

function ContentDropdown80() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content80 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/White">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, white)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Default16() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-[#5236ab] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown80 />
      </div>
    </div>
  );
}

function Content81() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown81() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content81 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Dark purple">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Hover16() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#cbc3e6] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown81 />
      </div>
    </div>
  );
}

function Content82() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown82() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content82 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Dark purple">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Focus16() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#afa3d8] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown82 />
      </div>
    </div>
  );
}

function Content83() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown83() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content83 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/White">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p34024400} fill="var(--fill-0, white)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Pressed16() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#3a2679] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown83 />
      </div>
    </div>
  );
}

function Content84() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown84() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content84 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Gray">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Disabled16() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown84 />
      </div>
    </div>
  );
}

function Variants12() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default16 />
      <Hover16 />
      <Focus16 />
      <Pressed16 />
      <Disabled16 />
    </div>
  );
}

function Primary4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Primary">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Primary</p>
      <Variants12 />
    </div>
  );
}

function Content85() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown85() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content85 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Dark purple">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Default17() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown85 />
      </div>
    </div>
  );
}

function Content86() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown86() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content86 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Purple">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Hover17() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown86 />
      </div>
    </div>
  );
}

function Content87() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown87() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content87 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Dark purple">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Focus17() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#c0c0c0] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown87 />
      </div>
    </div>
  );
}

function Content88() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown88() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content88 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Dark purple">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p34024400} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Pressed17() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#a8a8a8] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown88 />
      </div>
    </div>
  );
}

function Content89() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown89() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content89 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Gray">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Disabled17() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown89 />
      </div>
    </div>
  );
}

function Variants13() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default17 />
      <Hover17 />
      <Focus17 />
      <Pressed17 />
      <Disabled17 />
    </div>
  );
}

function Secondary4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Secondary">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Secondary</p>
      <Variants13 />
    </div>
  );
}

function Content90() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown90() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content90 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Purple">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Default18() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="bg-white relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown90 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#5236ab] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content91() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown91() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content91 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Purple">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Hover18() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="bg-[#f2f1f9] relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown91 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#5236ab] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content92() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown92() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content92 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Purple">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Focus18() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#e6e3f3] relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown92 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#200a58] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content93() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown93() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content93 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Purple">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p34024400} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Pressed18() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#cbc3e6] relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown93 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#200a58] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Content94() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown94() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content94 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Gray">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Disabled18() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="bg-white relative shrink-0" data-name="Buttons/Square/Regular">
        <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
          <ContentDropdown94 />
        </div>
        <div aria-hidden="true" className="absolute border border-[#efefef] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Variants14() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default18 />
      <Hover18 />
      <Focus18 />
      <Pressed18 />
      <Disabled18 />
    </div>
  );
}

function Outline4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Outline">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Outline</p>
      <Variants14 />
    </div>
  );
}

function Content95() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown95() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content95 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Dark purple">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, #200A58)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Default19() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Default">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Default</p>
      <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown95 />
      </div>
    </div>
  );
}

function Content96() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown96() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content96 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Purple">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Hover19() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Hover">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Hover</p>
      <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown96 />
      </div>
    </div>
  );
}

function Content97() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown97() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content97 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Purple">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Focus19() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Focus">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Focus</p>
      <div className="bg-[#f2f1f9] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown97 />
      </div>
    </div>
  );
}

function Content98() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown98() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content98 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Purple">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p34024400} fill="var(--fill-0, #5236AB)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Pressed19() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Pressed">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Pressed</p>
      <div className="bg-[#e6e3f3] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown98 />
      </div>
    </div>
  );
}

function Content99() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(21,21,21,0.45)] text-center whitespace-nowrap">Button</p>
    </div>
  );
}

function ContentDropdown99() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content99 />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Icons/Dropdown/Colour/Gray">
        <div className="absolute bottom-[35.94%] left-1/4 right-1/4 top-[33.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 7.4">
            <path d={svgPaths.p13733a00} fill="var(--fill-0, #A8A8A8)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Disabled19() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="Disabled">
      <p className="[word-break:break-word] font-['Lato:Regular',sans-serif] leading-[17px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-[116px]">Disabled</p>
      <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown99 />
      </div>
    </div>
  );
}

function Variants15() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full" data-name="Variants">
      <Default19 />
      <Hover19 />
      <Focus19 />
      <Pressed19 />
      <Disabled19 />
    </div>
  );
}

function LabelOnly4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Label only">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Label only</p>
      <Variants15 />
    </div>
  );
}

function IconWithLabel1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Icon with label">
      <Primary4 />
      <Secondary4 />
      <Outline4 />
      <LabelOnly4 />
    </div>
  );
}

function ButtonsWithADropdown() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Buttons with a dropdown">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[24px] whitespace-nowrap">Buttons with dropdown</p>
      <IconWithLabel1 />
    </div>
  );
}

function RegularButtonVariants() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-name="Regular button variants">
      <StandardButtons />
      <LabelWithIconButtons />
      <IconButtons />
      <IconWithLabelButtons />
      <ButtonsWithADropdown />
    </div>
  );
}

export default function RegularButtons() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative size-full" data-name="Regular buttons">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[28px] w-full">Regular buttons</p>
      <RegularButtonVariants />
    </div>
  );
}
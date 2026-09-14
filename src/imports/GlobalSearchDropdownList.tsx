function SectionOption() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-[24px] items-start justify-center min-h-px min-w-px relative" data-name="Section/option">
      <div className="flex flex-col font-['Source_Sans_Pro:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[16px] w-full">
        <p className="leading-[20px]">Section name</p>
      </div>
    </div>
  );
}

function SectionOption1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] items-start justify-center leading-[0] min-h-px min-w-px not-italic relative" data-name="Section/option">
      <div className="flex flex-col justify-center relative shrink-0 text-[#333] text-[16px] w-full">
        <p className="leading-[20px]">Option 1</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#5c5c5c] text-[14px] w-full">
        <p className="leading-[17px]">Section title/Option 1</p>
      </div>
    </div>
  );
}

function SectionOption2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] items-start justify-center leading-[0] min-h-px min-w-px not-italic relative" data-name="Section/option">
      <div className="flex flex-col justify-center relative shrink-0 text-[#333] text-[16px] w-full">
        <p className="leading-[20px]">Option 2</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#5c5c5c] text-[14px] w-full">
        <p className="leading-[17px]">Section title/Option 2</p>
      </div>
    </div>
  );
}

function SectionOption3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] items-start justify-center leading-[0] min-h-px min-w-px not-italic relative" data-name="Section/option">
      <div className="flex flex-col justify-center relative shrink-0 text-[#333] text-[16px] w-full">
        <p className="leading-[20px]">Option 3</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#5c5c5c] text-[14px] w-full">
        <p className="leading-[17px]">Section title/Option 3</p>
      </div>
    </div>
  );
}

function SectionOption4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] items-start justify-center leading-[0] min-h-px min-w-px not-italic relative" data-name="Section/option">
      <div className="flex flex-col justify-center relative shrink-0 text-[#333] text-[16px] w-full">
        <p className="leading-[20px]">Option 4</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#5c5c5c] text-[14px] w-full">
        <p className="leading-[17px]">Section title/Option 4</p>
      </div>
    </div>
  );
}

function SectionOption5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] items-start justify-center leading-[0] min-h-px min-w-px not-italic relative" data-name="Section/option">
      <div className="flex flex-col justify-center relative shrink-0 text-[#333] text-[16px] w-full">
        <p className="leading-[20px]">Option 5</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#5c5c5c] text-[14px] w-full">
        <p className="leading-[17px]">Section title/Option 5</p>
      </div>
    </div>
  );
}

function VerticalScroll() {
  return (
    <div className="absolute bottom-[8px] content-stretch flex items-start right-[8px] top-[8px]" data-name="Vertical scroll">
      <div className="bg-[#c0c0c0] h-[77px] rounded-[5px] shrink-0 w-[5px]" data-name="Scroll Bar/Short" />
    </div>
  );
}

export default function GlobalSearchDropdownList() {
  return (
    <div className="bg-[#f2f1f9] content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shadow-[0px_2px_6px_2px_rgba(0,0,0,0.15),0px_2px_6px_2px_rgba(0,0,0,0.15)] size-full" data-name=".Global search/Dropdown list">
      <div className="bg-[#f2f1f9] relative rounded-[4px] shrink-0 w-full" data-name=".Global search/Dropdown list/Elements">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[12px] py-[8px] relative w-full">
            <SectionOption />
          </div>
        </div>
      </div>
      <div className="bg-[#f2f1f9] relative rounded-[4px] shrink-0 w-full" data-name=".Global search/Dropdown list/Elements">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[12px] py-[8px] relative w-full">
            <SectionOption1 />
          </div>
        </div>
      </div>
      <div className="bg-[#f2f1f9] relative rounded-[4px] shrink-0 w-full" data-name=".Global search/Dropdown list/Elements">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[12px] py-[8px] relative w-full">
            <SectionOption2 />
          </div>
        </div>
      </div>
      <div className="bg-[#f2f1f9] relative rounded-[4px] shrink-0 w-full" data-name=".Global search/Dropdown list/Elements">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[12px] py-[8px] relative w-full">
            <SectionOption3 />
          </div>
        </div>
      </div>
      <div className="bg-[#f2f1f9] relative rounded-[4px] shrink-0 w-full" data-name=".Global search/Dropdown list/Elements">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[12px] py-[8px] relative w-full">
            <SectionOption4 />
          </div>
        </div>
      </div>
      <div className="bg-[#f2f1f9] relative rounded-[4px] shrink-0 w-full" data-name=".Global search/Dropdown list/Elements">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[12px] py-[8px] relative w-full">
            <SectionOption5 />
          </div>
        </div>
      </div>
      <VerticalScroll />
    </div>
  );
}
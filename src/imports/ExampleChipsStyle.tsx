import svgPaths from "./svg-s9e7d7qzaf";

export default function ExampleChipsStyle() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start px-[16px] relative size-full" data-name=".Example/Chips/Style">
      <div className="bg-white content-stretch flex flex-col h-[48px] items-start justify-center p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border border-[#a8a8a8] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-end justify-center min-h-px min-w-px relative w-full" data-name="Content">
          <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
            <div className="absolute inset-[12.5%]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                <path d={svgPaths.p16b4a380} fill="var(--fill-0, #151515)" id="Vector" />
              </svg>
            </div>
          </div>
          <div className="flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#333] text-[16px]">
            <p className="leading-[normal]">Search keywords</p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[349px]" data-name="Active filters">
        <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[18px] w-full">
          <p className="leading-[normal]">Active filters</p>
        </div>
        <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full" data-name="Chips">
          <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Active filters">
            <div className="bg-[#333] relative rounded-[20px] shrink-0" data-name="Chips/Filter chips">
              <div className="content-stretch flex gap-[8px] items-center justify-center overflow-clip px-[12px] py-[3.5px] relative rounded-[inherit]">
                <div className="flex flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
                  <p className="leading-[17px]">Filter 1</p>
                </div>
                <div className="relative shrink-0 size-[8px]" data-name="Vector">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                    <path d={svgPaths.p8f771c0} fill="var(--fill-0, white)" id="Vector" />
                  </svg>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none rounded-[20px]" />
            </div>
            <div className="bg-[#333] relative rounded-[20px] shrink-0" data-name="Chips/Filter chips">
              <div className="content-stretch flex gap-[8px] items-center justify-center overflow-clip px-[12px] py-[3.5px] relative rounded-[inherit]">
                <div className="flex flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
                  <p className="leading-[17px]">Filter 2</p>
                </div>
                <div className="relative shrink-0 size-[8px]" data-name="Vector">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                    <path d={svgPaths.p8f771c0} fill="var(--fill-0, white)" id="Vector" />
                  </svg>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none rounded-[20px]" />
            </div>
            <div className="bg-[#333] relative rounded-[20px] shrink-0" data-name="Chips/Filter chips">
              <div className="content-stretch flex gap-[8px] items-center justify-center overflow-clip px-[12px] py-[3.5px] relative rounded-[inherit]">
                <div className="flex flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
                  <p className="leading-[17px]">Filter 3</p>
                </div>
                <div className="relative shrink-0 size-[8px]" data-name="Vector">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                    <path d={svgPaths.p8f771c0} fill="var(--fill-0, white)" id="Vector" />
                  </svg>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none rounded-[20px]" />
            </div>
          </div>
          <div className="flex flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#5236ab] text-[14px] text-center whitespace-nowrap">
            <p className="[text-decoration-skip-ink:none] decoration-solid leading-[17px] underline">Clear all filters</p>
          </div>
        </div>
      </div>
    </div>
  );
}
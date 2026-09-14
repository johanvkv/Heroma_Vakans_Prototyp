import svgPaths from "./svg-753lc3ur25";

export default function ModalDialog() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start justify-center relative rounded-[4px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] size-full" data-name="Modal dialog">
      <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Header">
        <div aria-hidden="true" className="absolute border-0 border-[#c0c0c0] border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex gap-[12px] items-start p-[24px] relative size-full">
          <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative" data-name=".Modal dialog/Elements/Header">
            <div className="flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#333] text-[20px]">
              <p className="leading-[normal]">Delete account?</p>
            </div>
          </div>
          <div className="relative shrink-0 size-[24px]" data-name=".Modal dialog/Elements/Close icon">
            <div className="absolute inset-[20.83%]" data-name="Close">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                <path d={svgPaths.p2404b080} fill="var(--fill-0, #151515)" id="Close" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="relative shrink-0 w-full" data-name="Button section">
        <div className="content-stretch flex items-start px-[24px] py-[16px] relative w-full">
          <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-end justify-end min-h-px min-w-px relative" data-name="Right buttons">
            <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[4px] shrink-0" data-name="Buttons/Square/Regular">
              <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
                <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
                  <p className="font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Cancel</p>
                </div>
              </div>
            </div>
            <div className="bg-[#5236ab] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[4px] shrink-0" data-name="Buttons/Square/Regular">
              <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
                <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
                  <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
                    <p className="leading-[24px]">Delete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
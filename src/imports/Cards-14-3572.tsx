export default function Cards() {
  return (
    <div className="bg-white relative rounded-[4px] size-full" data-name="Cards">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <div className="bg-[#efefef] h-[5px] shrink-0 w-full" data-name="Top border" />
        <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Content">
          <div className="content-stretch flex flex-col gap-[32px] items-start py-[16px] relative size-full">
            <div className="relative shrink-0 w-full" data-name=".Cards/Card title">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex items-center px-[16px] relative w-full">
                  <p className="flex-[1_0_0] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#333] text-[24px]">Square button guidelines</p>
                </div>
              </div>
            </div>
            <div className="relative shrink-0 w-full" data-name=".Example/Buttons/Usage/Best practices">
              <div className="content-stretch flex flex-col gap-[24px] items-start px-[16px] relative w-full">
                <div className="content-stretch flex gap-[24px] items-center justify-center relative shrink-0 w-full" data-name="btn examples">
                  <div className="bg-[#5236ab] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[4px] shrink-0" data-name="Buttons/Square/Regular">
                    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
                      <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
                        <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
                          <p className="leading-[24px]">Button</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[4px] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] shrink-0" data-name="Buttons/Square/Regular">
                    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
                      <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
                        <p className="font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white relative rounded-[4px] shrink-0" data-name="Buttons/Square/Regular">
                    <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit]">
                      <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
                        <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
                          <p className="font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#5236ab] text-[16px] text-center whitespace-nowrap">Button</p>
                        </div>
                      </div>
                    </div>
                    <div aria-hidden="true" className="absolute border border-[#5236ab] border-solid inset-0 pointer-events-none rounded-[4px]" />
                  </div>
                  <div className="content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[4px] shrink-0" data-name="Buttons/Square/Regular">
                    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
                      <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
                        <p className="font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#200a58] text-[16px] text-center whitespace-nowrap">Button</p>
                      </div>
                    </div>
                  </div>
                </div>
                <ul className="block font-['Source_Sans_Pro:Regular',sans-serif] leading-[0] list-disc not-italic relative shrink-0 text-[#333] text-[16px] w-full whitespace-pre-wrap">
                  <li className="mb-[16px] ms-[24px]">
                    <span className="font-['Source_Sans_Pro:Bold',sans-serif] leading-[20px] not-italic">{`Tone & characteristics:`}</span>
                    <span className="leading-[20px]">{` Square buttons have a structured design, offering a clean, bold tone with share corners. They maintain uniformity in size and spacing due to their inherent design. They can help create a strong and professional presence to reflect the purpose of the products.`}</span>
                  </li>
                  <li className="ms-[24px]">
                    <span className="font-['Source_Sans_Pro:Bold',sans-serif] leading-[20px] not-italic">{`Ideal use case scenarios: `}</span>
                    <span className="leading-[20px]">They are suitable for platforms such as enterprise applications, financial services, and data-heavy dashboards, where clarity and precision are essential.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#efefef] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}
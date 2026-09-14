import svgPaths from "./svg-8740js4xob";

export default function Alerts() {
  return (
    <div className="bg-white relative rounded-[4px] size-full" data-name="Alerts">
      <div className="content-stretch flex flex-col items-start overflow-clip pl-[20px] pr-[16px] py-[16px] relative rounded-[inherit] size-full">
        <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-start min-h-px min-w-px relative w-full" data-name="Badge, title, content and close">
          <div className="bg-[#5236ab] content-stretch flex items-center p-[2px] relative rounded-[100px] shrink-0" data-name=".Alerts/Elements/Icons">
            <div className="relative shrink-0 size-[20px]" data-name="Info">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <g id="Info">
                  <mask height="20" id="mask0_11_197" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
                    <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
                  </mask>
                  <g mask="url(#mask0_11_197)">
                    <path d={svgPaths.p9238b00} fill="var(--fill-0, white)" id="info_i" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
          <p className="flex-[1_0_0] font-['Source_Sans_Pro:Regular',sans-serif] h-full leading-[20px] min-h-px min-w-px not-italic relative text-[#333] text-[16px]">Hello! The weather today is looking groovy.</p>
          <div className="relative shrink-0 size-[24px]" data-name=".Alerts/Elements/Close icon">
            <div className="absolute inset-[20.83%]" data-name="Close">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                <path d={svgPaths.p2404b080} fill="var(--fill-0, #151515)" id="Close" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#5236ab] border-l-4 border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]" />
    </div>
  );
}
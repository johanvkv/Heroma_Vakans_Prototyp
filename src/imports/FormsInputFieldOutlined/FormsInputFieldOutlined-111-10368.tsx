import svgPaths from "./svg-qjx0nx5psc";

export default function FormsInputFieldOutlined() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start p-[12px] relative rounded-[4px] size-full" data-name="Forms/Input field/Outlined">
      <div aria-hidden="true" className="absolute border border-[#a8a8a8] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="absolute bg-white content-stretch flex h-[8px] items-end justify-center left-[8px] px-[4px] top-0" data-name=".Forms elements/Label">
        <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[12px] whitespace-nowrap">Label</p>
      </div>
      <p className="[word-break:break-word] flex-[1_0_0] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] min-h-px min-w-full not-italic relative text-[#333] text-[16px] w-[min-content]">Input text row 1</p>
      <p className="[word-break:break-word] absolute bottom-[-4px] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic right-[12px] text-[#333] text-[12px] text-right translate-y-full whitespace-nowrap">16/50</p>
      <div className="absolute h-[33px] right-[8px] top-[8px] w-[5px]" data-name="Scroll Bar/Short">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 33">
          <path d={svgPaths.p3affa500} fill="var(--fill-0, #A8A8A8)" id="Scroll Bar/Short" opacity="0.7" />
        </svg>
      </div>
    </div>
  );
}
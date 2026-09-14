export default function DisabledFilled() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative size-full" data-name="Disabled / filled">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[18px] whitespace-nowrap">Disabled / filled</p>
      <div className="bg-white content-stretch flex flex-col h-[64px] items-start p-[12px] relative rounded-[4px] shrink-0 w-[270px]" data-name="Forms/Input field/Outlined">
        <div aria-hidden="true" className="absolute border border-[rgba(21,21,21,0.45)] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="absolute bg-white content-stretch flex h-[8px] items-end justify-center left-[8px] px-[4px] top-0" data-name=".Forms elements/Label">
          <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-[rgba(21,21,21,0.45)] whitespace-nowrap">Label</p>
        </div>
        <p className="[word-break:break-word] flex-[1_0_0] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] min-h-px min-w-full not-italic relative text-[16px] text-[rgba(21,21,21,0.45)] w-[min-content]">Input text</p>
      </div>
    </div>
  );
}
export default function FormsInputFieldOutlined() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start justify-center p-[12px] relative rounded-[4px] size-full" data-name="Forms/Input field/Outlined">
      <div aria-hidden className="absolute border border-[#a8a8a8] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] min-h-px min-w-full not-italic relative text-[#333] text-[16px] w-[min-content]">Label</p>
      <p className="[word-break:break-word] absolute bottom-[-4px] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic right-[12px] text-[#333] text-[12px] text-right translate-y-full whitespace-nowrap">0/50</p>
    </div>
  );
}
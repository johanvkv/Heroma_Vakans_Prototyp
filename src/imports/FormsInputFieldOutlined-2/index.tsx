function Content() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start justify-center min-h-px relative w-full" data-name="Content">
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-w-px not-italic relative text-[#333] text-[16px]">
        <p className="leading-[normal]">Label</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Forms elements/Icons/Outlined">
        <div className="absolute inset-[41.67%_29.17%_37.5%_29.17%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 5">
            <path d="M5 5L0 0H10L5 5Z" fill="var(--fill-0, #151515)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function FormsInputFieldOutlined() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start justify-center p-[12px] relative size-full" data-name="Forms/Input field/Outlined">
      <div aria-hidden className="absolute border border-[#a8a8a8] border-solid inset-0 pointer-events-none" />
      <Content />
    </div>
  );
}
function StandardLabelSamples() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0" data-name="Standard label samples">
      <div className="bg-[#333] content-stretch flex items-start px-[16px] py-[4px] relative rounded-[4px] shrink-0" data-name="Labels">
        <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
          <p className="leading-[16px]">Default</p>
        </div>
      </div>
      <div className="bg-[#5236ab] content-stretch flex items-start px-[16px] py-[4px] relative rounded-[4px] shrink-0" data-name="Labels">
        <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
          <p className="leading-[16px]">Info</p>
        </div>
      </div>
      <div className="bg-[#18a86c] content-stretch flex items-start px-[16px] py-[4px] relative rounded-[4px] shrink-0" data-name="Labels">
        <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
          <p className="leading-[16px]">Success</p>
        </div>
      </div>
      <div className="bg-[#ab741a] content-stretch flex items-start px-[16px] py-[4px] relative rounded-[4px] shrink-0" data-name="Labels">
        <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
          <p className="leading-[16px]">Warning</p>
        </div>
      </div>
      <div className="bg-[#b00020] content-stretch flex items-start px-[16px] py-[4px] relative rounded-[4px] shrink-0" data-name="Labels">
        <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
          <p className="leading-[16px]">Error</p>
        </div>
      </div>
    </div>
  );
}

function StandardLabels() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Standard labels">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#333] text-[24px] w-[min-content]">Standard labels</p>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] min-w-full not-italic relative shrink-0 text-[#333] text-[16px] w-[min-content]">Use standard labels by default, unless many instances will be used on the screen at once.</p>
      <StandardLabelSamples />
    </div>
  );
}

function SubtleLabelsSample() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0" data-name="Subtle labels sample">
      <div className="bg-[#efefef] content-stretch flex items-start px-[16px] py-[4px] relative rounded-[4px] shrink-0" data-name="Labels">
        <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[16px]">Default</p>
        </div>
      </div>
      <div className="bg-[#dedaec] content-stretch flex items-start px-[16px] py-[4px] relative rounded-[4px] shrink-0" data-name="Labels">
        <div aria-hidden="true" className="absolute border border-[#5236ab] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[16px]">Info</p>
        </div>
      </div>
      <div className="bg-[#d6eee4] content-stretch flex items-start px-[16px] py-[4px] relative rounded-[4px] shrink-0" data-name="Labels">
        <div aria-hidden="true" className="absolute border border-[#18a86c] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[16px]">Success</p>
        </div>
      </div>
      <div className="bg-[#f8ecd8] content-stretch flex items-start px-[16px] py-[4px] relative rounded-[4px] shrink-0" data-name="Labels">
        <div aria-hidden="true" className="absolute border border-[#ab741a] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[16px]">Warning</p>
        </div>
      </div>
      <div className="bg-[#ecd2d7] content-stretch flex items-start px-[16px] py-[4px] relative rounded-[4px] shrink-0" data-name="Labels">
        <div aria-hidden="true" className="absolute border border-[#b00020] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="[word-break:break-word] flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[16px]">Error</p>
        </div>
      </div>
    </div>
  );
}

function SubtleLabels() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Subtle labels">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#333] text-[24px] w-[min-content]">Subtle labels</p>
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] min-w-full not-italic relative shrink-0 text-[#333] text-[16px] w-[min-content]">Use subtle labels if they are going to be repeated in a grid or list.</p>
      <SubtleLabelsSample />
    </div>
  );
}

function LabelTypes() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Label types">
      <StandardLabels />
      <SubtleLabels />
    </div>
  );
}

export default function Labels() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative size-full" data-name="Labels">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[28px] w-full">Labels</p>
      <LabelTypes />
    </div>
  );
}
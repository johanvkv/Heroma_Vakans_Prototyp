function Info() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Info">
      <div className="bg-[#5236ab] content-stretch flex flex-col items-center justify-center px-[8px] relative rounded-[100px] shrink-0 w-[24px]" data-name="Badges/Digit badge">
        <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">8</p>
      </div>
    </div>
  );
}

function Error() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Error">
      <div className="bg-[#b00020] content-stretch flex flex-col items-center justify-center px-[8px] relative rounded-[100px] shrink-0 w-[24px]" data-name="Badges/Digit badge">
        <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">8</p>
      </div>
    </div>
  );
}

function Badges() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0" data-name="Badges">
      <Info />
      <div className="bg-[#5236ab] content-stretch flex flex-col items-center justify-center px-[8px] relative rounded-[100px] shrink-0" data-name="Badges/Digit badge">
        <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">246</p>
      </div>
      <Error />
      <div className="bg-[#b00020] content-stretch flex flex-col items-center justify-center px-[8px] relative rounded-[100px] shrink-0" data-name="Badges/Digit badge">
        <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">246</p>
      </div>
    </div>
  );
}

export default function RegularBadges() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative size-full" data-name="Regular badges">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#333] text-[20px] w-[min-content]">Regular</p>
      <Badges />
    </div>
  );
}
function Info() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[31px]" data-name="Info">
      <div className="bg-[#5236ab] content-stretch flex flex-col items-center justify-center px-[6px] relative rounded-[100px] shrink-0 w-[18px]" data-name="Badges/Digit badge">
        <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[18px] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">8</p>
      </div>
    </div>
  );
}

function Error() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[31px]" data-name="Error">
      <div className="bg-[#b00020] content-stretch flex flex-col items-center justify-center px-[6px] relative rounded-[100px] shrink-0 w-[18px]" data-name="Badges/Digit badge">
        <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[18px] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">8</p>
      </div>
    </div>
  );
}

function Badges() {
  return (
    <div className="content-stretch flex gap-[32px] items-end relative shrink-0 w-full" data-name="Badges">
      <Info />
      <div className="bg-[#5236ab] content-stretch flex flex-col items-center justify-center px-[6px] relative rounded-[100px] shrink-0" data-name="Badges/Digit badge">
        <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[18px] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">246</p>
      </div>
      <Error />
      <div className="bg-[#b00020] content-stretch flex flex-col items-center justify-center px-[6px] relative rounded-[100px] shrink-0" data-name="Badges/Digit badge">
        <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[18px] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">246</p>
      </div>
    </div>
  );
}

export default function SmallBadges() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative size-full" data-name="Small badges">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Small</p>
      <Badges />
    </div>
  );
}
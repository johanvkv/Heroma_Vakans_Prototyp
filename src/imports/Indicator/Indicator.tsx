function Purple() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Purple">
      <div className="bg-[#5236ab] relative rounded-[100px] shrink-0 size-[8px]" data-name="Badges/Indicator badge" />
    </div>
  );
}

function Green() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Green">
      <div className="bg-[#18a86c] relative rounded-[100px] shrink-0 size-[8px]" data-name="Badges/Indicator badge" />
    </div>
  );
}

function Yellow() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Yellow">
      <div className="bg-[#ab741a] relative rounded-[100px] shrink-0 size-[8px]" data-name="Badges/Indicator badge" />
    </div>
  );
}

function Red() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Red">
      <div className="bg-[#b00020] relative rounded-[100px] shrink-0 size-[8px]" data-name="Badges/Indicator badge" />
    </div>
  );
}

function Badges() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full" data-name="Badges">
      <Purple />
      <Green />
      <Yellow />
      <Red />
    </div>
  );
}

export default function Indicator() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative size-full" data-name="Indicator">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[24px] w-full">Indicator badges</p>
      <Badges />
    </div>
  );
}
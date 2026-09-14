import svgPaths from "./svg-3uu6upg88y";

function TitleAndDescription() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col font-['Source_Sans_Pro:Regular',sans-serif] gap-[16px] items-start not-italic relative shrink-0 text-[#333] w-full" data-name="Title and description">
      <p className="leading-[normal] relative shrink-0 text-[28px] w-full">Badges</p>
      <p className="leading-[20px] relative shrink-0 text-[16px] w-full">Badges can be used to indicate a numerical characteristic that appears in proximity to another object, e.g., the number of unread items in a folder. They can also be used to represent status or notifications.</p>
    </div>
  );
}

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

function Badges1() {
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

function RegularBadges() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0" data-name="Regular badges">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#333] text-[20px] w-[min-content]">Regular</p>
      <Badges1 />
    </div>
  );
}

function Info1() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[31px]" data-name="Info">
      <div className="bg-[#5236ab] content-stretch flex flex-col items-center justify-center px-[6px] relative rounded-[100px] shrink-0 w-[18px]" data-name="Badges/Digit badge">
        <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[18px] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">8</p>
      </div>
    </div>
  );
}

function Error1() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[31px]" data-name="Error">
      <div className="bg-[#b00020] content-stretch flex flex-col items-center justify-center px-[6px] relative rounded-[100px] shrink-0 w-[18px]" data-name="Badges/Digit badge">
        <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[18px] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">8</p>
      </div>
    </div>
  );
}

function Badges2() {
  return (
    <div className="content-stretch flex gap-[32px] items-end relative shrink-0 w-full" data-name="Badges">
      <Info1 />
      <div className="bg-[#5236ab] content-stretch flex flex-col items-center justify-center px-[6px] relative rounded-[100px] shrink-0" data-name="Badges/Digit badge">
        <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[18px] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">246</p>
      </div>
      <Error1 />
      <div className="bg-[#b00020] content-stretch flex flex-col items-center justify-center px-[6px] relative rounded-[100px] shrink-0" data-name="Badges/Digit badge">
        <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[18px] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">246</p>
      </div>
    </div>
  );
}

function SmallBadges() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[220px]" data-name="Small badges">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[20px] w-full">Small</p>
      <Badges2 />
    </div>
  );
}

function BadgeSizes() {
  return (
    <div className="content-stretch flex gap-[160px] items-start relative shrink-0 w-full" data-name="Badge sizes">
      <RegularBadges />
      <SmallBadges />
    </div>
  );
}

function Digit() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip relative shrink-0 w-full" data-name="Digit">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[24px] w-full">Digit badges</p>
      <BadgeSizes />
    </div>
  );
}

function Info3() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="info">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="info">
          <mask height="20" id="mask0_102_304" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
          </mask>
          <g mask="url(#mask0_102_304)">
            <path d={svgPaths.p35de2c00} fill="var(--fill-0, white)" id="info_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Info2() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Info">
      <div className="bg-[#5236ab] content-stretch flex items-center p-[2px] relative rounded-[100px] shrink-0" data-name="Badges/Icon badge">
        <Info3 />
      </div>
    </div>
  );
}

function CheckCircle() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="check_circle">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="check_circle">
          <mask height="20" id="mask0_102_292" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
          </mask>
          <g mask="url(#mask0_102_292)">
            <path d={svgPaths.p1e78180} fill="var(--fill-0, white)" id="check_circle_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Success() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Success">
      <div className="bg-[#18a86c] content-stretch flex items-center p-[2px] relative rounded-[100px] shrink-0" data-name="Badges/Icon badge">
        <CheckCircle />
      </div>
    </div>
  );
}

function Error2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="error">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="error">
          <mask height="20" id="mask0_102_276" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
          </mask>
          <g mask="url(#mask0_102_276)">
            <path d={svgPaths.p28251a00} fill="var(--fill-0, white)" id="error_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Warning() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Warning">
      <div className="bg-[#ab741a] content-stretch flex items-center p-[2px] relative rounded-[100px] shrink-0" data-name="Badges/Icon badge">
        <Error2 />
      </div>
    </div>
  );
}

function Cancel() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="cancel">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="cancel">
          <mask height="20" id="mask0_102_280" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
          </mask>
          <g mask="url(#mask0_102_280)">
            <path d={svgPaths.peb4e280} fill="var(--fill-0, white)" id="cancel_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Error3() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Error">
      <div className="bg-[#b00020] content-stretch flex items-center p-[2px] relative rounded-[100px] shrink-0" data-name="Badges/Icon badge">
        <Cancel />
      </div>
    </div>
  );
}

function Badges3() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full" data-name="Badges">
      <Info2 />
      <Success />
      <Warning />
      <Error3 />
    </div>
  );
}

function DefaultBadges() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[260px]" data-name="Default badges">
      <Badges3 />
    </div>
  );
}

function BadgeSizes1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Badge sizes">
      <DefaultBadges />
    </div>
  );
}

function Icon() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Icon">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[24px] w-full">Icon badges</p>
      <BadgeSizes1 />
    </div>
  );
}

function Close() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="close">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="close">
          <mask height="12" id="mask0_102_284" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="12" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="12" id="Bounding box" width="12" />
          </mask>
          <g mask="url(#mask0_102_284)">
            <path d={svgPaths.p14d5b300} fill="var(--fill-0, white)" id="close_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Offline() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Offline">
      <div className="bg-[#767676] relative rounded-[100px] shrink-0" data-name="Badges/Status badge">
        <div className="content-stretch flex items-center justify-center overflow-clip p-[2px] relative rounded-[inherit] size-full">
          <Close />
        </div>
        <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[100px]" />
      </div>
    </div>
  );
}

function Check() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="check">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="check">
          <mask height="12" id="mask0_102_288" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="12" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="12" id="Bounding box" width="12" />
          </mask>
          <g mask="url(#mask0_102_288)">
            <path d={svgPaths.pf408300} fill="var(--fill-0, white)" id="check_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Available() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Available">
      <div className="bg-[#18a86c] relative rounded-[100px] shrink-0" data-name="Badges/Status badge">
        <div className="content-stretch flex items-center justify-center overflow-clip p-[2px] relative rounded-[inherit] size-full">
          <Check />
        </div>
        <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[100px]" />
      </div>
    </div>
  );
}

function Schedule() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="schedule">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="schedule">
          <mask height="12" id="mask0_102_296" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="12" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="12" id="Bounding box" width="12" />
          </mask>
          <g mask="url(#mask0_102_296)">
            <path d={svgPaths.p1f0a1b80} fill="var(--fill-0, white)" id="schedule_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Away() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Away">
      <div className="bg-[#ab741a] relative rounded-[100px] shrink-0" data-name="Badges/Status badge">
        <div className="content-stretch flex items-center justify-center overflow-clip p-[2px] relative rounded-[inherit] size-full">
          <Schedule />
        </div>
        <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[100px]" />
      </div>
    </div>
  );
}

function Remove() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="remove">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="remove">
          <mask height="12" id="mask0_102_300" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="12" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="12" id="Bounding box" width="12" />
          </mask>
          <g mask="url(#mask0_102_300)">
            <path d={svgPaths.p6907ef0} fill="var(--fill-0, white)" id="remove_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Busy() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Busy">
      <div className="bg-[#b00020] relative rounded-[100px] shrink-0" data-name="Badges/Status badge">
        <div className="content-stretch flex items-center justify-center overflow-clip p-[2px] relative rounded-[inherit] size-full">
          <Remove />
        </div>
        <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[100px]" />
      </div>
    </div>
  );
}

function Badges4() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full" data-name="Badges">
      <Offline />
      <Available />
      <Away />
      <Busy />
    </div>
  );
}

function Status() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Status">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[24px] w-full">Status badges</p>
      <Badges4 />
    </div>
  );
}

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

function Badges5() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full" data-name="Badges">
      <Purple />
      <Green />
      <Yellow />
      <Red />
    </div>
  );
}

function Indicator() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Indicator">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[24px] w-full">Indicator badges</p>
      <Badges5 />
    </div>
  );
}

function BadgeTypes() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Badge types">
      <Digit />
      <Icon />
      <Status />
      <Indicator />
    </div>
  );
}

function BadgeSamples() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Badge samples">
      <BadgeTypes />
    </div>
  );
}

export default function Badges() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative size-full" data-name="Badges">
      <TitleAndDescription />
      <BadgeSamples />
    </div>
  );
}
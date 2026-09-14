import svgPaths from "./svg-0c714e7tee";

function Info1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="info">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="info">
          <mask height="20" id="mask0_111_7603" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
          </mask>
          <g mask="url(#mask0_111_7603)">
            <path d={svgPaths.p35de2c00} fill="var(--fill-0, white)" id="info_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Info() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Info">
      <div className="bg-[#5236ab] content-stretch flex items-center p-[2px] relative rounded-[100px] shrink-0" data-name="Badges/Icon badge">
        <Info1 />
      </div>
    </div>
  );
}

function CheckCircle() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="check_circle">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="check_circle">
          <mask height="20" id="mask0_111_7591" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
          </mask>
          <g mask="url(#mask0_111_7591)">
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

function Error() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="error">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="error">
          <mask height="20" id="mask0_111_7599" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
          </mask>
          <g mask="url(#mask0_111_7599)">
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
        <Error />
      </div>
    </div>
  );
}

function Cancel() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="cancel">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="cancel">
          <mask height="20" id="mask0_111_7595" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
          </mask>
          <g mask="url(#mask0_111_7595)">
            <path d={svgPaths.peb4e280} fill="var(--fill-0, white)" id="cancel_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Error1() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[41px]" data-name="Error">
      <div className="bg-[#b00020] content-stretch flex items-center p-[2px] relative rounded-[100px] shrink-0" data-name="Badges/Icon badge">
        <Cancel />
      </div>
    </div>
  );
}

function Badges() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full" data-name="Badges">
      <Info />
      <Success />
      <Warning />
      <Error1 />
    </div>
  );
}

function DefaultBadges() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[260px]" data-name="Default badges">
      <Badges />
    </div>
  );
}

function BadgeSizes() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Badge sizes">
      <DefaultBadges />
    </div>
  );
}

export default function Icon() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative size-full" data-name="Icon">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[24px] w-full">Icon badges</p>
      <BadgeSizes />
    </div>
  );
}
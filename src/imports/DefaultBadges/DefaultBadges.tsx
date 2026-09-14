import svgPaths from "./svg-5jrj20pp1r";

function Info1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="info">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="info">
          <mask height="20" id="mask0_2_673" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
          </mask>
          <g mask="url(#mask0_2_673)">
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
          <mask height="20" id="mask0_2_665" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
          </mask>
          <g mask="url(#mask0_2_665)">
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
          <mask height="20" id="mask0_2_677" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
          </mask>
          <g mask="url(#mask0_2_677)">
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
          <mask height="20" id="mask0_2_669" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
          </mask>
          <g mask="url(#mask0_2_669)">
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

export default function DefaultBadges() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="Default badges">
      <Badges />
    </div>
  );
}
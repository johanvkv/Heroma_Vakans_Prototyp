import svgPaths from "./svg-o40n1dwocy";

function Close() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="close">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="close">
          <mask height="12" id="mask0_111_7607" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="12" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="12" id="Bounding box" width="12" />
          </mask>
          <g mask="url(#mask0_111_7607)">
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
          <mask height="12" id="mask0_111_7619" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="12" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="12" id="Bounding box" width="12" />
          </mask>
          <g mask="url(#mask0_111_7619)">
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
          <mask height="12" id="mask0_111_7611" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="12" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="12" id="Bounding box" width="12" />
          </mask>
          <g mask="url(#mask0_111_7611)">
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
          <mask height="12" id="mask0_111_7615" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="12" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="12" id="Bounding box" width="12" />
          </mask>
          <g mask="url(#mask0_111_7615)">
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

function Badges() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full" data-name="Badges">
      <Offline />
      <Available />
      <Away />
      <Busy />
    </div>
  );
}

export default function Status() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative size-full" data-name="Status">
      <p className="[word-break:break-word] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[24px] w-full">Status badges</p>
      <Badges />
    </div>
  );
}
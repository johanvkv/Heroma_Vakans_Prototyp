import svgPaths from "./svg-y39uhxpn6b";

export default function BadgesIconBadge() {
  return (
    <div className="bg-[#18a86c] content-stretch flex items-center p-[2px] relative rounded-[100px] size-full" data-name="Badges/Icon badge">
      <div className="relative shrink-0 size-[20px]" data-name="check_circle">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          <g id="check_circle">
            <mask height="20" id="mask0_6_240" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
              <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
            </mask>
            <g mask="url(#mask0_6_240)">
              <path d={svgPaths.p1e78180} fill="var(--fill-0, white)" id="check_circle_2" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
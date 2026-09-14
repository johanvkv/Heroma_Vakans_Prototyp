import svgPaths from "./svg-s324flpxt9";

export default function BadgesIconBadge() {
  return (
    <div className="bg-[#ab741a] content-stretch flex items-center p-[2px] relative rounded-[100px] size-full" data-name="Badges/Icon badge">
      <div className="relative shrink-0 size-[20px]" data-name="error">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          <g id="error">
            <mask height="20" id="mask0_6_236" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
              <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
            </mask>
            <g mask="url(#mask0_6_236)">
              <path d={svgPaths.p28251a00} fill="var(--fill-0, white)" id="error_2" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
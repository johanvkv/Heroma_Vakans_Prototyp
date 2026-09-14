import svgPaths from "./svg-83wpyb6uao";

function Donut() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Donut">
      <div className="col-1 ml-0 mt-0 relative row-1 size-[159px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 159 159">
          <path d={svgPaths.p340e4680} fill="var(--fill-0, #EFEFEF)" id="Ellipse 31" />
        </svg>
      </div>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[159px]">
        <div className="absolute bottom-0 left-0 right-1/2 top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 79.5 159">
            <path d={svgPaths.p37ebb500} fill="var(--fill-0, #5236AB)" id="Ellipse 30" />
          </svg>
        </div>
      </div>
      <div className="[word-break:break-word] col-1 flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center ml-[44.01px] mt-[54.58px] not-italic relative row-1 text-[#333] text-[38px] text-center whitespace-nowrap">
        <p className="leading-[normal]">50%</p>
      </div>
    </div>
  );
}

function Gauge() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px relative w-full z-[1]" data-name="Gauge">
      <Donut />
    </div>
  );
}

export default function DataVisualizationProgressCharts() {
  return (
    <div className="bg-white content-stretch flex flex-col isolate items-center justify-center p-[24px] relative rounded-[4px] size-full" data-name="Data visualization/Progress charts">
      <div aria-hidden className="absolute border border-[#efefef] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Gauge />
    </div>
  );
}
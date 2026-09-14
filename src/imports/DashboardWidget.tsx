import svgPaths from "./svg-rpk9tw5ytm";

function Title() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative" data-name="Title">
      <p className="flex-[1_0_0] font-['Source_Sans_Pro:SemiBold',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#333] text-[24px]">Q1 Regional electronic</p>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Square/Regular/Icons/Colour/Dark purple">
        <div className="absolute flex inset-[16.67%_41.67%] items-center justify-center">
          <div className="flex-none h-[4px] rotate-90 w-[16px]">
            <div className="relative size-full" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 4">
                <path d={svgPaths.pc200ac0} fill="var(--fill-0, #200A58)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentDropdown() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content />
    </div>
  );
}

function TitleLink() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-name="Title link">
      <div className="content-stretch flex items-center justify-center overflow-clip p-[12px] relative rounded-[4px] shrink-0" data-name="Buttons/Square/Regular">
        <ContentDropdown />
      </div>
    </div>
  );
}

function TitleBar() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-between min-h-px min-w-px relative" data-name="Title bar">
      <Title />
      <TitleLink />
    </div>
  );
}

function CardsCardTitle() {
  return (
    <div className="relative shrink-0 w-full" data-name=".Cards/Card title">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[16px] relative w-full">
          <TitleBar />
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#efefef] border-b border-solid inset-0 pointer-events-none" />
      <CardsCardTitle />
    </div>
  );
}

function Category() {
  return (
    <div className="content-stretch flex flex-col h-full items-end justify-center relative shrink-0 w-[20px]" data-name="Category">
      <div className="flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative w-full" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none size-full">
          <div className="flex flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[0] not-italic relative size-full text-[#333] text-[16px] text-center">
            <p className="leading-[20px]">Electronics category</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Labels() {
  return (
    <div className="content-stretch flex flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full items-end justify-between leading-[0] not-italic relative shrink-0 text-[#333] text-[14px] text-right w-[129px]" data-name="Labels">
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="leading-[20px]">Mobile phones</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="leading-[20px]">{`Laptops & Tablets`}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="leading-[20px]">Wearable devices</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="leading-[20px]">Home appliances</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="leading-[17px]">{`Audio & Headphones`}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="leading-[20px]">Computer accessories</p>
      </div>
    </div>
  );
}

function YAxis() {
  return (
    <div className="content-stretch flex gap-[8px] h-[323px] items-center pb-[68px] pt-[48px] relative shrink-0" data-name="Y-axis">
      <Category />
      <Labels />
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[20px] items-center justify-center min-h-px min-w-px relative" data-name="Content">
      <div className="flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#333] text-[12px] text-center">
        <p className="leading-[14px]">2</p>
      </div>
    </div>
  );
}

function Content2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[20px] items-center justify-center min-h-px min-w-px relative" data-name="Content">
      <div className="flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#333] text-[12px] text-center">
        <p className="leading-[14px]">2</p>
      </div>
    </div>
  );
}

function Content3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[20px] items-center justify-center min-h-px min-w-px relative" data-name="Content">
      <div className="flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#333] text-[12px] text-center">
        <p className="leading-[14px]">14</p>
      </div>
    </div>
  );
}

function Content4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[20px] items-center justify-center min-h-px min-w-px relative" data-name="Content">
      <div className="flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[12px] text-center text-white">
        <p className="leading-[14px]">2</p>
      </div>
    </div>
  );
}

function Content5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[20px] items-center justify-center min-h-px min-w-px relative" data-name="Content">
      <div className="flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[12px] text-center text-white">
        <p className="leading-[14px]">4</p>
      </div>
    </div>
  );
}

function Row() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-px items-center min-h-px min-w-px relative w-full" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#efefef] border-b border-solid border-t inset-[-1px_0] pointer-events-none" />
      <div className="bg-[#3a2679] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
              <p className="leading-[14px]">$4,400</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#3a2679] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
              <p className="leading-[14px]">$4,620</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#afa3d8] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,500</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#afa3d8] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,804</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-px items-center min-h-px min-w-px relative w-full" data-name="Row 2">
      <div aria-hidden="true" className="absolute border-[#efefef] border-b border-solid border-t inset-[-1px_0] pointer-events-none" />
      <div className="bg-[#afa3d8] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,100</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#afa3d8] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,350</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#afa3d8] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,380</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#cbc3e6] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$1,204</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-px items-center min-h-px min-w-px relative w-full" data-name="Row 3">
      <div aria-hidden="true" className="absolute border-[#efefef] border-b border-solid border-t inset-[-1px_0] pointer-events-none" />
      <div className="bg-[#afa3d8] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,030</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#755ebc] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
              <p className="leading-[14px]">$3,102</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#f2f1f9] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,420</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#755ebc] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
              <p className="leading-[14px]">$3,820</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-px items-center min-h-px min-w-px relative w-full" data-name="Row 4">
      <div aria-hidden="true" className="absolute border-[#efefef] border-b border-solid border-t inset-[-1px_0] pointer-events-none" />
      <div className="bg-[#afa3d8] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,500</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#afa3d8] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,920</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#3a2679] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
              <p className="leading-[14px]">$4,912</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#afa3d8] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,210</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-px items-center min-h-px min-w-px relative w-full" data-name="Row 5">
      <div aria-hidden="true" className="absolute border-[#efefef] border-b border-solid border-t inset-[-1px_0] pointer-events-none" />
      <div className="bg-[#f2f1f9] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,730</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#cbc3e6] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$1,960</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#afa3d8] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,790</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#3a2679] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
              <p className="leading-[14px]">$4,231</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-px items-center min-h-px min-w-px relative w-full" data-name="Row 6">
      <div aria-hidden="true" className="absolute border-[#efefef] border-b border-solid border-t inset-[-1px_0] pointer-events-none" />
      <div className="bg-[#afa3d8] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,420</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#afa3d8] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,212</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#afa3d8] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,030</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#afa3d8] flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Heat map/Data cell/Purple">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
            <div className="flex flex-col font-['Source_Sans_Pro:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#200a58] text-[12px] whitespace-nowrap">
              <p className="leading-[14px]">$2,520</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeatMap() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-px items-start justify-center min-h-px min-w-px relative w-full" data-name="Heat map">
      <Row />
      <Row1 />
      <Row2 />
      <Row3 />
      <Row4 />
      <Row5 />
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-h-px min-w-px relative" data-name="Text">
      <p className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-full">Central</p>
    </div>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-h-px min-w-px relative" data-name="Text">
      <p className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-full">East</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-h-px min-w-px relative" data-name="Text">
      <p className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-full">South</p>
    </div>
  );
}

function Text3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-h-px min-w-px relative" data-name="Text">
      <p className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[14px] text-center w-full">West</p>
    </div>
  );
}

function Labels1() {
  return (
    <div className="content-stretch flex gap-px h-[20px] items-center relative shrink-0 w-full" data-name="Labels">
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <Text />
      </div>
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <Text1 />
      </div>
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <Text2 />
      </div>
      <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
        <Text3 />
      </div>
    </div>
  );
}

function XAxis() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="X-axis">
      <Labels1 />
      <div className="flex flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[16px] text-center w-full">
        <p className="leading-[20px]">Region</p>
      </div>
    </div>
  );
}

function HeatMapXAxis() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative w-full" data-name="Heat map + X-axis">
      <HeatMap />
      <XAxis />
    </div>
  );
}

function HeatMapFilter() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] h-[323px] items-start min-h-px min-w-px relative" data-name="Heat map + Filter">
      <div className="content-stretch flex items-start pr-px relative shrink-0 w-full" data-name="Heat map/Filter">
        <div className="bg-[#f2f1f9] flex-[1_0_0] min-h-px min-w-px mr-[-1px] relative rounded-bl-[4px] rounded-tl-[4px]" data-name=".Heat map/Filter/Elements/Purple/Level 1">
          <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex items-center justify-center px-[8px] py-[4px] relative w-full">
              <Content1 />
            </div>
          </div>
          <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none rounded-bl-[4px] rounded-tl-[4px]" />
        </div>
        <div className="bg-[#cbc3e6] flex-[1_0_0] min-h-px min-w-px mr-[-1px] relative" data-name=".Heat map/Filter/Elements/Purple/Level 2">
          <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex items-center justify-center px-[8px] py-[4px] relative w-full">
              <Content2 />
            </div>
          </div>
          <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none" />
        </div>
        <div className="bg-[#afa3d8] flex-[1_0_0] min-h-px min-w-px mr-[-1px] relative" data-name=".Heat map/Filter/Elements/Purple/Level 3">
          <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex items-center justify-center px-[8px] py-[4px] relative w-full">
              <Content3 />
            </div>
          </div>
          <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none" />
        </div>
        <div className="bg-[#755ebc] flex-[1_0_0] min-h-px min-w-px mr-[-1px] relative" data-name=".Heat map/Filter/Elements/Purple/Level 4">
          <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex items-center justify-center px-[8px] py-[4px] relative w-full">
              <Content4 />
            </div>
          </div>
          <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none" />
        </div>
        <div className="bg-[#3a2679] flex-[1_0_0] min-h-px min-w-px mr-[-1px] relative rounded-br-[4px] rounded-tr-[4px]" data-name=".Heat map/Filter/Elements/Purple/Level 5">
          <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex items-center justify-center px-[8px] py-[4px] relative w-full">
              <Content5 />
            </div>
          </div>
          <div aria-hidden="true" className="absolute border border-[#333] border-solid inset-0 pointer-events-none rounded-br-[4px] rounded-tr-[4px]" />
        </div>
      </div>
      <HeatMapXAxis />
    </div>
  );
}

function Chart() {
  return (
    <div className="relative shrink-0 w-full z-[2]" data-name="Chart">
      <div className="content-stretch flex gap-[8px] items-start p-[24px] relative w-full">
        <YAxis />
        <HeatMapFilter />
      </div>
    </div>
  );
}

function LegendItem() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Legend item 1">
      <div className="relative shrink-0 size-[12px]" data-name="Oval">
        <div className="absolute inset-[-4.17%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
            <circle cx="6.5" cy="6.5" fill="var(--fill-0, #F2F1F9)" id="Oval" r="6" stroke="var(--stroke-0, #A8A8A8)" />
          </svg>
        </div>
      </div>
      <p className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[14px] text-center whitespace-nowrap">$0 - $1K</p>
    </div>
  );
}

function LegendItem1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Legend item 2">
      <div className="relative shrink-0 size-[12px]" data-name="Oval">
        <div className="absolute inset-[-4.17%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
            <circle cx="6.5" cy="6.5" fill="var(--fill-0, #CBC3E6)" id="Oval" r="6" stroke="var(--stroke-0, #A8A8A8)" />
          </svg>
        </div>
      </div>
      <p className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[14px] text-center whitespace-nowrap">$1K - $2K</p>
    </div>
  );
}

function LegendItem2() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Legend item 3">
      <div className="relative shrink-0 size-[12px]" data-name="Oval">
        <div className="absolute inset-[-4.17%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
            <circle cx="6.5" cy="6.5" fill="var(--fill-0, #AFA3D8)" id="Oval" r="6" stroke="var(--stroke-0, #A8A8A8)" />
          </svg>
        </div>
      </div>
      <p className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[14px] text-center whitespace-nowrap">$2K - $3K</p>
    </div>
  );
}

function LegendItem3() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Legend item 4">
      <div className="relative shrink-0 size-[12px]" data-name="Oval">
        <div className="absolute inset-[-4.17%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
            <circle cx="6.5" cy="6.5" fill="var(--fill-0, #755EBC)" id="Oval" r="6" stroke="var(--stroke-0, #A8A8A8)" />
          </svg>
        </div>
      </div>
      <p className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[14px] text-center whitespace-nowrap">$3K - $4K</p>
    </div>
  );
}

function LegendItem4() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Legend item 5">
      <div className="relative shrink-0 size-[12px]" data-name="Oval">
        <div className="absolute inset-[-4.17%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
            <circle cx="6.5" cy="6.5" fill="var(--fill-0, #3A2679)" id="Oval" r="6" stroke="var(--stroke-0, #A8A8A8)" />
          </svg>
        </div>
      </div>
      <p className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#333] text-[14px] text-center whitespace-nowrap">$4K - $5K</p>
    </div>
  );
}

function Legend() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center pb-[24px] relative shrink-0 w-full z-[1]" data-name="Legend">
      <LegendItem />
      <LegendItem1 />
      <LegendItem2 />
      <LegendItem3 />
      <LegendItem4 />
    </div>
  );
}

export default function DashboardWidget() {
  return (
    <div className="bg-white relative rounded-[4px] size-full" data-name="Dashboard widget">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <div className="bg-[#efefef] h-[5px] shrink-0 w-full" data-name="Top border" />
        <Header />
        <div className="bg-white content-stretch flex flex-col isolate items-end relative rounded-[4px] shrink-0 w-full" data-name="Heat map">
          <Chart />
          <Legend />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#efefef] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}
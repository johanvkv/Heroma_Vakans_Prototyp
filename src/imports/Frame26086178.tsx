import svgPaths from "./svg-anm145l9nr";
import imgHttpsLottiefilesCom63521LoadingDots from "figma:asset/834ccf5d2c1595f7026d4cfc547a25c4651220b6.png";

function Layer() {
  return (
    <div className="absolute inset-[17.71%_17.71%_19.3%_11.25%]" data-name="Layer_1">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 19.5059">
        <g clipPath="url(#clip0_182_11815)" id="Layer_1">
          <path d={svgPaths.pf3a1b80} fill="var(--fill-0, #5236AB)" id="Vector" />
          <path d={svgPaths.p2dd32600} fill="var(--fill-0, #5236AB)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_182_11815">
            <rect fill="white" height="19.5059" width="22" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Circle() {
  return (
    <div className="absolute inset-[1.61%]" data-name="Circle">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Ellipse 14" />
      </svg>
      <Layer />
    </div>
  );
}

function Avatar() {
  return (
    <div className="absolute inset-[0_2.08%_0_-2.08%]" data-name="Avatar">
      <Circle />
    </div>
  );
}

function Message1() {
  return (
    <div className="bg-[#f2f1f9] relative rounded-bl-[10px] rounded-br-[10px] rounded-tl-[2px] rounded-tr-[10px] shrink-0 w-full" data-name="Message1">
      <div className="content-stretch flex items-start px-[16px] py-[12px] relative w-full">
        <div className="flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[20px] min-h-px min-w-px not-italic relative text-[#333] text-[14px] whitespace-pre-wrap">
          <p className="mb-0">{`Hi Dean! Welcome to the CGI Virtual Agent. `}</p>
          <p className="mb-0">&nbsp;</p>
          <p className="mb-0">I’m here to make things easier for you, whether you need help with account information, a guided tour through our services, or support on specific topics.</p>
          <p className="mb-0">&nbsp;</p>
          <p>What can I assist you with today? If you’re not sure where to begin, you’re welcome to start like ‘Account Support,’ ‘Service Assistance,’ or ‘General Inquiries.’</p>
        </div>
      </div>
    </div>
  );
}

function SystemTimestamp() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[16px] items-center min-h-px min-w-px relative" data-name="System timestamp">
      <div className="flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#333] text-[12px]">
        <p className="leading-[normal]">2:45 PM</p>
      </div>
    </div>
  );
}

function ContentCopy() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="content_copy">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="content_copy">
          <mask height="16" id="mask0_182_40271" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="16" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="16" id="Bounding box" width="16" />
          </mask>
          <g mask="url(#mask0_182_40271)">
            <path d={svgPaths.p1b777000} fill="var(--fill-0, #151515)" id="content_copy_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ThumbUp() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="thumb_up">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="thumb_up">
          <mask height="16" id="mask0_182_38239" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="16" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="16" id="Bounding box" width="16" />
          </mask>
          <g mask="url(#mask0_182_38239)">
            <path d={svgPaths.p16946780} fill="var(--fill-0, #151515)" id="thumb_up_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ThumbDown() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="thumb_down">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="thumb_down">
          <mask height="16" id="mask0_182_44334" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="16" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="16" id="Bounding box" width="16" />
          </mask>
          <g mask="url(#mask0_182_44334)">
            <path d={svgPaths.p2ba03430} fill="var(--fill-0, #151515)" id="thumb_down_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function QuickResponses() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Quick responses">
      <ContentCopy />
      <ThumbUp />
      <ThumbDown />
    </div>
  );
}

function TimestampAndResponse() {
  return (
    <div className="content-stretch flex gap-[8px] items-end relative shrink-0 w-full" data-name="Timestamp and response">
      <SystemTimestamp />
      <div className="content-stretch flex items-start relative shrink-0" data-name=".Chatbot elements/Content/Response">
        <QuickResponses />
      </div>
    </div>
  );
}

function MessageTimestamp() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center min-h-px min-w-px relative self-stretch" data-name="Message & Timestamp">
      <Message1 />
      <TimestampAndResponse />
    </div>
  );
}

function SystemMessage() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="System message">
      <div className="relative shrink-0 size-[32px]" data-name=".Chatbot elements/Header/Small/Avatar/Purple">
        <Avatar />
      </div>
      <MessageTimestamp />
    </div>
  );
}

function Message() {
  return (
    <div className="bg-white content-stretch flex items-center justify-end px-[16px] py-[12px] relative rounded-bl-[10px] rounded-br-[2px] rounded-tl-[10px] rounded-tr-[10px] shrink-0" data-name="Message">
      <div aria-hidden="true" className="absolute border border-[#cbc3e6] border-solid inset-0 pointer-events-none rounded-bl-[10px] rounded-br-[2px] rounded-tl-[10px] rounded-tr-[10px]" />
      <p className="font-['Source_Sans_Pro:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#151515] text-[14px] whitespace-nowrap">Hello, I need help troubleshooting an issue.</p>
    </div>
  );
}

function UserMessage() {
  return (
    <div className="content-stretch flex gap-[8px] items-end justify-end relative shrink-0" data-name="User message">
      <Message />
    </div>
  );
}

function Timestamp() {
  return (
    <div className="content-stretch flex h-[15px] items-center justify-center relative shrink-0" data-name="Timestamp">
      <div className="flex flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[12px] w-[39px]">
        <p className="leading-[normal]">2:45 PM</p>
      </div>
    </div>
  );
}

function MessageStatus() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Message status">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Message status">
          <path d={svgPaths.pb71a580} fill="var(--fill-0, #5236AB)" id="delivered" />
        </g>
      </svg>
    </div>
  );
}

function UserTimestamp() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0 w-full" data-name="User timestamp">
      <Timestamp />
      <MessageStatus />
    </div>
  );
}

function Message2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-end relative shrink-0 w-full" data-name="Message 1">
      <UserMessage />
      <UserTimestamp />
    </div>
  );
}

function Layer1() {
  return (
    <div className="absolute inset-[17.71%_17.71%_19.3%_11.25%]" data-name="Layer_1">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 19.5059">
        <g clipPath="url(#clip0_182_11815)" id="Layer_1">
          <path d={svgPaths.pf3a1b80} fill="var(--fill-0, #5236AB)" id="Vector" />
          <path d={svgPaths.p2dd32600} fill="var(--fill-0, #5236AB)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_182_11815">
            <rect fill="white" height="19.5059" width="22" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Circle1() {
  return (
    <div className="absolute inset-[1.61%]" data-name="Circle">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Ellipse 14" />
      </svg>
      <Layer1 />
    </div>
  );
}

function Avatar1() {
  return (
    <div className="absolute inset-[0_2.08%_0_-2.08%]" data-name="Avatar">
      <Circle1 />
    </div>
  );
}

function Indicator() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Indicator">
      <div className="bg-[#f2f1f9] col-1 h-[35px] ml-0 mt-0 rounded-bl-[10px] rounded-br-[10px] rounded-tl-[2px] rounded-tr-[10px] row-1 w-[58px]" data-name="Indicator shape" />
      <div className="col-1 h-[15.25px] ml-[13px] mt-[9.5px] opacity-70 relative row-1 w-[29.851px]" data-name="https://lottiefiles.com/63521-loading-dots">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHttpsLottiefilesCom63521LoadingDots} />
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-name="Typing indicator">
      <div className="relative shrink-0 size-[32px]" data-name=".Chatbot elements/Header/Small/Avatar/Purple">
        <Avatar1 />
      </div>
      <Indicator />
    </div>
  );
}

function ChatArea() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Chat area">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start pb-[24px] pt-[88px] px-[12px] relative size-full">
          <div className="relative shrink-0 w-full" data-name="Chatbot/Content/System message">
            <div className="flex flex-col justify-end size-full">
              <div className="content-stretch flex flex-col gap-[8px] items-start justify-end pr-[32px] relative w-full">
                <SystemMessage />
              </div>
            </div>
          </div>
          <div className="relative shrink-0 w-full" data-name="Chatbot/Content/User message">
            <div className="flex flex-col items-end justify-end size-full">
              <div className="content-stretch flex flex-col gap-[4px] items-end justify-end pl-[32px] relative w-full">
                <Message2 />
              </div>
            </div>
          </div>
          <div className="relative shrink-0 w-full" data-name="Chatbot/Content/System message">
            <div className="flex flex-col justify-end size-full">
              <div className="content-stretch flex flex-col items-start justify-end pr-[32px] relative w-full">
                <TypingIndicator />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Layer2() {
  return (
    <div className="absolute inset-[17.71%_17.71%_19.3%_11.25%]" data-name="Layer_1">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33 29.2588">
        <g clipPath="url(#clip0_182_30110)" id="Layer_1">
          <path d={svgPaths.p2c14c800} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p34dfd540} fill="var(--fill-0, white)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_182_30110">
            <rect fill="white" height="29.2588" width="33" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function CheckSmall() {
  return (
    <div className="absolute inset-[29.03%_23.55%_30.97%_24.44%]" data-name="check_small">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.32187 6.4">
        <g id="check_small">
          <path d={svgPaths.p2959ea40} fill="var(--fill-0, white)" id="check_small_2" />
        </g>
      </svg>
    </div>
  );
}

function Circle2() {
  return (
    <div className="absolute inset-[1.61%]" data-name="Circle">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Ellipse 14" />
      </svg>
      <Layer2 />
      <div className="absolute inset-[58.61%_4.79%_6.94%_60.77%]" data-name=".Chatbot elements/Header/Regular/Status">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <circle cx="8" cy="8" fill="var(--fill-0, #1AB977)" id="Ellipse 2" r="7.5" stroke="var(--stroke-0, white)" />
        </svg>
        <CheckSmall />
      </div>
    </div>
  );
}

function Avatar2() {
  return (
    <div className="absolute inset-[0_2.08%_0_-2.08%]" data-name="Avatar">
      <Circle2 />
    </div>
  );
}

function AvatarStatusWithName() {
  return (
    <div className="flex-[1_0_0] h-[48px] min-h-px min-w-px relative" data-name="Avatar status with name">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[4px] items-center px-[4px] relative size-full">
          <div className="relative shrink-0 size-[48px]" data-name=".Chatbot elements/Header/Regular/Avatar/White">
            <Avatar2 />
          </div>
          <div className="flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] h-full justify-center leading-[0] min-h-px min-w-px not-italic relative text-[20px] text-white">
            <p className="leading-[normal]">Sam</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoreVert() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="more_vert">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="more_vert">
          <mask height="24" id="mask0_182_24015" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_182_24015)">
            <path d={svgPaths.p34810300} fill="var(--fill-0, white)" id="more_vert_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Remove() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="remove">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <mask height="24" id="mask0_182_21979" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_182_21979)">
            <path d="M5 13V11H19V13H5Z" fill="var(--fill-0, white)" id="remove_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Close() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="close">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <mask height="24" id="mask0_182_26047" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_182_26047)">
            <path d={svgPaths.p2edaeb50} fill="var(--fill-0, white)" id="close_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ControlPanel() {
  return (
    <div className="content-stretch flex items-start justify-end relative shrink-0" data-name="Control panel">
      <div className="content-stretch flex items-center p-[12px] relative shrink-0" data-name=".Chatbot elements/Header/Control panel/Purple">
        <MoreVert />
      </div>
      <div className="content-stretch flex items-center p-[12px] relative shrink-0" data-name=".Chatbot elements/Header/Control panel/Purple">
        <Remove />
      </div>
      <div className="content-stretch flex items-center p-[12px] relative shrink-0" data-name=".Chatbot elements/Header/Control panel/Purple">
        <Close />
      </div>
    </div>
  );
}

function ChatbotHeader() {
  return (
    <div className="absolute bg-gradient-to-r content-stretch flex from-[#5236ab] items-center justify-between left-0 overflow-clip p-[8px] right-0 to-[#c119e3] top-0" data-name="Chatbot header">
      <AvatarStatusWithName />
      <ControlPanel />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name=".Buttons elements/Rounded/Regular/Icons/Colour/Purple">
        <div className="absolute inset-[8.33%_12.5%_12.5%_8.33%]" data-name="add_circle">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
            <path d={svgPaths.p38483400} fill="var(--fill-0, #5236AB)" id="add_circle" />
          </svg>
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

function Content2() {
  return (
    <div className="content-stretch flex h-[16px] items-center justify-center relative shrink-0" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name=".Buttons elements/Rounded/Small/Icons/Colour/Gray">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <g id="send">
            <mask height="16" id="mask0_182_19947" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="16" x="0" y="0">
              <rect fill="var(--fill-0, #D9D9D9)" height="16" id="Bounding box" width="16" />
            </mask>
            <g mask="url(#mask0_182_19947)">
              <path d={svgPaths.p2557a670} fill="var(--fill-0, #A8A8A8)" id="send_2" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

function ContentDropdown1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Content + Dropdown">
      <Content2 />
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex gap-[16px] items-start justify-center relative shrink-0 w-full" data-name="Content">
      <div className="flex flex-[1_0_0] flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative self-stretch text-[#a8a8a8] text-[16px]">
        <p className="leading-[normal]">Type a message</p>
      </div>
      <div className="bg-[#efefef] content-stretch flex items-center justify-center overflow-clip p-[8px] relative rounded-[16px] shrink-0" data-name="Buttons/Rounded/Small">
        <ContentDropdown1 />
      </div>
    </div>
  );
}

function Textfield() {
  return (
    <div className="bg-white relative rounded-bl-[20px] rounded-br-[20px] shrink-0 w-full" data-name="textfield">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pb-[24px] px-[12px] relative w-full">
          <div className="content-stretch flex items-center justify-center overflow-clip p-[12px] relative rounded-[24px] shrink-0 size-[32px]" data-name="Buttons/Rounded/Regular">
            <ContentDropdown />
          </div>
          <div className="bg-white flex-[1_0_0] h-[48px] min-h-px min-w-px relative rounded-[24px]" data-name="Forms/Input field">
            <div aria-hidden="true" className="absolute border border-[#cbc3e6] border-solid inset-0 pointer-events-none rounded-[24px]" />
            <div className="flex flex-col justify-center size-full">
              <div className="content-stretch flex flex-col items-start justify-center p-[12px] relative size-full">
                <Content1 />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-white content-stretch flex flex-col h-[660px] items-start left-0 overflow-clip rounded-[20px] top-0 w-[400px]" data-name="Chatbot">
        <ChatArea />
        <ChatbotHeader />
        <div className="absolute bottom-0 content-stretch flex flex-col items-start justify-center left-0 pt-[24px] right-0 rounded-bl-[20px] rounded-br-[20px]" data-name="Chatbot/Input area">
          <Textfield />
        </div>
      </div>
    </div>
  );
}
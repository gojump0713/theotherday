/* 슬라이드 메타데이터 — 한 곳에서 관리
   id: 페이지 번호(해시·표시용), ch: 챕터 인덱스, bg: 배경 파일(assets/video|img), type: video|image|none
   stepBg: {스텝: 배경} 스텝마다 배경 영상 교차 전환, autoTo: 자동 진행을 멈출 스텝,
   steps: 스텝 수, auto: 지정 시 진입 후 해당 ms 간격으로 스텝 자동 진행(클릭·키 입력으로 즉시 건너뜀), title: 목차 썸네일 문구, chapterStart: 챕터 첫 장 여부 */
window.CHAPTERS = [
  '왜 틸론인가',
  '방향과 문제',
  'TheOther.Space 2.0',
  'TheOther.Town',
  'Kstory.ai',
  '다음 모습',
  '왜 제주에서',
];

window.SLIDES = [
  { id:'00',  ch:0, bg:'00',   type:'video', steps:0, title:'틸론소프트 AI 서비스 소개', chapterStart:true,  overlay:'light' },
  { id:'01',  ch:0, bg:'01',   type:'video', steps:1, title:'83.2%의 독점적 경험', overlay:'heavy' },
  { id:'02',  ch:0, bg:'02',   type:'video', steps:1, title:'구축으로 증명한 기술을, 서비스로' },
  { id:'03',  ch:0, bg:'03',   type:'video', steps:1, title:'축적한 기술을 새로운 방식으로 연결', overlay:'light' },
  { id:'04',  ch:0, bg:'04',   type:'video', steps:1, title:'기술을 결합하여 전달 방식을 넓히는 것' },
  { id:'05',  ch:1, bg:'05',   type:'video', steps:3, title:'서비스는 매일 증명하는 것', chapterStart:true },
  { id:'06',  ch:1, bg:'06',   type:'video', steps:4, stepBg:{1:'06-1',2:'06-2',3:'06-3',4:'06-4'}, title:'네 가지 시작의 문제', overlay:'heavy' },
  { id:'07',  ch:1, bg:'07',   type:'video', steps:1, title:'시작의 문턱을 서비스로 낮추다', overlay:'light' },
  { id:'08',  ch:1, bg:'08',   type:'video', steps:4, auto:1300, autoTo:3, title:'세 서비스가 낮추는 문턱' },
  { id:'09',  ch:2, bg:'09',   type:'video', steps:0, title:'TheOther.Space 2.0', chapterStart:true, overlay:'light' },
  { id:'10',  ch:2, bg:'10',   type:'video', steps:2, stepBg:{1:'10-1'}, title:'준비와 관리의 과정을 바꾸다', overlay:'heavy' },
  { id:'11',  ch:2, bg:'11',   type:'video', steps:2, title:'PC를 준비하는 시간을 업무로' },
  { id:'12',  ch:3, bg:'12',   type:'video', steps:1, auto:1000, title:'TheOther.Town', chapterStart:true, overlay:'light' },
  { id:'13',  ch:3, bg:'13',   type:'video', steps:1, title:'iStation — 모델과 토큰 관리', overlay:'heavy' },
  { id:'14',  ch:3, bg:'14',   type:'video', steps:3, auto:1300, autoTo:2, overlay:'heavy', title:'iStation — 보안과 내부문서' },
  { id:'15',  ch:3, bg:'15',   type:'video', steps:0, title:'Tstation', overlay:'light' },
  { id:'15-1',ch:3, bg:'15-1', type:'video', steps:1, title:'GPU · 개발공간 · 개발도구' },
  { id:'15-2',ch:3, bg:'15-2', type:'video', steps:0, title:'교수는 수업에 집중', overlay:'light' },
  { id:'15-3',ch:3, bg:'15-3', type:'video', steps:1, auto:1600, title:'학생은 실습에, 개발자는 구현에', overlay:'light' },
  { id:'15-4',ch:3, bg:'15-4', type:'video', steps:0, title:'AI를 배우고 만드는 시간으로' },
  { id:'16',  ch:4, bg:'16',   type:'video', steps:2, title:'AI를 처음 만나는 사람에게', chapterStart:true },
  { id:'17',  ch:4, bg:'17',   type:'video', steps:2, auto:1400, title:'책을 펼칠 이유 → 관련 독서' },
  { id:'18',  ch:4, bg:'18',   type:'video', steps:1, auto:1600, title:'직장인의 힐링 동화' },
  { id:'19',  ch:4, bg:'19',   type:'image', steps:2, auto:1300, title:'세상에 하나뿐인 가족 그림책' },
  { id:'20',  ch:4, bg:'20',   type:'video', steps:2, auto:1500, title:'어르신의 삶이 한 권의 동화로' },
  { id:'21',  ch:4, bg:'21',   type:'video', steps:1, auto:1500, title:'책을 펼치게 하는 AI' },
  { id:'22',  ch:4, bg:'22',   type:'video', steps:1, title:'읽고 배우고 표현하는 활동으로' },
  { id:'23',  ch:5, bg:'23',   type:'video', steps:1, title:'AI 에이전트가 일할 공간', chapterStart:true },
  { id:'24',  ch:5, bg:'24',   type:'video', steps:1, title:'실습에서 개발·운영 전 과정으로' },
  { id:'25',  ch:5, bg:'25',   type:'video', steps:1, title:'동화책에 머물지 않겠습니다' },
  { id:'26',  ch:6, bg:'26',   type:'video', steps:2, title:'제주에는 바다가 하나 더', chapterStart:true, overlay:'light' },
  { id:'27',  ch:6, bg:'27',   type:'video', steps:0, title:'어디에서든 낮출 수 있다' },
  { id:'28',  ch:6, bg:'28',   type:'video', steps:2, auto:500, autoTo:1, title:'이 증명은 혼자 할 수 없습니다' },
  { id:'29',  ch:6, bg:'29',   type:'video', steps:1, title:'83.2% — 제주도민의 비중이기를' },
  { id:'30',  ch:6, bg:'30',   type:'video', steps:2, title:'증명된 기술을, 모두가 누리는 서비스로', overlay:'light' },
];

/* 재사용 후보 매핑(신규 영상이 없을 때 임시로 쓰는 보유 영상). 신규 영상이 assets/video/NN.mp4 로 들어오면 자동으로 우선 사용. */
window.FALLBACK_BG = {
  '10':'s02_pc_to_cloud_v01',
  '22':'s08_five_step_creation',
  '26':'hf-v02-aijeju-master-v01',
};

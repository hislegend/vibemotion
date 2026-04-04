![Features in the Editor](https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/Remotion%20Editor%20Starter%20Structure.png)

# Editor Starter의 기능들
이 페이지에서는 Editor Starter에서 사용할 수 있는 기능들을 나열합니다.

Editor Starter는 이 그래픽에 나타난 다음과 같은 부분들로 구성됩니다:


## 기능 플래그
많은 기능들이 기능 플래그로 제어되며, src/editor/flags.ts에서 플래그를 전환하여 활성화하거나 비활성화할 수 있습니다.

기능 플래그는 다음과 같은 용도로 유용합니다:

- 필요하지 않은 기능을 비활성화하기 위해
- 코드베이스에서 해당 기능을 검색하고 어디서 구현되었는지 찾기 위해
- 자신의 프로젝트에서 어떤 기능들을 채택하고 있는지 이해하기 위해

이 페이지에서; 기능에 플래그가 있는 경우, 클릭하면 코드베이스에서의 사용을 볼 수 있습니다. 기능 플래그 링크는 Editor Starter를 구매한 경우(즉, 저장소에 액세스할 수 있는 경우)와 GitHub에 로그인한 경우에만 작동합니다.

## 아이템 타입
기본적으로 다음 아이템 타입을 지원합니다:

- 이미지
- 비디오
- 오디오
- GIF
- 텍스트
- 단색
- 자막

이들에 대해 더 자세히 알아보고 새로운 아이템 타입을 추가하는 방법을 알아보려면: Tracks, items and assets를 참조하세요.

## 액션 행
액션 행은 상단 툴바입니다.

### 단색 그리기 도구
기능 플래그: FEATURE_DRAW_SOLID_TOOL

캔버스에 단색 아이템을 그리는 버튼을 표시합니다.

### 텍스트 추가 도구
기능 플래그: FEATURE_CREATE_TEXT_TOOL

캔버스에 텍스트 아이템을 추가하는 버튼을 표시합니다.

### 애셋 가져오기 도구
기능 플래그: FEATURE_IMPORT_ASSETS_TOOL

애셋을 캔버스로 가져오는 버튼을 표시합니다.

### 실행 취소 버튼
기능 플래그: FEATURE_UNDO_BUTTON

마지막 작업을 실행 취소하는 버튼을 표시합니다.

### 다시 실행 버튼
기능 플래그: FEATURE_REDO_BUTTON

마지막 작업을 다시 실행하는 버튼을 표시합니다.

### 저장 버튼
기능 플래그: FEATURE_SAVE_BUTTON

프로젝트의 현재 상태를 저장하는 버튼을 표시합니다.

### 상태 다운로드 버튼
기능 플래그: FEATURE_DOWNLOAD_STATE

프로젝트의 현재 상태를 다운로드하는 버튼을 표시합니다.

### 상태 로드 버튼
기능 플래그: FEATURE_LOAD_STATE

FEATURE_DOWNLOAD_STATE 버튼으로 다운로드한 프로젝트 상태를 로드하는 버튼을 표시합니다.

## 타임라인
타임라인을 통해 콘텐츠의 개요를 보고 비디오를 스크럽할 수 있습니다.
아이템들은 "트랙"으로 구성되어, 여러 아이템을 동시에 배치하고 겹치는 방식을 제어할 수 있습니다.

### 드래그 가능한 플레이헤드
시간 눈금을 누르고 드래그하면 플레이헤드를 이동할 수 있어 비디오의 위치를 조정할 수 있습니다.
플레이헤드를 타임라인 가장자리로 드래그하면 타임라인이 스크롤됩니다.

### 애셋 드롭
기능 플래그: FEATURE_DROP_ASSETS_ON_TIMELINE

애셋(이미지, 비디오, 오디오, GIF)을 타임라인에 드롭하여 가져오고 새 레이어를 추가할 수 있습니다.
아이템 타입은 Remotion Media Parser가 감지하고 적절한 아이템이 생성됩니다.

### 필름스트립 썸네일
기능 플래그: FEATURE_FILMSTRIP

비디오 아이템의 경우, 타임라인에 미리보기 이미지가 표시됩니다.

### 자동 지속시간
애셋을 가져올 때, 애셋의 길이에 따라 아이템에 자동으로 적절한 지속시간이 할당됩니다. 비디오와 오디오 아이템은 미디어 지속시간을 사용하고, 이미지와 텍스트는 기본 지속시간을 사용합니다.

### 드래그 앤 드롭
아이템을 드래그하여 타임라인에서 재배치할 수 있습니다. 다중 선택이 지원되어 여러 아이템을 한 번에 드래그할 수 있습니다. 드래그할 때 그림자 오버레이로 이동하는 아이템이 배치될 위치를 보여줍니다.

### 확장 핸들
아이템 양쪽 끝을 드래그하여 아이템을 확장하거나 축소할 수 있습니다.

### 최대 트림 표시기
기능 플래그: FEATURE_MAX_TRIM_INDICATORS

아이템을 확장할 때, 선택된 아이템의 흰색 윤곽선으로 최대 트림 위치가 표시됩니다.

### 오디오 파형
기능 플래그: FEATURE_WAVEFORM와 FEATURE_AUDIO_WAVEFORM_FOR_VIDEO_ITEM

비디오 및 오디오 아이템은 타임라인 하단에 파형을 표시합니다.

### 볼륨 제어
기능 플래그: FEATURE_TIMELINE_VOLUME_CONTROL

오디오 및 비디오 아이템은 타임라인 파형에 드래그 가능한 볼륨 라인을 표시합니다. 수직으로 드래그하면 데시벨 단위로 볼륨을 조정하며 현재 레벨을 보여주는 시각적 표시기가 나타납니다.

### 페이드 인/아웃
기능 플래그: FEATURE_AUDIO_FADE_CONTROL과 FEATURE_VISUAL_FADE_CONTROL

아이템은 투명도 페이드 인 및 페이드 아웃 효과를 지원합니다. 오디오 및 비디오 아이템도 페이드를 지원합니다. 아이템의 시작과 끝 부분에 마우스를 올리면 드래그 가능한 핸들이 나타나 페이드 지속시간을 조정할 수 있으며, 페이드 효과를 보여주는 시각적 곡선이 표시됩니다.

### 아이템 분할
기능 플래그: FEATURE_SPLIT_ITEM

가위 도구를 사용하여 현재 플레이헤드 위치에서 아이템을 분할할 수 있습니다.
분할은 두 개의 별도 아이템을 생성하며, 새 세그먼트에 대해 페이드 효과와 미디어 시작 시간을 적절히 처리합니다.

### 다중 선택 / 마퀴 선택
기능 플래그: FEATURE_TIMELINE_MARQUEE_SELECTION

Cmd/Ctrl+클릭(또는 Shift+클릭)을 사용하여 여러 아이템을 선택에 추가하거나, 마퀴 선택(Marquee selection)을 통해 선택 사각형을 만들어 경계 내의 모든 아이템을 선택할 수 있습니다. 선택된 아이템들은 함께 이동, 삭제, 편집할 수 있습니다.

### 트랙 숨기기
기능 플래그: FEATURE_HIDE_TRACKS

타임라인에서 특정 트랙을 숨길 수 있습니다.

### 트랙 음소거
기능 플래그: FEATURE_MUTE_TRACKS

타임라인에서 특정 트랙을 음소거할 수 있습니다.

### 롤링 편집
기능 플래그: FEATURE_ROLLING_EDITS

롤링 편집은 타임라인에서 인접한 두 아이템 사이의 컷 지점을 전체 결합 지속시간이나 위치를 변경하지 않고 조정할 수 있는 비디오 편집 기능입니다.

### 재생 중 플레이헤드 따라가기
기능 플래그: FEATURE_FOLLOW_PLAYHEAD_WHILE_PLAYING

플레이헤드가 앞으로 이동할 때 타임라인을 스크롤합니다.

### 타임라인 스내핑
기능 플래그: FEATURE_TIMELINE_SNAPPING

타임라인에서 스내핑을 활성화하여 드래그할 때 아이템이 다른 아이템, 플레이헤드 또는 그리드 위치에 정렬되도록 합니다. 이는 위치 지정과 전환을 간소화합니다. 우상단 모서리의 자석 아이콘을 클릭하여 스내핑을 활성화하세요.

### 스내핑 토글 단축키
기능 플래그: FEATURE_SNAPPING_SHORTCUT

Shift+M 키보드 단축키를 사용하여 타임라인 스내핑을 켜고 끌 수 있습니다. 이 기능이 활성화되면 단축키를 사용하여 스내핑을 일시적으로 (비)활성화할 수 있습니다.

## 인스펙터
화면 오른쪽에 인스펙터가 표시되어 선택된 아이템의 속성을 편집할 수 있습니다.
다음 기능들이 사용 가능합니다.

### 컬포지션 인스펙터
아이템이 선택되지 않은 경우, 전체 컬포지션에 대한 제어 요소가 표시됩니다(즉, 컬포지션 인스펙터):

- 치수 설정
- 렌더링 트리거
#### 치수 바꿨 버튼
기능 플래그: FEATURE_SWAP_COMPOSITION_DIMENSIONS_BUTTON

컬포지션의 너비와 높이를 바꿨 버튼을 표시합니다(즉, 컬포지션 인스펙터 내에서).

#### 소스 정보
기능 플래그: FEATURE_SOURCE_CONTROL

선택된 아이템의 연결된 애셋에 대한 정보(파일명, 파일 크기, 업로드 진행률, 다운로드 진행률 등)를 보여줍니다.

#### 레이어 정렬
기능 플래그: FEATURE_ALIGNMENT_CONTROL

아이템을 왼쪽, 수직 중앙, 오른쪽, 위쪽, 수평 중앙, 아래쪽에 정렬하는 버튼들입니다.

#### 위치 제어
기능 플래그: FEATURE_POSITION_CONTROL

아이템의 정확한 X와 Y 위치를 설정할 수 있습니다.

#### 치수 제어
기능 플래그: FEATURE_DIMENSIONS_CONTROL

아이템의 너비와 높이를 설정할 수 있습니다.

#### 비율 유지 제어
기능 플래그: FEATURE_KEEP_ASPECT_RATIO_CONTROL

아이템의 비율 유지를 설정할 수 있습니다.

#### 테두리 반지름 제어
기능 플래그: FEATURE_BORDER_RADIUS_CONTROL

아이템의 테두리 반지름을 설정할 수 있습니다. UI에서 테두리 반지름은 "모서리 반지름"으로 명명됩니다.

#### 투명도 제어
기능 플래그: FEATURE_OPACITY_CONTROL

아이템의 투명도를 설정할 수 있습니다.

#### 텍스트 정렬
기능 플래그: FEATURE_TEXT_ALIGNMENT_CONTROL

아이템의 텍스트 정렬(왼쪽, 중앙, 오른쪽)을 설정할 수 있습니다.

#### 폰트 패밀리
기능 플래그: FEATURE_FONT_FAMILY_CONTROL

아이템의 폰트 패밀리를 설정할 수 있습니다.

#### 폰트 패밀리 미리보기
기능 플래그: FEATURE_FONT_FAMILY_DROPDOWN_RENDER_IN_FONT

폰트 패밀리 드롭다운의 각 항목이 해당 폰트로 렌더링됩니다.

#### 호버로 폰트 패밀리 미리보기
기능 플래그: FEATURE_CHANGE_FONT_FAMILY_ON_HOVER

폰트 패밀리 드롭다운의 항목 위에 마우스를 올리면, 캔버스의 텍스트 아이템이 해당 항목이 선택되었을 때의 모습으로 미리보기 업데이트됩니다.

#### 폰트 스타일
기능 플래그: FEATURE_FONT_STYLE_CONTROL

텍스트와 자막 아이템에 대해 폰트 스타일 변형과 가중치(normal, italic, bold 등)를 설정할 수 있습니다. 옵션 위에 마우스를 올릴 때 실시간 미리보기가 포함됩니다.

#### 호버로 폰트 스타일 미리보기
기능 플래그: FEATURE_CHANGE_FONT_STYLE_ON_HOVER

폰트 스타일 드롭다운의 항목 위에 마우스를 올리면, 캔버스의 텍스트 아이템이 해당 항목이 선택되었을 때의 모습으로 미리보기 업데이트됩니다.

#### 폰트 크기
기능 플래그: FEATURE_TEXT_FONT_SIZE_CONTROL

아이템의 폰트 크기를 설정할 수 있습니다.

#### 텍스트 값
기능 플래그: FEATURE_TEXT_VALUE_CONTROL

인스펙터의 텍스트 영역을 통해 텍스트 콘텐츠를 편집할 수 있습니다. 텍스트 영역은 콘텐츠와 정렬 설정에 따라 자동으로 크기가 조정됩니다.

#### 색상
기능 플래그: FEATURE_COLOR_CONTROL

텍스트, 단색, 자막 아이템에 대한 색상 선택기를 제공합니다.

#### 회전
기능 플래그: FEATURE_ROTATION_CONTROL과 FEATURE_ROTATE_90_DEGREES_BUTTON

아이템의 회전을 변경할 수 있습니다.

FEATURE_ROTATE_90_DEGREES_BUTTON 플래그는 아이템을 시계방향으로 90도 빠르게 회전시키는 버튼을 표시합니다.

#### 행 높이
기능 플래그: FEATURE_TEXT_LINE_HEIGHT_CONTROL

텍스트와 자막 아이템의 행 높이를 설정할 수 있습니다.
0.5에서 5.0까지의 값을 받으며 변경 시 자동 텍스트 재레이아웃이 수행됩니다.

#### 글자 간격
기능 플래그: FEATURE_TEXT_LETTER_SPACING_CONTROL

텍스트와 자막 아이템의 글자 간격을 설정할 수 있습니다.
-10px에서 50px까지의 값을 지원하며 변경 시 자동 텍스트 재레이아웃이 수행됩니다.

#### 텍스트 방향
기능 플래그: FEATURE_TEXT_DIRECTION_CONTROL

왼쪽에서 오른쪽(LTR)과 오른쪽에서 왼쪽(RTL; 아랍어와 같은) 텍스트 방향 제어를 제공합니다.
새 텍스트 아이템을 생성할 때 텍스트 방향이 자동으로 감지되지만, 수동으로 재정의할 수 있습니다.

#### 재생 속도
기능 플래그: FEATURE_PLAYBACKRATE_CONTROL

비디오, 오디오, GIF 아이템의 재생 속도를 설정할 수 있습니다.
0.25x에서 5x까지의 속도를 지원하며 새로운 재생 속도에 따라 자동 지속시간 조정이 수행됩니다.

#### 볼륨
기능 플래그: FEATURE_VOLUME_CONTROL

오디오와 비디오 아이템에 대해 데시벨 기반 조정이 가능한 볼륨 슬라이더를 제공합니다.
원본 오디오와의 현재 dB 차이를 보여줍니다.

#### 페이드 인 및 아웃
기능 플래그: FEATURE_AUDIO_FADE_CONTROL과 FEATURE_VIDEO_FADE_CONTROL

오디오와 비디오 아이템에 대해 페이드 인 및 페이드 아웃 지속시간의 정밀한 제어를 제공합니다.
페이드 효과의 시각적 미리보기와 함께 초 단위로 페이드 시간을 설정할 수 있습니다.

#### 자막 토큰
기능 플래그: FEATURE_TOKENS_CONTROL

생성된 자막의 토큰을 수정할 수 있는 제어 요소입니다.

#### 자막 페이지 지속시간
기능 플래그: FEATURE_CAPTIONS_PAGE_DURATION_CONTROL

자막의 한 페이지 지속시간을 설정할 수 있는 제어 요소입니다.

#### 자막 텍스트 행 수
기능 플래그: FEATURE_TEXT_MAX_LINES_CONTROL

텍스트 아이템에 표시될 수 있는 자막 텍스트의 행 수를 제한합니다.

#### 자막 강조 색상
기능 플래그: FEATURE_CAPTIONS_HIGHLIGHT_COLOR_CONTROL

자막 페이지에서 현재 음성으로 나오는 단어의 색상을 설정할 수 있는 제어 요소입니다.

## 재생

### 재생/일시정지 버튼
비디오 재생을 시작하거나 중지하는 중앙 재생/일시정지 버튼입니다. 키보드의 스페이스 바로 제어할 수도 있습니다.

### 현재 시간 표시기
현재 플레이헤드 위치를 타임코드 형식(MM:SS.FF, 여기서 FF는 프레임 번호)으로 표시합니다.

### 시작 지점으로 이동 버튼
기능 플래그: FEATURE_JUMP_TO_START_BUTTON

비디오의 시작 지점으로 이동하는 버튼을 표시합니다.

### 끝 지점으로 이동 버튼
기능 플래그: FEATURE_JUMP_TO_END_BUTTON

비디오의 끝 지점으로 이동하는 버튼을 표시합니다.

### 전체화면 버튼
기능 플래그: FEATURE_FULLSCREEN_CONTROL

비디오 플레이어의 전체화면 모드로 진입할 수 있습니다(Esc로 나가기).

### 음소거 버튼
기능 플래그: FEATURE_MUTE_BUTTON

전체 타임라인 오디오에 대한 전역 음소거/음소거 해제 스위처입니다.

### 루프
기능 플래그: FEATURE_LOOP_BUTTON

전체 타임라인의 루프를 활성화하거나 비활성화하는 스위처 버튼입니다.

### 줌 슬라이더
기능 플래그: FEATURE_TIMELINE_ZOOM_SLIDER

타임라인 바로 위 오른쪽에 슬라이더를 표시하여 타임라인을 확대하거나 축소할 수 있습니다.

### 타임라인 크기 조정
기능 플래그: FEATURE_RESIZE_TIMELINE_PANEL

패널의 상단 가장자리를 드래그하여 타임라인 패널의 크기를 조정할 수 있습니다.

## 캔버스

### 클릭으로 선택
캔버스의 아이템을 클릭하면 선택됩니다. 선택된 아이템은 파란색 외곽선을 보여주며 인스펙터를 통해 편집할 수 있습니다. 빈 공간을 클릭하면 모든 아이템이 선택 해제됩니다.

### 이동 및 크기 조정
선택된 아이템을 드래그하여 캔버스에서 위치를 이동할 수 있습니다.
선택된 아이템에 크기 조정 핸들이 나타나 모서리나 가장자리를 드래그하여 너비와 높이를 조정할 수 있습니다.

### Shift 축 잠금
기능 플래그: FEATURE_SHIFT_AXIS_LOCK

드래그할 때 Shift를 누른 상태에서 아이템 이동을 수평 또는 수직 축으로만 제한하여 정밀한 위치 지정과 정렬에 도움을 줍니다.

### Shift 비율 잠금
기능 플래그: FEATURE_SHIFT_KEY_TO_OVERRIDE_ASPECT_RATIO_LOCK (기본적으로 비활성화됨)

비디오 아이템 크기를 조정할 때 Shift를 누르고 있으면 원본 비율을 무시하여 비디오 아이템을 확대하거나 축소할 때 왜곡을 허용합니다.
이 기능은 기본적으로 비활성화되어 있습니다.

### 다중 선택 / 마퀴 선택
기능 플래그: FEATURE_CANVAS_MARQUEE_SELECTION

Cmd/Ctrl+클릭(또는 Shift+클릭)을 사용하여 여러 아이템을 선택에 추가하거나, 마퀴 선택(Marquee selection)을 통해 선택 사각형을 만들어 경계 내의 모든 아이템을 선택할 수 있습니다. 선택된 아이템들은 함께 이동, 삭제, 편집할 수 있습니다.

### 애셋 드롭
기능 플래그: FEATURE_DROP_ASSETS_ON_CANVAS

애셋을 파일 시스템에서 캔버스로 직접 드롭할 수 있습니다.
아이템은 현재 시간에 시작되고 캔버스에서 드롭된 위치에 자동으로 배치됩니다.

### 줌 제어
기능 플래그: FEATURE_CANVAS_ZOOM_CONTROLS

에디터 오른쪽 위에 캔버스를 확대하거나 축소할 수 있는 인터페이스를 표시합니다.
캔버스의 줌 레벨이 백분율로 표시되고 사용 가능한 공간에 맞게 리셋할 수 있습니다.

### 줌 제스처
기능 플래그: FEATURE_CANVAS_ZOOM_GESTURES

데스크톱에서는 Cmd/Ctrl을 누른 상태에서 마우스 휠을 스크롤하면 마우스 위치를 줌 중심으로 캔버스를 확대하거나 축소할 수 있습니다.

터치 디바이스에서는 핀치 제스처로 캔버스를 확대할 수 있습니다.

### 줌 키보드 단축키
기능 플래그: FEATURE_CANVAS_ZOOM_KEYBOARD_SHORTCUTS

+와 -를 눌러 확대하거나 축소할 수 있습니다.
0을 눌러 줌을 리셋합니다.

### 복사 및 붙여넣기
기능 플래그: FEATURE_COPY_PASTE_LAYERS과 FEATURE_PASTE_ASSETS

아이템을 Cmd/Ctrl+C로 복사하고 Cmd/Ctrl+V로 붙여넣을 수 있습니다.
붙여넣은 아이템은 자동으로 위치가 지정되며 클립보드의 텍스트, 이미지 및 기타 애셋을 포함할 수 있습니다.

### 맨 앞으로 가져오기 / 맨 뒤로 보내기
기능 플래그: FEATURE_BRING_TO_FRONT과 FEATURE_SEND_TO_BACK

아이템에 마우스 오른쪽 클릭하면 아이템을 맨 앞으로 가져오거나 맨 뒤로 보내는 옵션이 있는 메뉴가 표시됩니다.

## 동작

### 자르기, 복사, 붙여넣기, 복제 아이템
기능 플래그: FEATURE_CUT_LAYERS, FEATURE_COPY_LAYERS, FEATURE_DUPLICATE_LAYERS

표준 자르기(Cmd/Ctrl+X), 복사(Cmd/Ctrl+C), 붙여넣기(Cmd/Ctrl+V) 작업이 아이템에서 작동합니다.
복제(Cmd/Ctrl+D)는 선택된 아이템의 복사본을 생성합니다.

### 텍스트 붙여넣기
기능 플래그: FEATURE_PASTE_TEXT

붙여넣기 시 클립보드에 텍스트가 있는 경우, 텍스트가 텍스트 아이템으로 붙여넣어집니다.

### 애셋 붙여넣기
기능 플래그: FEATURE_PASTE_ASSETS

붙여넣기 시 클립보드에 애셋이 있는 경우, 애셋이 새 아이템으로 붙여넣어집니다.
브라우저 지원에 따라 이미지에서만 작동할 수 있습니다.

### 저장 및 로드
기능 플래그: FEATURE_SAVE_BUTTON과 FEATURE_SAVE_SHORTCUT

Cmd/Ctrl+S로 저장을 트리거할 수 있습니다. 프로젝트가 저장되면 에디터로 돌아올 때 자동으로 로드됩니다.

### URL에서 상태 로드
기능 플래그: FEATURE_LOAD_STATE_FROM_URL

URL 해시 #state=[value]로부터 에디터의 초기 상태를 로드할 수 있습니다.

[value]는 UndoableState의 base64 인코딩된 직렬화여야 합니다.

### 애셋 업로드
애셋을 에디터에 드롭하면 업로드되고 처리됩니다. 업로드 진행률이 표시기로 보여지며, 애셋은 브라우저 세션 간에 사용할 수 있도록 저장됩니다. 여러 파일 형식이 지원됩니다.

### 실행 취소 및 다시 실행
기능 플래그: FEATURE_UNDO_SHORTCUT과 FEATURE_REDO_SHORTCUT

Cmd/Ctrl+Z로 실행 취소하고 Cmd/Ctrl+Y 또는 Cmd/Ctrl+Shift+Z로 다시 실행할 수 있습니다.

### 애셋 캐싱
기능 플래그: FEATURE_CACHE_ASSETS_LOCALLY

더 빠른 로딩과 오프라인 편집 기능을 위해 IndexedDB를 사용하여 애셋이 브라우저에 로컬로 캐시됩니다. 캐시된 애셋은 브라우저 세션 간에 유지됩니다.

### 오래 실행되는 작업 진행 중 페이지 떠날 때 경고
기능 플래그: FEATURE_WARN_ON_LONG_RUNNING_PROCESS_IN_PROGRESS

렌더링, 애셋 업로드 또는 자막 작업이 진행 중일 때 페이지를 떠나면 사용자에게 확인을 요청합니다.

## 자막 처리

### 전사
기능 플래그: FEATURE_CAPTIONING

오디오와 비디오 애셋을 자막으로 전사하는 UI를 활성화합니다.
참조: Captioning

## 렌더링

### 렌더링 버튼
기능 플래그: FEATURE_RENDERING

현재 컬포지션을 비디오 파일로 렌더링하는 UI를 활성화합니다. 렌더링 진행률을 보여주고 최종 렌더링된 비디오를 다운로드할 수 있습니다.

### 코덱 선택기
기능 플래그: FEATURE_RENDERING_CODEC_SELECTOR

렌더링을 위한 코덱(MP4 / WebM)을 선택할 수 있습니다.

## 키보드 단축키

| 단축키 | 기능 | 기능 플래그 |
|--------|------|--------|
| ⌘/Ctrl+Z | 실행 취소 | FEATURE_UNDO_SHORTCUT |
| ⌘/Ctrl+Y 또는 ⌘/Ctrl+Shift+Z | 다시 실행 | FEATURE_REDO_SHORTCUT |
| → | 1프레임 앞으로 | - |
| ← | 1프레임 뒤로 | - |
| + | 확대 | FEATURE_CANVAS_ZOOM_KEYBOARD_SHORTCUTS |
| - | 축소 | FEATURE_CANVAS_ZOOM_KEYBOARD_SHORTCUTS |
| 0 | 줌 리셋 | FEATURE_CANVAS_ZOOM_KEYBOARD_SHORTCUTS |
| Space | 재생/일시정지 | - |
| ⌘/Ctrl+S | 저장 | FEATURE_SAVE_BUTTON |
| Shift 또는 ⌘/Ctrl 홀드 | 아이템 선택 시 (다중 선택) | - |
| Shift 홀드 + 드래그 | 수평/수직축으로만 이동 제한 | FEATURE_SHIFT_AXIS_LOCK |
| ⌘/Ctrl+A | 모든 아이템 선택 | FEATURE_SELECT_ALL_SHORTCUT |
| ⌘/Ctrl+X | 선택된 아이템 잘라내기 | FEATURE_CUT_LAYERS |
| ⌘/Ctrl+C | 선택된 아이템 복사 | FEATURE_COPY_PASTE_LAYERS |
| ⌘/Ctrl+V | 아이템 붙여넣기 | FEATURE_COPY_PASTE_LAYERS |
| ⌘/Ctrl+D | 선택된 아이템 복제 | FEATURE_DUPLICATE_LAYERS |
| Delete 또는 Backspace | 선택된 아이템 삭제 | FEATURE_BACKSPACE_TO_DELETE |
| Shift+M | 타임라인 스내핑 토글 | FEATURE_SNAPPING_SHORTCUT |

# Editor Starter에 포함되지 않은 기능들

Remotion Editor Starter는 모든 video editor가 필요로 하는 명백한 기능들만 포함하는 것을 목표로 합니다.

특정 기능들은 다음과 같은 이유로 포함되지 않을 수 있습니다:

- 너무 독단적인 구현이 필요하거나
- 구매자가 이해하고 채택하기에 너무 복잡하거나
- 필수적이지 않거나

우리는 Editor Starter를 video editing 기능을 가진 app을 구축하고자 하는 개발자들을 위한 시작점이 되도록 설계했으며, 완전한 제품이 아닙니다.

우리의 초점은 여러분이 이해하고 반복할 수 있는 간단한 것을 제공하는 것입니다.

이는 특정 기능들을 포함하고 싶다면 직접 구현해야 한다는 것을 의미합니다.  
다음 목록은 **포함되지 않은** 기능들의 **불완전한** 목록입니다.

## Keyframing과 animation

layer의 속성들은 정적이며 시간에 따라 animate되지 않습니다.

keyframe 지원을 포함하고 싶다면, 속성의 value type을 keyframe 배열로 교체하고 [`interpolate`](/docs/interpolate) 함수를 사용하여 보간하는 것을 권장합니다.  
대부분의 video editor들이 timing 편집도 허용한다는 점을 고려하면, [`Easing`](/docs/easing) 함수들을 사용해서 이를 달성할 수 있습니다.

## Transitions

Editor Starter에는 transition 지원이 포함되지 않았습니다.

transition 지원을 포함하고 싶다면, 먼저 track의 item들이 인접해 있는지 감지하는 것을 권장합니다([rolling edits](/docs/editor-starter/features#rolling-edits) 기능이 하는 것과 유사하게).  
item들이 인접해 있다면, 일반 rendering을 대체하고 [`<TransitionSeries>`](/docs/transitions/transitionseries)에서 render할 수 있습니다.

## 프로젝트 관리

사용자가 프로젝트들을 관리할 수 있는 인터페이스를 구축하는 것은 여러분의 책임입니다.  
각 `<Editor />` 인스턴스는 격리된 에디터 경험입니다.

[저장 버튼](/docs/editor-starter/features#save-button)이 활성화되어 있다면 [`loadState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+loadState&type=code) 함수를 통해, 그렇지 않다면 [`getInitialState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20getInitialState&type=code)를 통해 상태가 로드됩니다.  
[저장 버튼](/docs/editor-starter/features#save-button) 기능이 활성화되어 있다면 [`saveState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+saveState&type=code) 함수를 통해, 그렇지 않다면 전혀 저장되지 않습니다.

사용자가 여러 프로젝트에서 작업할 수 있게 하고 싶다면, 해당 프로젝트들을 적절히 로드하고 저장하고 예를 들어 URL 매개변수를 통해 현재 프로젝트를 식별하도록 이 함수들을 변경하는 것으로 예상됩니다.

## 자동 저장

우리는 에디터의 상태를 로컬 스토리지에 수동으로 저장하는 [기능만 제공](/docs/editor-starter/features#save-and-load)합니다.  
자동 저장 기능을 포함하고 싶다면, 에디터의 전체 상태를 가져오기 위해 [`useFullState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+useFullState&type=code) 훅을 사용하고 상태가 변경될 때 코드를 실행하기 위해 `useEffect`를 사용하는 것을 권장합니다.

[`useFullState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+useFullState&type=code)의 예를 보려면 [`<SaveButton />`의 로직](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+SaveButton&type=code)을 참조하세요.

## 모바일 지원

Editor Starter는 휴대폰에서 사용하기 위해 최적화되지 않았습니다.  
여러분이 비디오 편집 인터페이스를 데스크톱 사용자에게만 제공할 것으로 예상됩니다.

## 다중 frame rate

editor starter의 frame rate는 기본적으로 30fps로 고정되어 있으며, [`DEFAULT_FPS`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+DEFAULT_FPS&type=code) 상수에 의해 설정됩니다.

다른 기본 frame rate를 원한다면, 상수를 변경할 수 있습니다.

다중 frame rate를 지원하고 싶다면, `undoableState.fps`가 원하는 값으로 변경되도록 state를 변경해야 합니다. 또한 frame rate를 동적으로 변경할 때, item들을 새로운 frame rate로 변환해야 합니다.  
예를 들어, 각 item은 frame으로 표현되는 `from`과 `durationInFrames` 속성을 가지며, 이들을 새로운 frame rate로 변환해야 합니다.

## Authentication

Editor Starter에는 login, authentication, authorization 또는 user management가 포함되어 있지 않습니다.  
login flow를 원한다면 사용자가 로그인한 경우에만 표시되는 페이지에 `<Editor />` component를 mount하는 것으로 예상됩니다.

template과 함께 제공되는 asset uploading, captioning, rendering endpoint들에 적절한 보호를 추가하세요. 우리가 어떤 보호도 추가하지 않았기 때문입니다.

## 임의의 font들

우리의 Font Picker는 완전히 Google Fonts를 기반으로 하며 기본적으로 가장 인기 있는 font들만 포함합니다.

사용자가 자신의 font를 업로드하거나 다른 font들을 제공하게 하고 싶다면, preview와 rendering 중에 올바른 font들을 load하도록 Editor Starter를 refactor해야 합니다.  
[`@remotion/fonts`](/docs/fonts-api)가 이를 달성하는 좋은 방법입니다.

또한 추가 source들에서 추가 font들을 보여주도록 Font Picker를 refactor해야 하며, [dropdown preview font loading](/docs/editor-starter/features#font-family-preview)과 [font 위에 hover할 때 preview font loading](/docs/editor-starter/features#hover-to-preview-font-family)을 위한 logic을 조정해야 할 수도 있습니다.

## 긴 audio file captioning

현재 우리는 audio file에 caption을 추가하기 위해 OpenAI Whisper API를 사용하며, 이는 최대 25MB 크기의 audio file로 제한됩니다.  
긴 audio file을 어떻게 처리할지는 여러분에게 달려 있습니다.

참조: [Captioning - Limits](/docs/editor-starter/captioning#limits)

## Light mode

theme은 하나뿐이며, dark theme입니다.

## Snapping

다른 item들의 위치나 canvas 경계를 기반으로 item들을 정렬하는 자기적 "snapping" 기능은 기본적으로 제공되지 않습니다.

## 참고 항목

- [Editor Starter에 포함된 기능들](/docs/editor-starter/features)
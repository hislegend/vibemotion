# Editor Starter의 트랙, 아이템, 애셋

Editor Starter의 상태는 다양한 데이터 타입을 포함합니다:

- **애셋(Assets)**: 애셋은 이미지, 비디오, 오디오, GIF, 자막과 같은 미디어 파일을 의미합니다.
- **아이템(Items)**: 아이템은 타임라인에 표시되고 캔버스에 렌더링되는 데이터 타입입니다. 애셋을 감싸거나, 단색이거나, 텍스트 아이템일 수 있습니다.
- **트랙(Tracks)**: 트랙은 여러 아이템을 포함할 수 있습니다. 트랙들은 서로 위에 쌓이며, 위쪽에 표시되는 트랙이 앞쪽에 아이템을 렌더링합니다.

이러한 엔티티들 간의 관계는 다음과 같습니다:

- 아이템은 최대 하나의 애셋을 참조할 수 있습니다.
- 여러 아이템이 같은 애셋을 참조할 수 있습니다.
- 트랙은 여러 아이템을 포함할 수 있습니다 (다양한 타입이 허용됨).
- 아이템은 오직 하나의 트랙에만 속할 수 있습니다.
- 트랙 내의 아이템들은 겹칠 수 없습니다.

## 아이템

아이템의 타입은 [`EditorStarterItem`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20type%20EditorStarterItem&type=code) 유니온으로 정의됩니다.
기본적으로 다음 아이템들이 있습니다:

- [`ImageItem`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+type+ImageItem&type=code)
- [`TextItem`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+type+textItem&type=code)
- [`VideoItem`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+type+videoitem&type=code)
- [`GifItem`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+type+gifitem&type=code)
- [`SolidItem`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+type+soliditem&type=code)
- [`AudioItem`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+type+soliditem&type=code)
- [`CaptionsItem`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+type+captionsitem&type=code)

새로운 아이템 타입을 추가하려면, 기존 아이템 중 하나의 로직을 복사하고 수정한 후, [`EditorStarterItem`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20type%20EditorStarterItem&type=code) 유니온에 추가하세요.
콘솔에서 타입 체커를 실행하면 많은 오류가 나타날 것입니다: `npx tsc -w`

이러한 오류들은 의도적인 것이며, 새로운 아이템 타입을 지원하기 위해 특정 항목들의 구현을 추가해야 하는 코드의 위치를 안내하기 위한 것입니다.

## 애셋

다양한 애셋 타입은 [`EditorStarterAsset`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20type%20EditorStarterAsset&type=code) 유니온으로 정의됩니다.
기본적으로 다음 애셋들이 있습니다:

- [`ImageAsset`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+type+ImageAsset&type=code)
- [`VideoAsset`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+type+VideoAsset&type=code)
- [`GifAsset`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+type+GifAsset&type=code)
- [`AudioAsset`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+type+AudioAsset&type=code)
- [`CaptionAsset`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+type+CaptionAsset&type=code)

새로운 아이템 타입을 추가하려면, 기존 아이템 중 하나의 로직을 복사하고 수정한 후, [`EditorStarterAsset`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20type%20EditorStarterAsset&type=code) 유니온에 추가하세요.
콘솔에서 타입 체커를 실행하면 일부 오류가 나타날 것입니다: `npx tsc -w`

새로운 애셋 타입의 구현을 완료하려면 이러한 오류들을 해결하세요.

## 인스펙터

각 아이템 타입은 오른쪽 사이드바에 마운트될 수 있는 React 컴포넌트인 "인스펙터" 컴포넌트를 가지고 있습니다.
인스펙터는 아이템과 연결된 애셋에 대한 정보도 표시할 수 있습니다.

아이템이 선택되지 않은 경우, 전역 설정을 위한 특별한 인스펙터가 표시됩니다.
[`<Inspector />` 컴포넌트](https://github.com/remotion-dev/editor-starter/blob/main/src/editor/inspector/inspector.tsx)의 소스 코드를 참조하세요.
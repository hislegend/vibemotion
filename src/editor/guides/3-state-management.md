# Editor Starter의 상태 관리

[Editor Starter](/docs/editor-starter)의 상태는 React의 내장 상태 관리 유틸리티인 [`useState()`](https://react.dev/reference/react/useState)와 [`useContext()`](https://react.dev/reference/react/useContext)를 사용하여 관리됩니다.

<details>
<summary>왜 이렇게 했을까요?</summary>

Editor Starter는 가능한 한 많은 다양한 팀이 쉽게 채택할 수 있도록 구축되었습니다.

스타터 키트를 가볍게 유지하고, 외부 의존성을 최소화하며, 이미 React에 익숙한 개발자들에게 친숙한 패턴을 활용하기 위해 React의 네이티브 상태 관리를 사용하기로 선택했습니다.

기본 React 상태 관리 유틸리티는 일부에게는 논란이 될 수 있지만, 모든 React 애플리케이션에서 사용할 수 있으며 개발자들이 가장 익숙한 도구입니다.
</details>

## 구조

Editor Starter의 전체 상태는 [`EditorState`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20type%20EditorState&type=code)에 의해 정의된 구조를 가진 단일 객체에 저장됩니다.

```ts
type DeletedAsset = {
  remoteUrl: string | null;
  remoteFileKey: string | null;
  assetId: string;
  statusAtDeletion: AssetState;
};

export type UndoableState = {
  tracks: TrackType[];
  assets: Record<string, EditorStarterAsset>;
  items: Record<string, EditorStarterItem>;
  fps: number;
  compositionWidth: number;
  compositionHeight: number;
  deletedAssets: DeletedAsset[];
};

export type EditorState = {
  undoableState: UndoableState;
  selectedItems: string[];
  textItemEditing: string | null;
  textItemHoverPreview: TextItemHoverPreview | null;
  renderingTasks: RenderingTask[];
  captioningTasks: CaptioningTask[];
  initialized: boolean;
  itemsBeingTrimmed: ItemBeingTrimmed[];
  loop: boolean;
  assetStatus: Record<string, AssetState>;
};
```

- [**`undoableState`**](#undoable-state) - 실행 취소 스택의 영향을 받는 상태:
  - `tracks`: [타임라인 트랙](/docs/editor-starter/tracks-items-assets)의 배열, 마지막 것들이 뒤쪽에 렌더링됩니다.
  - `assets`: 에디터에 업로드된 모든 [애셋](/docs/editor-starter/tracks-items-assets)의 맵입니다.
  - `items`: 에디터에 추가된 모든 [아이템](/docs/editor-starter/tracks-items-assets)의 맵입니다.
  - `fps`: 프레임 레이트 (상태에 보관되지만, [기본적으로 이를 변경할 수 있는 UI는 노출되지 않습니다](/docs/editor-starter/features-not-included#multiple-frame-rates)).
  - `compositionWidth`: 캔버스의 너비입니다.
  - `compositionHeight`: 캔버스의 높이입니다.
  - `deletedAssets`: [삭제된](/docs/editor-starter/asset-cleanup) 애셋들의 배열입니다.

- `selectedItems`: 현재 선택된 아이템 ID들의 배열입니다.
- `textItemEditing`: 현재 편집 중인 텍스트 아이템의 ID (있는 경우)입니다.
- `textItemHoverPreview`: 텍스트 아이템의 미리보기 업데이트 (예: 폰트 피커에서 폰트를 호버하면 텍스트가 해당 폰트로 일시적으로 렌더링됨)입니다.
- `renderingTasks`: 렌더링 프로세스의 상태입니다.
- `captioningTasks`: 자막 처리 프로세스의 상태입니다.
- `initialized`: 에디터가 초기화되었는지 여부이며, 초기화되지 않으면 캔버스가 보이지 않습니다.
- `itemsBeingTrimmed`: 현재 트림 중인 아이템들의 배열로, 가능한 최대 트림을 표시하기 위해 사용됩니다.
- `loop`: 재생이 루프되어야 하는지 여부입니다.
- `assetStatus`: 애셋 ID와 업로드 상태를 매핑하는 맵으로, 다음과 같은 상태가 가능합니다:
  - `pending-upload`: 애셋이 현재 업로드 중입니다.
  - `uploaded`: 애셋이 성공적으로 업로드되었습니다.
  - `error`: 애셋 업로드가 실패했습니다.
  - `in-progress`: 애셋이 아직 업로드되지 않았습니다.

## 실행 취소 가능한 상태

상태는 실행 취소 가능한 부분과 실행 취소 불가능한 부분으로 분리됩니다.
실행 취소 가능한 상태는 루트 상태의 `undoableState` 객체 내에 위치합니다.

**실행 취소 가능한 상태**에는 다음이 포함될 수 있습니다:
- 아이템의 위치, 크기 및 기타 속성
- 애셋과 트랙
- 차원 및 프레임 레이트와 같은 비디오 속성

**실행 취소 불가능한 상태**에는 다음이 포함될 수 있습니다:
- 애셋 업로드 진행률 및 상태
- 자막 처리 진행률
- 줌 레벨
- 렌더링 상태
- 선택 상태

참조: [실행 취소 및 다시 실행](/docs/editor-starter/undo-redo)

## 컨텍스트

[`src/editor-context-provider.tsx`](https://github.com/remotion-dev/editor-starter/blob/main/src/editor/context-provider.tsx)에서 다양한 컨텍스트 프로바이더들의 매우 깊게 중첩된 트리를 볼 수 있습니다.

이는 의도적인 것으로, 상태의 일부분을 업데이트할 때 해당 상태 부분에 의존하는 컴포넌트만 다시 렌더링되고, 나머지 컴포넌트는 다시 렌더링되지 않도록 하는 효과를 얻습니다.

최상의 성능을 위해 자신의 애플리케이션에서도 이 패턴을 계속 사용하는 것을 권장합니다.

## 변경사항이 없을 때 상태 업데이트 방지

아무것도 변경되지 않았을 때는 불필요한 상태 업데이트를 방지해야 합니다.

- 이는 성능에 더 좋습니다
- [이렇게 하면 실행 취소 스택에 스냅샷을 추가하는 것을 방지할 수 있어, 실행 취소 버튼을 한 번 클릭했을 때 아무 효과가 없는 상황을 막을 수 있습니다](/docs/editor-starter/undo-redo#preventing-unnecessary-additions-to-the-undo-stack)

코드베이스 전체에서 불필요한 상태 업데이트를 방지하는 검사를 볼 수 있습니다.

```ts
export const markAsDragging = (state: EditorState, itemId: string): EditorState => {
  return changeItem(state, itemId, (item) => {
    if (item.isDragging) {
      // 아이템이 변경되지 않을 것이므로 원본 객체를 반환합니다
      return item;
    }

    return {
      ...item,
      isDragging: true,
    };
  });
};
```

## 명령적으로 상태 읽기

상호 작용 시에만 상태에 액세스해야 하는 경우 [`useCurrentStateAsRef()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20const%20useCurrentStateAsRef&type=code) 훅을 사용할 수 있습니다.
이를 통해 필요할 때 명령적으로 상태에 액세스할 수 있습니다.

이것으로는 반응형 UI를 구축할 수 없지만, 상태가 변경될 때 다시 렌더링되는 훅을 사용하는 것보다 더 성능이 좋습니다.

예시: 사용자가 클릭할 때만 상태에 액세스하면 되는 저장 버튼.

## 참조

- [실행 취소 및 다시 실행](/docs/editor-starter/undo-redo)
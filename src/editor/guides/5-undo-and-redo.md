# 실행 취소 및 다시 실행

Editor Starter는 기본적인 실행 취소 및 다시 실행 기능을 구현합니다.
이는 에디터의 [실행 취소 가능한 상태](/docs/editor-starter/state-management#undoable-state) 스냅샷 배열을 메모리에 보관하는 방식으로 작동합니다.

## 실행 취소 스택

실행 취소 스택은 메모리에 보관되는 이전 상태들의 배열입니다.
기본적으로 실행 취소 스택은 50개의 상태를 보관합니다.

상태를 업데이트할 때마다, 해당 상태 업데이트가 실행 취소 스택에 커밋되어야 하는지를 나타내기 위해 `commitToUndoStack` 속성을 적절히 설정해야 합니다.

실행 취소 스택에 추가하지 않으려는 액션은 다음과 같은 고빈도 상태 업데이트입니다:

- 캔버스에서 아이템 드래그하기
- 타임라인에서 아이템 드래그하기
- 타임라인에서 아이템 트림하기
- 인스펙터에서 슬라이더로 값 변경하기

이런 경우에는 **마우스 커서가 해제될 때**만 실행 취소 스택에 커밋하는 것이 적절합니다.

## 실행 취소 스택에 불필요한 추가 방지

실행 취소 스택은 상태 객체 참조가 실제로 변경될 때만 새로운 항목을 추가합니다.
상태 업데이트로 인해 `oldState === newState`가 `true`로 평가되면, 실행 취소 스택에 항목이 추가되지 않습니다.

자세한 정보는 [변경사항이 없을 때 상태 업데이트 방지](/docs/editor-starter/state-management#preventing-state-updates-when-nothing-has-changed)를 참조하세요.

## 실행 취소 및 다시 실행 상호작용

다음 방법으로 작업을 실행 취소하고 다시 실행할 수 있습니다:

- 버튼 사용
- 내장 키보드 단축키: 실행 취소는 <kbd>Ctrl</kbd> + <kbd>Z</kbd>, 다시 실행은 <kbd>Ctrl</kbd> + <kbd>Y</kbd>

이 동작은 다음 [플래그](/docs/editor-starter/features)에 의해 제어됩니다:

- [`FEATURE_UNDO_BUTTON`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20FEATURE_UNDO_BUTTON&type=code)
- [`FEATURE_REDO_BUTTON`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20FEATURE_REDO_BUTTON&type=code)
- [`FEATURE_UNDO_SHORTCUT`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20FEATURE_UNDO_SHORTCUT&type=code)
- [`FEATURE_REDO_SHORTCUT`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20FEATURE_REDO_SHORTCUT&type=code)

## 참조

- [상태 관리](/docs/editor-starter/state-management)
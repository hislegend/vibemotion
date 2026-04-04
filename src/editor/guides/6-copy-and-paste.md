# Editor Starter의 복사 및 붙여넣기

Remotion Editor Starter는 레이어에서 복사 및 붙여넣기 기능을 구현합니다.

## 고려사항

브라우저의 [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)를 읽을 때, 다음 MIME 타입만 지원됩니다:

- `text/plain`
- `text/html`
- `image/png`

이 중 어느 것도 아이템 복사에 이상적인 MIME 타입은 아닙니다.

따라서 [Figma](https://figma.com/)와 [tldraw](https://tldraw.com/)에서 사용하는 해결책을 사용합니다: 아이템들을 직렬화하여 `<div>` 안에 넣은 다음 `text/html` MIME 타입으로 클립보드에 복사합니다. 이렇게 하면 `text/plain` 슬롯을 덮어쓰지 않습니다.

## 복사-붙여넣기 방법

복사 및 붙여넣기는 아이템을 마우스 오른쪽 버튼으로 클릭하거나 표준 키보드 단축키를 사용하여 작동합니다:

- <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>X</kbd> 잘라내기
- <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>C</kbd> 복사하기
- <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>V</kbd> 붙여넣기

## 붙여넣기

콘텐츠를 붙여넣을 때, Editor Starter는 먼저 클립보드 데이터가 `text/html` MIME 타입을 가지고 있는지 확인하고 `<div>`의 내용을 아이템으로 역직렬화합니다.

아이템들은 복사되어 새로운 고유 ID가 할당된 후 타임라인의 맨 위에 추가됩니다.

## 커스터마이징

복사-붙여넣기 로직은 [`src/editor/clipboard`](https://github.com/remotion-dev/editor-starter/tree/main/src/editor/clipboard)에서 찾을 수 있습니다.

## 참조

- [기능](/docs/editor-starter/features)
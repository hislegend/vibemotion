# Editor Starter의 지속성

Editor Starter에는 3가지 유형의 지속성이 있습니다:

- 에디터 상태 저장
- IndexedDB에 [애셋](/docs/editor-starter/tracks-items-assets) (비디오, 이미지, 오디오 등) 캐싱
- 루프 설정 저장

## 에디터 상태 저장

[`saveState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20const%20saveState&type=code)와 [`loadState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20const%20loadState&type=code) 함수는 에디터 상태를 저장하고 로드하는 데 사용됩니다.

### 위치

기본적으로 상태는 브라우저의 로컬 스토리지에 저장됩니다.

원격으로 상태를 저장하려면 다음을 할 수 있습니다:

1. 이 함수들의 구현을 변경
2. 이 함수들을 프로미스로 변환
3. 사용할 때 `await` 적용

### 저장 트리거

상태를 저장하는 2가지 방법이 있습니다:

- 상단 도구 모음의 "저장" 버튼 클릭
- 키보드 단축키 <kbd>Cmd</kbd>/<kbd>Ctrl</kbd> + <kbd>S</kbd> 사용 ([소스](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+const+SaveShortcut&type=code))

상태를 자동으로 저장하려면 [자동 저장](/docs/editor-starter/features-not-included#auto-save) 기능 구현에 대한 제안을 참조하세요.

### 범위

기본적으로 [실행 취소 가능한 상태](/docs/editor-starter/state-management#undoable-state)만 지속됩니다.

Editor Starter는 실행 취소 가능한 상태 부분이 지속되어야 할 상태라는 단순화된 가정을 가지고 있습니다.

실행 취소 불가능한 상태의 일부도 지속하려면, [`saveState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20const%20saveState&type=code)와 [`loadState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20const%20loadState&type=code) 함수에서 더 많은 데이터를 받을 수 있습니다.

### 비활성화

저장 기능은 [`FEATURE_SAVE_BUTTON`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20FEATURE_SAVE_BUTTON&type=code)과 [`FEATURE_SAVE_SHORTCUT`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20FEATURE_SAVE_SHORTCUT&type=code) 기능 플래그 뒤에 있습니다.

저장 기능을 비활성화하려면 플래그를 비활성화하거나 플래그와 그 뒤에 있는 모든 코드를 삭제하세요.

### 지속성 키

`saveState()`와 `loadState()` 함수의 기본 구현을 사용할 때, 상태는 브라우저의 로컬 스토리지에 버전이 지정된 키(예: `const key = 'remotion-editor-starter-state-v1'`) 하에 저장됩니다.

런타임에 작동하는 스키마와 호환되는 상태만 이 키에 저장해야 합니다.
상태 구조를 변경하는 경우, 키의 버전을 증가시키거나 로드 시 상태를 새 스키마로 마이그레이션하는 것을 고려하세요.

## 애셋 캐싱

원격으로 애셋을 로드하는 것이 느릴 수 있기 때문에, Editor Starter는 이를 IndexedDB에 캐시하고 표시할 때 원격 애셋보다 우선적으로 사용합니다.

[`indexeddb.ts`](https://github.com/remotion-dev/editor-starter/blob/main/src/editor/caching/indexeddb.ts) 파일에는 IndexedDB의 구현이 포함되어 있습니다.

애셋은 더 이상 필요하지 않을 때 수동으로 정리해야 합니다: [애셋 정리](/docs/editor-starter/asset-cleanup)

[`<DownloadRemoteAssets>`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20DownloadRemoteAssets&type=code) 컴포넌트는 원격에 있는 모든 애셋을 다운로드하고 로컬에 캐시합니다.

[`<UseLocalCachedAssets>`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20UseLocalCachedAssets&type=code) 컴포넌트는 IndexedDB에서 캐시된 애셋을 로드하고 이를 blob URL로 변환합니다.
또한 [`initialize()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+const+initialize&type=code) 함수는 가능한 경우 원격 서버에 대한 요청을 방지하기 위해 초기 에디터 상태가 로드되기 전에 IndexedDB에서 캐시된 애셋을 로드합니다.

## 루프 설정

[`src/editor/state/loop-persistance.ts`](https://github.com/remotion-dev/editor-starter/blob/main/src/editor/state/loop-persistance.ts)에는 루프 설정을 지속하는 로직이 있습니다.

## 참조

- [애셋 업로드](/docs/editor-starter/asset-uploads)
- [애셋 정리](/docs/editor-starter/asset-cleanup)
# Editor Starter의 폰트

Editor Starter는 텍스트 및 자막 아이템에서 사용되는 폰트를 제어하기 위한 다양한 기능을 제공합니다.
폰트 스택은 [`@remotion/google-fonts`](/docs/google-fonts)를 기반으로 구현되었습니다.

## 지원되는 폰트 기능

- 폰트 패밀리 변경 ("Helvetica" / "Roboto")
- 폰트 스타일 변경 ("Regular" / "Bold" / "Italic")
- 폰트 크기 변경
- 텍스트 색상 변경
- 폰트 스트로크 변경 (두께와 색상)
- 줄 높이 변경
- 글자 간격 변경
- 텍스트 정렬 변경 ("Left" / "Center" / "Right")
- 텍스트 방향 변경 (아랍어와 같은 우에서 좌로 읽는 언어 지원)

텍스트 제어 기능은 대부분 [`TextInspector`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20TextInspector&type=code) 컴포넌트에 집중되어 있습니다.

## 기본 폰트 패밀리

기본적으로 [Google Fonts에서 가장 인기 있는 상위 250개 폰트](/docs/font-picker#show-only-the-250-most-popular-google-fonts)가 폰트 선택기에 포함됩니다.
추가로 `TikTok Sans`가 추가되었는데, 이는 TikTok의 기본 폰트이기 때문입니다.

### 기본 폰트 패밀리 변경

포함하고자 하는 폰트를 변경하려면 [`generate-google-font-info.ts`](https://github.com/remotion-dev/editor-starter/blob/main/src/scripts/generate-google-font-info.ts) 스크립트를 수정하세요.

더 많은 폰트 목록을 얻으려면 [폰트 피커 문서](/docs/font-picker)를 참조하세요.

그런 다음 다음을 실행하세요:

```bash
bun src/scripts/generate-google-font-info.ts
```

`src/editor/data`에 필요한 파일들을 재생성합니다.

## 폰트 메타데이터 지연 로딩

모든 폰트는 사용 가능한 폰트 패밀리, 폰트 스타일, 폰트 가중치, 폰트 표시, 폰트 서브셋, 폰트 변형 및 폰트 파일 링크를 포함하는 메타데이터를 가지고 있습니다.

250개의 기본 폰트 모두에 대한 이 모든 메타데이터를 클라이언트에 저장하면 이미 번들 크기가 10MB 증가하게 됩니다.

이 때문에 폰트 메타데이터는 백엔드에 저장되고 필요한 폰트의 메타데이터만 클라이언트로 로드됩니다. 이것이 [`GET /api/font/:name`](/docs/editor-starter/backend-routes#get-apifontname) 엔드포인트가 있는 이유입니다.

## 폰트 드롭다운의 미리보기

폰트 드롭다운의 각 폰트 패밀리는 해당 폰트로 렌더링됩니다.
이를 위해 폰트 패밀리를 렌더링하는 데 필요한 문자만 포함하는 특별한 폰트 파일이 Google Fonts CDN에서 로드됩니다.

작동 방식을 확인하려면 [`FEATURE_FONT_FAMILY_DROPDOWN_RENDER_IN_FONT`](/docs/editor-starter/features#font-family-preview) 기능을 참조하세요.

## 호버로 폰트 패밀리 미리보기

폰트 드롭다운의 항목 위에 마우스를 올리면, 캔버스의 텍스트 아이템이 호버된 항목이 선택되었을 때의 모습으로 미리보기가 업데이트됩니다.

작동 방식을 확인하려면 [`FEATURE_FONT_FAMILY_DROPDOWN_HOVER_PREVIEW`](/docs/editor-starter/features#hover-to-preview-font-family) 기능을 참조하세요.

## 커스텀 폰트

Google Fonts 이외의 소스에서 폰트를 로드하는 것은 Editor Starter에서 예상되지 않습니다.
다른 소스에서 폰트를 로드할 수 있도록 Editor Starter를 리팩터링해야 합니다. 이를 위해 [`@remotion/fonts`](/docs/fonts-api)를 사용하는 것을 권장합니다.
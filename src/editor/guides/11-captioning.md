# Editor Starter의 자막 처리

Editor Starter는 비디오 및 오디오 애셋에 대한 자막을 생성하는 방법을 제공합니다.
기본적으로 OpenAI Whisper API를 사용합니다.

구현 세부사항은 [`src/editor/captioning`](https://github.com/remotion-dev/editor-starter/tree/main/src/editor/captioning)의 소스 코드를 참조하세요.

Editor Starter에서 자막은 비디오, 이미지, 오디오와 유사한 일급 [아이템 타입](/docs/editor-starter/tracks-items-assets#items)으로 취급됩니다. 이를 통해 타임라인과 캔버스의 다른 레이어처럼 조작할 수 있습니다.

## OpenAI Whisper를 사용한 설정 (권장)

OpenAI의 Whisper 모델을 사용하여 자막을 생성하려면, `.env` 파일에 OpenAI 키를 추가하세요:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```

이렇게 하면 [`/api/captions`](/docs/editor-starter/backend-routes#post-apicaptions) 백엔드 라우트가 있는 경우 서버 측 전사가 활성화됩니다.

비디오 또는 오디오 레이어에서 "자막 생성"을 클릭하면:

1. 오디오가 클라이언트 측에서 추출됩니다.
2. [`/api/captions`](/docs/editor-starter/backend-routes#post-apicaptions)에 업로드하고 OpenAI를 통해 전사합니다 (참고: [25MB 제한이 적용됩니다](/docs/editor-starter/features-not-included#captioning-long-audio-files))
3. OpenAI의 응답을 Remotion의 [`Caption`](/docs/captions/caption) 타입으로 변환하고 [`CaptionsItem`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+type+captionsitem&type=code)으로 타임라인에 추가합니다.

## 편집

[인스펙터](/docs/editor-starter/tracks-items-assets#inspectors)를 통해 사용자는 기본적으로 다음 자막 속성을 편집할 수 있습니다:

- 개별 토큰
- 타이포그래피: 폰트, 텍스트 색상, 강조된 단어 색상, 텍스트 투명도, 텍스트 스트로크 너비 및 색상
- 페이지 지속시간
- 개별 단어의 타이밍 조정

## 자동 페이지 생성

자막은 관리를 쉽게 하기 위해 자동으로 "페이지"로 분할됩니다. 페이지는 화면에 잘 맞는 단어나 문장의 시간 그룹입니다. 이는 [`@remotion/captions`](/docs/captions) 패키지의 [`createTikTokStyleCaptions`](/docs/captions/create-tiktok-style-captions)을 사용하여 달성됩니다.

## 제한사항

기본 자막 처리 방법은 요청당 25MB 제한이 있는 OpenAI Whisper API를 사용하는 것입니다.

16Khz 샘플 레이트에서 이는 약 13.4분의 모노 오디오입니다.
기본적으로 Editor Starter는 오디오가 이보다 긴 경우 자막 기능을 비활성화합니다.

이를 조정하려면 [`MAX_DURATION_ALLOWING_CAPTIONING_IN_SEC`의 로직](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20MAX_DURATION_ALLOWING_CAPTIONING_IN_SEC&type=code)을 검토하세요.

## 대안

### `@remotion/whisper-web`

로컬 브라우저 내 전사를 위해 OpenAI Whisper API를 [`@remotion/whisper-web`](/docs/whisper-web)로 교체할 수 있습니다.
이렇게 하면 OpenAI 키와 전사를 위한 S3 가져오기가 필요 없어지지만, 여전히 오디오 로딩을 로컬에서 처리해야 합니다.

주의사항:

- 성능: 전사가 브라우저의 CPU에서 실행되어 OpenAI의 클라우드 서비스와 같은 GPU 가속 옵션보다 상당히 느릴 수 있습니다.
- 모델 크기: 작은 모델(예: 'tiny')은 빠르지만 정확도가 떨어지고, 큰 모델은 더 많은 메모리와 공간이 필요합니다.
- 앱에 대해 [교차 출처 격리를 활성화](/docs/whisper-web/can-use-whisper-web#important-considerations)해야 합니다.

### `@remotion/install-whisper-cpp`

Node.js 서버에서 오디오를 전사하기 위해 [`@remotion/install-whisper-cpp`](/docs/install-whisper-cpp)를 사용할 수 있습니다.

주의사항:

- 비용이 많이 들고 복잡할 수 있는 서버 호스팅 및 확장에 대한 책임이 있습니다.

### 기타 대안

모든 전사 방법을 사용할 수 있습니다.
자막 렌더링 및 편집을 리팩터링할 필요가 없도록 자막을 [`Caption`](/docs/captions/caption) 형태로 변환하는 것을 권장합니다.

## 참조

- [`@remotion/captions`](/docs/captions)
- [`@remotion/whisper-web`](/docs/whisper-web)
- [`@remotion/install-whisper-cpp`](/docs/install-whisper-cpp)
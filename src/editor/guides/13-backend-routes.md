# Editor Starter의 백엔드 라우트

모든 기능이 작동하려면 일부 백엔드 엔드포인트를 구현해야 합니다.
기본 구현은 React Router 7 프레임워크를 사용합니다.

### `POST /api/captions`

오디오 파일을 기반으로 비디오에 대한 자막을 생성하는 데 사용됩니다.

- [React Router 7를 사용한 참조 구현](https://github.com/remotion-dev/editor-starter/blob/main/src/routes/api/captions.ts)
- [Next.js를 사용한 구현](https://gist.github.com/MehmetAdemi/545f0fcdf2f8b8f9edbbc5146bde0a74)
- [사용 예시 보기](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20%2Fapi%2Fcaptions&type=code)

### `GET /api/font/:name`

사용 가능한 가중치와 스타일 및 해당 Google Fonts URL과 같은 특정 폰트에 대한 메타데이터를 반환합니다.
모든 기본 폰트의 메타데이터가 10MB 이상이 될 수 있기 때문에 이 정보는 백엔드에서 제공됩니다.

- [React Router 7를 사용한 참조 구현](https://github.com/remotion-dev/editor-starter/blob/main/src/routes/api/font.ts)
- [Next.js를 사용한 구현](https://gist.github.com/MehmetAdemi/4ddefd93123d718cbfdbc3190d2e8434)
- [사용 예시 보기](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20%2Fapi%2Ffont&type=code)

### `POST /api/upload`

S3에 파일을 업로드하기 위한 미리 서명된 URL을 생성하는 데 필요합니다.

- [React Router 7를 사용한 참조 구현](https://github.com/remotion-dev/editor-starter/blob/main/src/routes/api/upload.ts)
- [Next.js를 사용한 구현](https://gist.github.com/MehmetAdemi/a1c83d97fcaf2c773c2913dbd2471de0)
- [사용 예시 보기](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20%2Fapi%2Fupload&type=code)

### `POST /api/render`

Remotion Lambda에서 렌더를 트리거합니다.

- [React Router 7를 사용한 참조 구현](https://github.com/remotion-dev/editor-starter/blob/main/src/routes/api/render.ts)
- [Next.js를 사용한 구현](https://gist.github.com/MehmetAdemi/a96784de92ee91e4907bdedb20e6b90c)
- [사용 예시 보기](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20%2Fapi%2Frender&type=code)

### `POST /api/progress`

Remotion Lambda에서 렌더의 현재 진행 상황을 가져옵니다.

- [React Router 7를 사용한 참조 구현](https://github.com/remotion-dev/editor-starter/blob/main/src/routes/api/progress.ts)
- [Next.js를 사용한 구현](https://gist.github.com/MehmetAdemi/15c21e1b847e5e79e7df7b2c4d5dc494)
- [사용 예시 보기](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20%2Fapi%2Fprogress&type=code)